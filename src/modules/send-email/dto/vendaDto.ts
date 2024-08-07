import { IsNotEmpty, IsString } from "class-validator";
import { CPFFormat } from "../../../decorators/validators/regex.decorator";

export class VendaDto {
  @IsString()
  @IsNotEmpty()
  nomeComprador: string;

  @IsString()
  @IsNotEmpty()
  @CPFFormat()
  cpfComprador: string;

  @IsString()
  @IsNotEmpty()
  numeroOrdem: string;

  @IsString()
  @IsNotEmpty()
  horaTransacao: string;

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
