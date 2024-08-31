import { IsNotEmpty, IsString, Length } from "class-validator";
import { Role } from "../../../decorators/roles.decorator";
import {
  EmailFormat,
  GetOneLowercase,
  GetOneNumber,
  GetOneSpecialCharacter,
  GetOneUppercase,
} from "../../../decorators/validators/regex.decorator";
import { Required } from "../../required.dto";

export class UserEntity extends Required {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @GetOneUppercase()
  @GetOneLowercase()
  @GetOneSpecialCharacter()
  @GetOneNumber()
  @IsNotEmpty()
  @IsString()
  @Length(8, 30)
  password: string;

  @IsNotEmpty()
  @EmailFormat()
  email: string;

  token: string;

  role: Role;
}
