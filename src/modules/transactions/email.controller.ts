import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CustomError } from "../../err/custom/Error.filter";
import { TokenService } from "../token/token.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { GetMembershipDto } from "./dto/get-membership.dto";
import { MembershipDto } from "./dto/membership.dto";
import { TransactionsDto } from "./dto/transactions.dto";
import { EmailService } from "./email.service";

@Controller("send")
export class EmailController {
  constructor(
    private readonly sendEmailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}
  @Post("forgot-password")
  forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.sendEmailService.forgotPassword(data);
  }

  @Post("receive-membership")
  receiveMembership(@Body() data: MembershipDto) {
    return this.sendEmailService.receiveMembership(data);
  }

  @Post("send-membership")
  sendMembership(@Body() data: GetMembershipDto) {
    return this.sendEmailService.sendMembership(data);
  }

  @Get(":token")
  async validateToken(@Param("token") token: string) {
    try {
      await this.tokenService.validateToken(token);
      return true;
    } catch (error) {
      throw new CustomError("Página não é válida");
    }
  }

  @Post("transactions")
  sendTransactions(@Body() data: TransactionsDto) {
    return this.sendEmailService.sendTransactions(data);
  }

  @Get("transactions/order")
  async getFilteredTransactions(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.sendEmailService.listTransactions(startDate, endDate);
  }
}
