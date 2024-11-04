import { Injectable } from "@nestjs/common";
import axios from "axios";
import { CustomError } from "../../err/custom/Error.filter";
import { BuyerService } from "../buyer/buyer.service";
import { SellerService } from "../seller/seller.service";
import { ComplianceDto } from "./dto/compliance.dto";
import { OperationDto } from "./dto/operations.dto";

@Injectable()
export class ComplianceService {
  constructor(
    private readonly buyerService: BuyerService,
    private readonly sellerService: SellerService,
  ) {}
  async validate(data: ComplianceDto) {
    const { documento } = data;
    const documentoClean = documento.replace(/\D/g, "");

    const portalDaTransparenciaUrl = "https://api.portaldatransparencia.gov.br/api-de-dados/";
    const msgErr = (m: string) => `falha ao validar ${m}`;

    const apiKeySwagger = "17326962a1b9461a5cf39e98e21734d0";
    const apiKeyInfoSimples = "nR1TnskfynTogH1BFR2oqZPZ4kAv4uAeIrprFbFm";
    // https://api.portaldatransparencia.gov.br/swagger-ui/index.html#/
    const results: any = {};

    const cpfExists = await this.buyerService.checkDocumentExists(documento);
    if (cpfExists) results.ourData = "O CPF já foi cadastrado";
    else results.ourData = "CPF não cadastrado, cadastre um novo comprador.";

    const fetchDataPortal = async (url: string, errorMsg: string) => {
      try {
        const response = await axios.get(`${portalDaTransparenciaUrl}${url}`, {
          headers: { "chave-api-dados": apiKeySwagger },
        });
        return response.data.length ? response.data[0] : "";
      } catch (error) {
        return errorMsg;
      }
    };
    const pepRsp = await fetchDataPortal(
      `peps?cpf=${documentoClean}&pagina=1`,
      msgErr("Pessoa Politicamente Exposta"),
    );
    results.pep = pepRsp;

    const sdcRsp = await fetchDataPortal(
      `seguro-defeso-codigo?codigo=${documentoClean}&pagina=1`,
      msgErr("Seguro Defeso"),
    );
    results.sdc = sdcRsp;

    const safraRsp = await fetchDataPortal(
      `safra-codigo-por-cpf-ou-nis?codigo=${documentoClean}&pagina=1`,
      msgErr("Garantia Safra"),
    );
    results.safra = safraRsp;

    const petiRsp = await fetchDataPortal(
      `peti-por-cpf-ou-nis?codigo=${documentoClean}&pagina=1`,
      msgErr("Programa de Erradicação do Trabalho Infantil"),
    );
    results.peti = petiRsp;

    const bpcRsp = await fetchDataPortal(
      `bpc-por-cpf-ou-nis?codigo=${documentoClean}&pagina=1`,
      msgErr("Benefício de Prestação Continuada"),
    );
    results.bpc = bpcRsp;

    const aeRsp = await fetchDataPortal(
      `auxilio-emergencial-por-cpf-ou-nis?codigoBeneficiario=${documentoClean}&codigoResponsavelFamiliar=${documentoClean}&pagina=1`,
      msgErr("Auxílio Emergencial"),
    );
    results.ae = aeRsp;

    const validaCNPJ = documento.length > 14;
    const cnepRsp = await fetchDataPortal(
      `cnep?codigoSancionado=${documentoClean}&pagina=1`,
      msgErr("Auxílio Emergencial"),
    );
    results.cnep = cnepRsp;

    if (validaCNPJ) {
      try {
        // 3 requisições por minuto
        const cnpjResponse = await axios.get(`https://receitaws.com.br/v1/cnpj/${documentoClean}`);
        results.cnpj = cnpjResponse.data;
      } catch (error) {
        results.cnpj = "Falha ao validar CNPJ.";
      }
    }

    return results;
  }

  async operationRegister(data: OperationDto) {
    const { documento, nome, apelido, exchange } = data;
    const findBuyerByName = await this.buyerService.checkNameExists(nome, exchange);
    if (findBuyerByName)
      throw new CustomError("O nome do comprador já foi cadastrado em uma venda");

    const findSellerByName = await this.sellerService.checkNameExists(nome, exchange);
    if (findSellerByName)
      throw new CustomError("O nome do vendedor já foi cadastrado em uma venda");

    if (documento) {
      const buyerExists = await this.buyerService.checkDocumentExists(documento);
      if (buyerExists)
        throw new CustomError("O CPF/CNPJ do comprador já foi cadastrado em uma venda");
      await this.buyerService.registerBuyers([{ documento, nome, apelido, exchange }]);
    } else {
      const sellerExists = await this.sellerService.findSeller(data);
      if (sellerExists) throw new CustomError("O vendedor já foi cadastrado em uma compra");
      if (!apelido) throw new CustomError("Precisa de um apelido para cadastro");
      await this.sellerService.registerSellers([{ nome, apelido, exchange }]);
    }

    return true;
  }

  async operationUpdate(data: OperationDto) {
    const buyers = await this.buyerService.updateBuyer({ documento: data.documento, ...data });
    const sellers = await this.sellerService.updateSeller(data);
    if (!buyers && !sellers)
      throw new CustomError("Comprador e Vendedor não encontrado para atualização");
    return true;
  }

  async findUsers() {
    const buyers = await this.buyerService.findBuyerUser();
    const sellers = await this.sellerService.findSellerUser();

    const normalizedBuyers = buyers.map((buyer) => ({
      ...buyer,
      document: buyer.document || "",
    }));

    const normalizedSellers = sellers.map((seller) => ({
      ...seller,
      document: "",
    }));

    const users = normalizedBuyers.concat(normalizedSellers);
    return users;
  }
}
