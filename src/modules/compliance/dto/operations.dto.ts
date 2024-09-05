import { IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { CPFFormat } from "../../../decorators/validators/regex.decorator";
import { Required } from "../../required.dto";

export class OperationDto extends Required {
  @IsString()
  @ValidateIf((o) => o.cpf !== "")
  @CPFFormat()
  cpf?: string;

  @IsString()
  @ValidateIf((o) => o.cpf !== "")
  nome: string;

  @IsString()
  @ValidateIf((o) => o.apelido !== "")
  apelido: string;

  @IsString()
  @IsNotEmpty()
  exchange: string;
}
