import { IsNotEmpty, IsString, Length } from "class-validator";
import {
  CEPFormat,
  EmailFormat,
  PhoneFormat,
} from "../../../decorators/validators/regex.decorator";

export class MembershipDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  nome: string;

  @IsNotEmpty()
  @IsString()
  @EmailFormat()
  email: string;

  @IsNotEmpty()
  @IsString()
  @PhoneFormat()
  telefone: string;

  @IsNotEmpty()
  @IsString()
  @CEPFormat()
  cep: string;
}
