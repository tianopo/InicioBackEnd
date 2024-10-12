import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { CompraDto } from "./compra.dto";
import { VendaDto } from "./venda.dto";

export class TransactionsDto {
  @ValidateNested({ each: true })
  @Type(() => VendaDto)
  vendas: VendaDto[];

  @ValidateNested({ each: true })
  @Type(() => CompraDto)
  compras: CompraDto[];
}
