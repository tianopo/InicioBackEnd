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

  async cpfLight(listaCpf: string[]) {
    const SERVER_URL = "https://h-apigateway.conectagov.estaleiro.serpro.gov.br";
    const TOKEN_REQUEST_URL = `${SERVER_URL}/oauth2/jwt-token`;
    const CLIENT_ID = "8ddc46f2-f6a3-4077-9e04-74b55de934a5";
    const CLIENT_SECRET = "06d4aaac-1412-45f6-bd7c-38b2bef0d706";
    const CONSULTA_CPF_URL = `${SERVER_URL}/api-cpf-light/v2/consulta/cpf`;
    const EXPIRATION_WINDOW_IN_SECONDS = 300;
    let tokenStorage: any;

    const getToken = async () => {
      const authHeader = "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
      console.log(authHeader);
      try {
        const response = await axios.post(TOKEN_REQUEST_URL, "grant_type=client_credentials", {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: authHeader,
          },
        });
        console.log(response);
        return response.data;
      } catch (error) {
        throw new CustomError("Erro ao obter token");
      }
    };

    const extractExp = (token: string): number | null => {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        return payload.exp;
      }
      return null;
    };

    const getAccessToken = async () => {
      if (!tokenStorage) {
        tokenStorage = await getToken();
      } else {
        const exp = extractExp(tokenStorage.access_token);
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        const expirationThreshold = currentTimeInSeconds + EXPIRATION_WINDOW_IN_SECONDS;

        // Verifica se o token está próximo de expirar
        if (exp && exp < expirationThreshold) {
          tokenStorage = await getToken();
        }
      }
      return tokenStorage.access_token;
    };

    const access_token = await getAccessToken();

    try {
      const response = await axios.post(
        CONSULTA_CPF_URL,
        { listaCpf },
        {
          headers: {
            "Content-Type": "application/json",
            "x-cpf-usuario": "00000000191",
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw new CustomError("Erro na consulta CPF Light");
    }
  }

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

    const viagensRsp = await fetchDataPortal(
      `viagens-por-cpf?cpf=${documentoClean}&pagina=1`,
      msgErr("Viajantes por CPF"),
    );
    results.viagens = viagensRsp;

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

    const cfRsp = await fetchDataPortal(
      `contratos/cpf-cnpj?cpfCnpj=${documentoClean}&pagina=1`,
      msgErr("Contrato do Poder Executivo"),
    );
    results.cf = cfRsp;

    const cnepRsp = await fetchDataPortal(
      `cnep?codigoSancionado=${documentoClean}&pagina=1`,
      msgErr("Auxílio Emergencial"),
    );
    results.cnep = cnepRsp;

    const validaCNPJ = documento.length > 14;
    const encodedDocumento = validaCNPJ ? encodeURIComponent(documento) : documento;

    const ceisRsp = await fetchDataPortal(
      `ceis?codigoSancionado=${encodedDocumento}&pagina=1`,
      msgErr("Cadastro Nacional de Empresas Inidôneas e Suspensas"),
    );
    results.ceis = ceisRsp;

    const ceafRsp = await fetchDataPortal(
      `ceaf?codigoSancionado=${encodedDocumento}&pagina=1`,
      msgErr("Componente Especializado da Assistência Farmacêutica"),
    );
    results.ceaf = ceafRsp;

    if (validaCNPJ) {
      try {
        // 3 requisições por minuto
        const cnpjResponse = await axios.get(`https://receitaws.com.br/v1/cnpj/${documentoClean}`);
        results.cnpj = cnpjResponse.data;

        const cepimRsp = await fetchDataPortal(
          `cepim?cnpjSancionado=${encodedDocumento}&pagina=1`,
          msgErr("Entidades Privadas sem Fins Lucrativos Impedidas"),
        );
        results.cepim = cepimRsp;
      } catch (error) {
        results.cnpj = "Falha ao validar CNPJ.";
      }
    }

    return results;
  }

  async operationRegister(data: OperationDto) {
    const { documento, nome, apelido, exchange } = data;
    const findBuyerByCounterparty = await this.buyerService.checkCounterpartyExists(
      apelido,
      exchange,
    );
    if (findBuyerByCounterparty) throw new CustomError(`${apelido} está cadastrado`);

    const findSellerBycounterparty = await this.sellerService.checkCounterpartyExists(
      apelido,
      exchange,
    );
    if (findSellerBycounterparty) throw new CustomError(`${apelido} está cadastrado`);
    if (!apelido) throw new CustomError("Precisa de um apelido para cadastro");

    if (documento) {
      const buyerExists = await this.buyerService.checkDocumentExists(documento);
      if (buyerExists)
        throw new CustomError(`O CPF/CNPJ ${documento} do comprador está cadastrado`);
      await this.buyerService.registerBuyers([{ documento, nome, apelido, exchange }]);
    } else {
      const sellerExists = await this.sellerService.findSeller(data);
      if (sellerExists) throw new CustomError(`O vendedor ${apelido} está cadastrado`);
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

  async deleteUser(id: string) {
    const buyerDeleted = await this.buyerService.delete(id);
    const sellerDeleted = await this.sellerService.delete(id);
    console.log(buyerDeleted, sellerDeleted);

    if (!buyerDeleted && !sellerDeleted) {
      throw new CustomError("Usuário não encontrado para exclusão");
    }
    return true;
  }
  async consultarCpf(data: { cpf: string; dataNascimento: string; captchaResponse: string }) {
    const { cpf, dataNascimento, captchaResponse } = data;

    try {
      const response = await axios.post(
        "https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublicaExibir.asp",
        new URLSearchParams({
          idCheckedReCaptcha: "false",
          txtCPF: cpf,
          txtDataNascimento: dataNascimento,
          "h-captcha-response": captchaResponse,
          Enviar: "Consultar",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            Origin: "https://servicos.receita.fazenda.gov.br",
            Referer:
              "https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error("Erro ao consultar CPF na Receita Federal");
    }
  }
}
