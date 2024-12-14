import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { TransactionsDto } from "./dto/transactions.dto";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
  @Post("")
  sendTransactions(@Body() data: TransactionsDto) {
    return this.transactionsService.sendTransactions(data);
  }

  @Get("order")
  async getFilteredTransactions(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.transactionsService.listTransactions(startDate, endDate);
  }
}
