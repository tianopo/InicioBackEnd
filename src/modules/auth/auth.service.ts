import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserService } from "../user/user.service";
import { CustomError } from "../../err/custom/Error.filter";
import { Role } from "../../decorators/roles.decorator";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async signIn(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findEmail(email);
    if (!user) throw new CustomError("Email not found");

    const invalidPassword = await bcrypt.compare(password, user.password);
    if (!invalidPassword) throw new CustomError("Invalid Password");

    const token = this.jwtService.sign({ email });

    await this.userService.update({
      ...user,
      role: user.role as Role,
      token,
    });

    return {
      email,
      token,
    };
  }

  async signUp(createDto: RegisterUserDto) {
    const { name, email, password, role } = createDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = this.jwtService.sign({ email });

    await this.userService.create({
      name,
      email,
      token,
      password: hashedPassword,
      role,
    });

    return {
      email,
      token,
    };
  }

  async logout(token: string) {
    const user = await this.userService.findToken(token);

    if (user)
      await this.userService.update({
        ...user,
        role: user.role as Role,
        token: "",
      });
    else return false;
    return true;
  }
}
