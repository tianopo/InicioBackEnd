import { Module } from "@nestjs/common";
import { BuyerService } from "./buyer.service";

@Module({
  providers: [BuyerService],
  exports: [BuyerService],
})
export class BuyerModule {}
