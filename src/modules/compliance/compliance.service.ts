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
    const { cpf, cnpj } = data;
    const cpfClean = cpf.replace(/\D/g, "");
    const cnpjClean = cnpj ? cnpj.replace(/\D/g, "") : "";

    const portalDaTransparenciaUrl = "https://api.portaldatransparencia.gov.br/api-de-dados/";
    const msgErr = (m: string) => `falha ao validar ${m}`;

    const apiKeySwagger = "17326962a1b9461a5cf39e98e21734d0";
    const apiKeyInfoSimples = "nR1TnskfynTogH1BFR2oqZPZ4kAv4uAeIrprFbFm";
    // https://api.portaldatransparencia.gov.br/swagger-ui/index.html#/
    const results: any = {};

    const cpfExists = await this.buyerService.checkDocumentExists(cpf);
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
      `peps?cpf=${cpfClean}&pagina=1`,
      msgErr("Pessoa Politicamente Exposta"),
    );
    results.pep = pepRsp;

    const sdcRsp = await fetchDataPortal(
      `seguro-defeso-codigo?codigo=${cpfClean}&pagina=1`,
      msgErr("Seguro Defeso"),
    );
    results.sdc = sdcRsp;

    const safraRsp = await fetchDataPortal(
      `safra-codigo-por-cpf-ou-nis?codigo=${cpfClean}&pagina=1`,
      msgErr("Garantia Safra"),
    );
    results.safra = safraRsp;

    const petiRsp = await fetchDataPortal(
      `peti-por-cpf-ou-nis?codigo=${cpfClean}&pagina=1`,
      msgErr("Programa de Erradicação do Trabalho Infantil"),
    );
    results.peti = petiRsp;

    const bpcRsp = await fetchDataPortal(
      `bpc-por-cpf-ou-nis?codigo=${cpfClean}&pagina=1`,
      msgErr("Benefício de Prestação Continuada"),
    );
    results.bpc = bpcRsp;

    const aeRsp = await fetchDataPortal(
      `auxilio-emergencial-por-cpf-ou-nis?codigoBeneficiario=${cpfClean}&codigoResponsavelFamiliar=${cpfClean}&pagina=1`,
      msgErr("Auxílio Emergencial"),
    );
    results.ae = aeRsp;

    const cnepRsp = await fetchDataPortal(
      `cnep?codigoSancionado=${cnpj ? cnpjClean : cpfClean}&pagina=1`,
      msgErr("Auxílio Emergencial"),
    );
    results.cnep = cnepRsp;

    if (cnpj) {
      try {
        // 3 requisições por minuto
        const cnpjResponse = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpjClean}`);
        results.cnpj = cnpjResponse.data;
      } catch (error) {
        results.cnpj = "Falha ao validar CNPJ.";
      }
    }

    return results;
  }

  async operationRegister(data: OperationDto) {
    const { cpf, nome, apelido, exchange } = data;

    const findBuyerByName = await this.buyerService.checkNameExists(nome, exchange);
    if (findBuyerByName)
      throw new CustomError("O nome do comprador já foi cadastrado em uma venda");

    const findSellerByName = await this.sellerService.checkNameExists(nome, exchange);
    if (findSellerByName)
      throw new CustomError("O nome do vendedor já foi cadastrado em uma venda");

    if (cpf) {
      const buyerExists = await this.buyerService.checkDocumentExists(cpf);
      if (buyerExists) throw new CustomError("O CPF do comprador já foi cadastrado em uma venda");
      await this.buyerService.registerBuyers([{ cpf, nome, apelido, exchange }]);
    } else {
      const sellerExists = await this.sellerService.findSeller(data);
      if (sellerExists) throw new CustomError("O vendedor já foi cadastrado em uma compra");
      if (!apelido) throw new CustomError("Precisa de um apelido para cadastro");
      await this.sellerService.registerSellers([{ nome, apelido, exchange }]);
    }

    return true;
  }
}
