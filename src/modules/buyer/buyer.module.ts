import { Module } from "@nestjs/common";
import { BuyerService } from "./buyer.service";
import { BuyerController } from "./buyer.controller";

@Module({
  controllers: [BuyerController],
  providers: [BuyerService],
  exports: [BuyerService],
})
export class BuyerModule {}
