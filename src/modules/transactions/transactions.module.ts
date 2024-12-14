import { Module } from "@nestjs/common";
import { BuyerModule } from "../buyer/buyer.module";
import { SellerModule } from "../seller/seller.module";
import { TokenModule } from "../token/token.module";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [BuyerModule, SellerModule],
})
export class TransactionsModule {}
