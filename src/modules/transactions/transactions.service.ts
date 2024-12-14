import { Injectable } from "@nestjs/common";
import { prisma } from "../../config/prisma-connection";
import { CustomError } from "../../err/custom/Error.filter";
import { BuyerService } from "../buyer/buyer.service";
import { SellerService } from "../seller/seller.service";
import { TransactionsDto } from "./dto/transactions.dto";

@Injectable()
export class TransactionsService {
  constructor(
    private readonly buyerService: BuyerService,
    private readonly sellerService: SellerService,
  ) {}
  async sendTransactions(data: TransactionsDto) {
    const { vendas, compras } = data;
    if (!Array.isArray(vendas) || !Array.isArray(compras)) {
      throw new CustomError("Vendas e Compras devem ser arrays");
    }
    /* Validação de cadastro do Comprador */
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
    const unregisteredCounterpartyBuyerDetails = vendas
      .map((venda) => ({
        counterparty: venda.apelidoComprador,
        order: venda.numeroOrdem, // Supondo que exista o campo `numeroOrdem`
        dataHoraTransacao: venda.dataHoraTransacao,
        exchange: venda.exchangeUtilizada,
      }))
      .filter(({ counterparty }) => !registeredCounterpartyBuyer.includes(counterparty));

    if (unregisteredCounterpartyBuyerDetails.length > 0) {
      // Formata a mensagem de erro com detalhes do comprador e suas respectivas ordens
      const details = unregisteredCounterpartyBuyerDetails
        .map(
          ({ counterparty, order, dataHoraTransacao, exchange }) =>
            `Usuário: ${counterparty} | Ordem: ${order} | Data/Hora: ${dataHoraTransacao} | Exchange: ${exchange}`,
        )
        .join("\n");

      throw new CustomError(`Preencha CPF e nome. Compradores não cadastrados:\n${details}`);
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
            `Ordem ${venda.numeroOrdem} da data ${venda.dataHoraTransacao} já existe na ${venda.exchangeUtilizada.split(" ")[0]} `,
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
    if (!startDate || !endDate) {
      throw new CustomError("Por favor, forneça ambas as datas de início e fim.");
    }

    // Validando e criando objetos de data corretamente
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    // Verificar se as datas são válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      throw new CustomError("Datas fornecidas são inválidas.");

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
