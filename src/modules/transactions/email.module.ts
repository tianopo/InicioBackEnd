import { Module } from "@nestjs/common";
import { BuyerModule } from "../buyer/buyer.module";
import { SellerModule } from "../seller/seller.module";
import { TokenModule } from "../token/token.module";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  imports: [TokenModule, BuyerModule, SellerModule],
})
export class EmailModule {}
