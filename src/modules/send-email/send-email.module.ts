import { Module } from "@nestjs/common";
import { TokenModule } from "../token/token.module";
import { SendEmailController } from "./send-email.controller";
import { SendEmailService } from "./send-email.service";

@Module({
  controllers: [SendEmailController],
  providers: [SendEmailService],
  imports: [TokenModule],
})
export class SendEmailModule {}
