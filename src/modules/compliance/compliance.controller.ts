import { Body, Controller, Post } from "@nestjs/common";
import { ComplianceService } from "./compliance.service";
import { ComplianceDto } from "./dto/compliance.dto";

@Controller("compliance")
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post()
  async validate(@Body() data: ComplianceDto) {
    return this.complianceService.validate(data);
  }
}
