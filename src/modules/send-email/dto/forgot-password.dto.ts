import { IsNotEmpty, IsString } from "class-validator";
import { EmailFormat } from "../../../decorators/validators/regex.decorator";

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  @EmailFormat()
  email: string;
}
