import { Injectable } from "@nestjs/common";
import { prisma } from "../../config/prisma-connection";
import { CustomError } from "../../err/custom/Error.filter";
import { sendEmail } from "../../utils/email/nodemailer";
import { getMembershipTemplate } from "../../utils/email/template/get-membership";
import { recoverTemplate } from "../../utils/email/template/recover-template";
import { termsTemplate } from "../../utils/email/template/terms-template";
import { BuyerService } from "../buyer/buyer.service";
import { SellerService } from "../seller/seller.service";
import { TokenService } from "../token/token.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { GetMembershipDto } from "./dto/get-membership.dto";
import { MembershipDto } from "./dto/membership.dto";
import { TransactionsDto } from "./dto/transactions.dto";

@Injectable()
export class EmailService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly buyerService: BuyerService,
    private readonly sellerService: SellerService,
  ) {}

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async forgotPassword(data: ForgotPasswordDto) {
    const { email } = data;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (!userExists) throw new CustomError("E-mail não existe");

    const token = this.tokenService.generateToken(email);
    const pagina = `${process.env.FRONTEND_HOST}/recuperar-senha/${token}`;
    const emailBodyClient = recoverTemplate(email, pagina);
    try {
      await this.delay(2000);
      sendEmail("Recuperação de Senha na Reurb", emailBodyClient, email);
    } catch (err) {
      throw new CustomError("Muitos e-mails enviados ao mesmo tempo, aguarde um pouco");
    }

    return true;
  }

  async receiveMembership(data: MembershipDto) {
    const emailBodyClient = termsTemplate(data.nome, data.email, data.telefone, data.cep);
    try {
      await this.delay(2000);
      sendEmail("Formulário de Adesão", emailBodyClient);
    } catch (err) {
      throw new CustomError("Muitos e-mails enviados ao mesmo tempo, aguarde um pouco");
    }

    return true;
  }

  async sendMembership(data: GetMembershipDto) {
    const token = this.tokenService.generateToken(data.email);
    const pagina = `${process.env.FRONTEND_HOST}/formulario-adesao/${token}`;
    const emailBodyClient = getMembershipTemplate(data.nome, data.email, pagina);
    try {
      await this.delay(2000);
      sendEmail("Formulário de Registro na Reurb", emailBodyClient, data.email);
    } catch (err) {
      throw new CustomError("Muitos e-mails enviados ao mesmo tempo, aguarde um pouco");
    }

    return true;
  }

  async sendTransactions(data: TransactionsDto) {
    const { vendas, compras } = data;
    if (!Array.isArray(vendas) || !Array.isArray(compras)) {
      throw new CustomError("Vendas e Compras devem ser arrays");
    }
    /* Validação de cadastro do Comprador */
    const AllTimes = vendas.map((venda) => venda.dataHoraTransacao);
    const allSellCounterparties = vendas.map((venda) => venda.apelidoComprador);
    const allSellExchanges = vendas.map((venda) => venda.exchangeUtilizada);
    const allDocumentos = vendas
      .map((venda) => ({
        documento: venda.documentoComprador,
        nome: venda.nomeComprador,
        apelido: venda.apelidoComprador,
        exchange: venda.exchangeUtilizada,
      }))
      .filter(({ documento }) => documento && documento.trim() !== "");

    if (allDocumentos.length > 0) {
      const documentoList = allDocumentos.map(({ documento }) => documento);
      const registeredDocumentos = await this.buyerService.findByDocument(documentoList);
      const unregisteredDocumentos = allDocumentos.filter(
        ({ documento }) => !registeredDocumentos.includes(documento),
      );
      console.log("1");
      if (unregisteredDocumentos.length > 0) {
        try {
          await this.buyerService.registerBuyers(unregisteredDocumentos);
        } catch (error) {
          throw new CustomError(`Erro ao cadastrar CPF(s)/CNPJ(s): ${error.message}`);
        }
      }
    }

    /* Validação de cadastro do Vendedor */
    const allBuyCounterparties = compras.map((compra) => compra.apelidoVendedor);
    const allBuyExchanges = compras.map((compra) => compra.exchangeUtilizada);

    const buyers = await this.buyerService.findByCounterpartyAndExchange(
      allSellCounterparties,
      allSellExchanges,
    );
    const registeredCounterpartyBuyer = buyers.map((buyer) => buyer.counterparty);
    const unregisteredCounterpartyBuyerDetails = allSellCounterparties
      .map((counterparty, index) => ({
        counterparty,
        dataHoraTransacao: AllTimes[index],
      }))
      .filter(({ counterparty }) => !registeredCounterpartyBuyer.includes(counterparty));

    if (unregisteredCounterpartyBuyerDetails.length > 0) {
      const details = unregisteredCounterpartyBuyerDetails
        .map(({ counterparty, dataHoraTransacao }) => `${counterparty} - ${dataHoraTransacao} `)
        .join("/ ");
      throw new CustomError(`Preencha CPF e nome, compradores não cadastrados: ${details}`);
    }

    /* Validação e registro de novos vendedores */
    const sellers = await this.sellerService.findByCounterpartyAndExchange(
      allBuyCounterparties,
      allBuyExchanges,
    );
    const registeredCounterpartySeller = sellers.map((seller) => seller.counterparty);
    const unregisteredCounterpartySeller = allBuyCounterparties
      .filter((counterparty) => !registeredCounterpartySeller.includes(counterparty))
      .map((counterparty) => {
        const compra = compras.find((compra) => compra.apelidoVendedor === counterparty);
        return {
          nome: compra?.nomeVendedor ?? "",
          apelido: counterparty,
          exchange: compra?.exchangeUtilizada ?? "",
        };
      });

    if (unregisteredCounterpartySeller.length > 0) {
      try {
        await this.sellerService.registerSellers(unregisteredCounterpartySeller);
      } catch (error) {
        throw new CustomError(`Erro ao cadastrar vendedor: ${error.message} `);
      }
    }

    /* Envio de dados para TXT */
    const compradoresMapeados = await this.buyerService.findByCounterparty(allSellCounterparties);
    const vendedoresMapeados = await this.sellerService.findByCounterparty(allBuyCounterparties);

    const vendasComNome = vendas.map((venda) => {
      const comprador = compradoresMapeados.find(
        (buyer) => buyer.counterparty === venda.apelidoComprador,
      );
      return {
        ...venda,
        id: comprador ? comprador.id : null,
        nomeComprador: comprador ? comprador.name : venda.nomeComprador,
        documentoComprador: comprador ? comprador.document : venda.documentoComprador,
      };
    });

    const comprasComNome = compras.map((compra) => {
      const vendedor = vendedoresMapeados.find(
        (seller) => seller.counterparty === compra.apelidoVendedor,
      );
      return {
        ...compra,
        id: vendedor ? vendedor.id : null,
        nomeVendedor: vendedor ? vendedor.name : compra.nomeVendedor,
      };
    });

    // Registro das ordens de compra e venda no banco de dados
    await prisma.$transaction(async (prisma) => {
      for (const venda of vendasComNome) {
        const existingOrder = await prisma.order.findFirst({
          where: {
            numeroOrdem: venda.numeroOrdem,
            exchange: venda.exchangeUtilizada,
          },
        });

        if (existingOrder) {
          throw new CustomError(
            `Ordem com número ${venda.numeroOrdem} já existe na exchange ${venda.exchangeUtilizada.split(" ")[0]} `,
          );
        }

        await prisma.order.create({
          data: {
            createdIn: new Date(venda.dataHoraTransacao),
            numeroOrdem: venda.numeroOrdem,
            dataTransacao: venda.dataHoraTransacao,
            exchange: venda.exchangeUtilizada,
            ativoDigital: venda.ativoDigital,
            quantidade: venda.quantidadeVendida,
            valor: venda.valorVenda,
            valorToken: venda.valorTokenDataVenda,
            taxaTransacao: venda.taxaTransacao,
            tipo: "venda",
            buyer: {
              connect: { id: venda.id },
            },
          },
        });
      }

      for (const compra of comprasComNome) {
        await prisma.order.create({
          data: {
            createdIn: new Date(compra.dataHoraTransacao),
            numeroOrdem: compra.numeroOrdem,
            dataTransacao: compra.dataHoraTransacao,
            exchange: compra.exchangeUtilizada,
            ativoDigital: compra.ativoDigital,
            quantidade: compra.quantidadeComprada,
            valor: compra.valorCompra,
            valorToken: compra.valorTokenDataCompra,
            taxaTransacao: compra.taxaTransacao,
            tipo: "compra",
            seller: {
              connect: { id: compra.id },
            },
          },
        });
      }
    });
    // const emailBody = transactionsTemplate(vendasComNome, comprasComNome);
    // const subject = "Resumo das Transações Diárias";
    // try {
    //   await this.delay(2000);
    //   sendEmail(subject, emailBody, "matheuslink19@hotmail.com");
    // } catch (err) {
    //   throw new CustomError("Erro ao enviar e-mail: " + err);
    // }
    return true;
  }

  async listTransactions(startDate: string, endDate: string) {
    if (!startDate || !endDate)
      throw new CustomError("Por favor, forneça ambas as datas de início e fim.");

    const start = new Date(`${startDate} T00:00:00`);
    const end = new Date(`${endDate} T23: 59: 59`);

    // Busca no banco de dados as transações entre essas datas
    const transactions = await prisma.order.findMany({
      where: {
        createdIn: {
          gte: start,
          lte: end,
        },
      },
      include: {
        buyer: true,
        seller: true,
      },
    });

    return transactions;
  }
}
