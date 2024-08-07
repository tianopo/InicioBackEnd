import { IsNotEmpty, IsString, Length } from "class-validator";
import { EmailFormat } from "../../../decorators/validators/regex.decorator";

export class GetMembershipDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  nome: string;

  @IsNotEmpty()
  @IsString()
  @EmailFormat()
  email: string;
}
