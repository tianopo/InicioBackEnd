import { Module } from "@nestjs/common";
import { BuyerModule } from "../buyer/buyer.module";
import { SellerModule } from "../seller/seller.module";
import { ComplianceController } from "./compliance.controller";
import { ComplianceService } from "./compliance.service";

@Module({
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
  imports: [BuyerModule, SellerModule],
})
export class ComplianceModule {}
