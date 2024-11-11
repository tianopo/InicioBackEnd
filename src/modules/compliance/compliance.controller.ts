import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { CustomError } from "../../err/custom/Error.filter";
import { JwtAuthGuard } from "../../guard/auth.guard";
import { ComplianceService } from "./compliance.service";
import { ComplianceDto } from "./dto/compliance.dto";
import { OperationDto } from "./dto/operations.dto";

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

  @Put("operation")
  async update(@Body() data: OperationDto) {
    return this.complianceService.operationUpdate(data);
  }

  @Get("operation")
  async findUsers() {
    try {
      return await this.complianceService.findUsers();
    } catch (error) {
      throw new CustomError("Usuário não encontrado");
    }
  }

  @Delete("operation/delete/:id")
  async delete(@Param("id") id: string) {
    try {
      return await this.complianceService.deleteUser(id);
    } catch (error) {
      throw new CustomError(`${id} não encontrado`);
    }
  }
}
