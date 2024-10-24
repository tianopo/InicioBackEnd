import { IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { CNPJCPFFormat } from "../../../decorators/validators/regex.decorator";

export class VendaDto {
  nomeComprador: string;

  @IsString()
  @IsNotEmpty()
  apelidoComprador: string;

  @IsString()
  @ValidateIf((o) => o.documentoComprador !== "")
  @CNPJCPFFormat()
  documentoComprador?: string;

  @IsString()
  @IsNotEmpty()
  numeroOrdem: string;

  @IsString()
  @IsNotEmpty()
  dataHoraTransacao: string;

  @IsString()
  @IsNotEmpty()
  exchangeUtilizada: string;

  @IsString()
  @IsNotEmpty()
  ativoDigital: string;

  @IsString()
  @IsNotEmpty()
  tipoTransacao: string;

  @IsString()
  @IsNotEmpty()
  quantidadeVendida: string;

  @IsString()
  @IsNotEmpty()
  valorVenda: string;

  @IsString()
  @IsNotEmpty()
  valorTokenDataVenda: string;

  @IsString()
  @IsNotEmpty()
  taxaTransacao: string;
}
