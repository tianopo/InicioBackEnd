import { Module } from "@nestjs/common";
import { BuyerModule } from "../buyer/buyer.module";
import { SellerModule } from "../seller/seller.module";
import { TokenModule } from "../token/token.module";
import { SendEmailController } from "./send-email.controller";
import { SendEmailService } from "./send-email.service";

@Module({
  controllers: [SendEmailController],
  providers: [SendEmailService],
  imports: [TokenModule, BuyerModule, SellerModule],
})
export class SendEmailModule {}
