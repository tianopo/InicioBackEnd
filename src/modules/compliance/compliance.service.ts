import { Injectable } from "@nestjs/common";
import axios from "axios";
import { ComplianceDto } from "./dto/compliance.dto";

@Injectable()
export class ComplianceService {
  async validate(data: ComplianceDto) {
    const { cpf, cnpj } = data;
    const cpfClean = cpf.replace(/\D/g, "");
    const cnpjClean = cnpj ? cnpj.replace(/\D/g, "") : "";
    const apiKeySwagger = "17326962a1b9461a5cf39e98e21734d0";
    const apiKeyInfoSimples = "nR1TnskfynTogH1BFR2oqZPZ4kAv4uAeIrprFbFm";
    const apiKeySintegraws = "6E66BA3F-60A4-43C8-BCA0-D2540BAB34C4";
    // https://api.portaldatransparencia.gov.br/swagger-ui/index.html#/
    const results: any = {};
    try {
      const registerResponse = await axios.post(
        `https://www.sintegraws.com.br/api/v1/execute-api.php?token=${apiKeySintegraws}&cpf=33862444830&data-nascimento=1998-08-19&plugin=CPF`,
      );
      results.cadastro = registerResponse.data.data;
    } catch (error) {
      results.cadastro = "falha ao validar o CPF.";
    }

    try {
      const pepResponse = await axios.get(
        `https://api.portaldatransparencia.gov.br/api-de-dados/peps?cpf=${cpfClean}&pagina=1`,
        {
          headers: {
            "chave-api-dados": apiKeySwagger,
          },
        },
      );
      results.pep = pepResponse.data.length ? pepResponse.data[0] : "";
    } catch (error) {
      results.pepError = "falha ao validar o PEP.";
    }

    if (cnpj) {
      try {
        console.log("cnpj", cnpjClean);
        const cnpjResponse = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpjClean}`);
        results.cnpj = cnpjResponse.data;
      } catch (error) {
        results.cnpjError = "Failed to validate CNPJ.";
      }
    }

    console.log(results, "oi");
    console.log(data);
    return results;
  }
}
