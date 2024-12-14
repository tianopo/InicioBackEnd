import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { CNPJCPFFormat } from "../../../decorators/validators/regex.decorator";
import { Required } from "../../required.dto";

export class OperationDto extends Required {
  @IsString()
  @ValidateIf((o) => o.documento !== "")
  @CNPJCPFFormat()
  documento?: string;

  @IsString()
  @ValidateIf((o) => o.documento !== "")
  nome: string;

  @IsString()
  @ValidateIf((o) => o.apelido !== "")
  apelido: string;

  @IsString()
  @IsNotEmpty()
  exchange: string;

  @IsBoolean()
  @IsOptional()
  bloqueado?: boolean;
}
