import { IsNotEmpty, IsString } from "class-validator";
import { CNPJCPFFormat } from "../../../decorators/validators/regex.decorator";
import { Required } from "../../required.dto";

export class ComplianceDto extends Required {
  @IsString()
  @IsNotEmpty()
  @CNPJCPFFormat()
  documento: string;
}
