import { Body, Controller, Post } from "@nestjs/common";
import { ComplianceService } from "./compliance.service";
import { ComplianceDto } from "./dto/compliance.dto";
import { OperationDto } from "./dto/operations.dto";

@Controller("compliance")
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
