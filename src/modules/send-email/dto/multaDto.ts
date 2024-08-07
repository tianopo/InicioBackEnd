import { IsNotEmpty, IsString, Length } from "class-validator";
import { EmailFormat } from "../../../decorators/validators/regex.decorator";

export class MultaDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  nome: string;

  @IsNotEmpty()
  @IsString()
  @Length(11, 14)
  cpf: string;

  @IsNotEmpty()
  @IsString()
  @EmailFormat()
  email: string;

  @IsNotEmpty()
  @IsString()
  cnh: string;

  @IsNotEmpty()
  @IsString()
  categoria: string;

  @IsNotEmpty()
  @IsString()
  validade: string;

  @IsNotEmpty()
  @IsString()
  tipoDesconto: string;

  @IsNotEmpty()
  @IsString()
  numeroAutoInfracao: string;

  @IsNotEmpty()
  @IsString()
  dataInfracao: string;

  @IsNotEmpty()
  @IsString()
  horaInfracao: string;

  @IsNotEmpty()
  @IsString()
  localInfracao: string;

  @IsNotEmpty()
  @IsString()
  placaVeiculo: string;

  @IsNotEmpty()
  @IsString()
  marcaModeloAno: string;

  @IsNotEmpty()
  @IsString()
  tipoVeiculo: string;

  @IsNotEmpty()
  @IsString()
  valorMulta: string;

  @IsNotEmpty()
  @IsString()
  prazoRecurso: string;
}
