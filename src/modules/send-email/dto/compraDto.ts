import { IsNotEmpty, IsString } from "class-validator";

export class CompraDto {
  @IsString()
  @IsNotEmpty()
  nomeVendedor: string;

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
  quantidadeComprada: string;

  @IsString()
  @IsNotEmpty()
  valorCompra: string;

  @IsString()
  @IsNotEmpty()
  valorTokenDataCompra: string;

  @IsString()
  @IsNotEmpty()
  taxaTransacao: string;
}
