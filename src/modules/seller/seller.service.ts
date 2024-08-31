import { Injectable } from "@nestjs/common";
import { prisma } from "../../config/prisma-connection";
import { CustomError } from "../../err/custom/Error.filter";

@Injectable()
export class SellerService {
  async findByCounterpartyAndExchange(counterparties: string[], exchanges: string[]) {
    const sellers = await prisma.seller.findMany({
      where: {
        counterparty: {
          in: counterparties,
        },
        exchange: {
          in: exchanges,
        },
      },
      select: {
        counterparty: true,
      },
    });

    return sellers;
  }

  async registerSellers(sellerData: { nome: string; apelido: string; exchange: string }[]) {
    for (const { nome, apelido, exchange } of sellerData) {
      if (nome.length === 0) throw new CustomError(`${apelido} não tem nome`);
      await prisma.seller.create({
        data: {
          name: nome,
          counterparty: apelido,
          exchange: exchange,
        },
      });
      console.log(`${nome} cadastrado com sucesso`);
    }
  }
}
