import { IsNotEmpty, IsString } from "class-validator";

export class CompraDto {
  nomeVendedor: string;

  @IsString()
  @IsNotEmpty()
  apelidoVendedor: string;

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
