import { Controller, Get } from "@nestjs/common";
import { CustomError } from "../../err/custom/Error.filter";
import { BuyerService } from "./buyer.service";

@Controller("buyer")
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}
  @Get()
  async findBuyer() {
    try {
      return await this.buyerService.findBuyerUser();
    } catch (error) {
      throw new CustomError("Comprador não encontrado");
    }
  }
}
