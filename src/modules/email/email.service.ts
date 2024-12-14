import { Injectable } from "@nestjs/common";
import { prisma } from "../../config/prisma-connection";
import { CustomError } from "../../err/custom/Error.filter";
import { sendEmail } from "../../utils/email/nodemailer";
import { getMembershipTemplate } from "../../utils/email/template/get-membership";
import { recoverTemplate } from "../../utils/email/template/recover-template";
import { termsTemplate } from "../../utils/email/template/terms-template";
import { TokenService } from "../token/token.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { GetMembershipDto } from "./dto/get-membership.dto";
import { MembershipDto } from "./dto/membership.dto";

@Injectable()
export class EmailService {
  constructor(private readonly tokenService: TokenService) {}

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async forgotPassword(data: ForgotPasswordDto) {
    const { email } = data;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (!userExists) throw new CustomError("E-mail não existe");

    const token = this.tokenService.generateToken(email);
    const pagina = `${process.env.FRONTEND_HOST}/recuperar-senha/${token}`;
    const emailBodyClient = recoverTemplate(email, pagina);
    try {
      await this.delay(2000);
      sendEmail("Recuperação de Senha na Reurb", emailBodyClient, email);
    } catch (err) {
      throw new CustomError("Muitos e-mails enviados ao mesmo tempo, aguarde um pouco");
    }

    return true;
  }

  async receiveMembership(data: MembershipDto) {
    const emailBodyClient = termsTemplate(data.nome, data.email, data.telefone, data.cep);
    try {
      await this.delay(2000);
      sendEmail("Formulário de Adesão", emailBodyClient);
    } catch (err) {
      throw new CustomError("Muitos e-mails enviados ao mesmo tempo, aguarde um pouco");
    }

    return true;
  }

  async sendMembership(data: GetMembershipDto) {
    const token = this.tokenService.generateToken(data.email);
    const pagina = `${process.env.FRONTEND_HOST}/formulario-adesao/${token}`;
    const emailBodyClient = getMembershipTemplate(data.nome, data.email, pagina);
    try {
      await this.delay(2000);
      sendEmail("Formulário de Registro na Reurb", emailBodyClient, data.email);
    } catch (err) {
      throw new CustomError("Muitos e-mails enviados ao mesmo tempo, aguarde um pouco");
    }

    return true;
  }
}
