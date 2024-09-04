import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CNPJFormat, CPFFormat } from "../../../decorators/validators/regex.decorator";
import { Required } from "../../required.dto";

export class ComplianceDto extends Required {
  @IsString()
  @IsNotEmpty()
  @CPFFormat()
  cpf: string;

  @IsString()
  @IsOptional()
  @CNPJFormat()
  cnpj?: string;
}
