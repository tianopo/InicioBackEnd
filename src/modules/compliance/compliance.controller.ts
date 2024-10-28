import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ComplianceService } from "./compliance.service";
import { ComplianceDto } from "./dto/compliance.dto";
import { OperationDto } from "./dto/operations.dto";
import { JwtAuthGuard } from "../../guard/auth.guard";

@Controller("compliance")
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post()
  async validate(@Body() data: ComplianceDto) {
    return this.complianceService.validate(data);
  }

  @Post("operation")
  async register(@Body() data: OperationDto) {
    return this.complianceService.operationRegister(data);
  }
}
