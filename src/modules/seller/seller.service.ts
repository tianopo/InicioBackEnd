import { Injectable } from "@nestjs/common";
import { prisma } from "../../config/prisma-connection";
import { CustomError } from "../../err/custom/Error.filter";
import { OperationDto } from "../compliance/dto/operations.dto";

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
    await prisma.$transaction(async (prismaTransaction) => {
      for (const { nome, apelido, exchange } of sellerData) {
        if (nome.length === 0) {
          throw new CustomError(`${apelido} não tem nome`);
        }
        await prismaTransaction.seller.create({
          data: {
            name: nome,
            counterparty: apelido,
            exchange: exchange,
          },
        });
        console.log(`${nome} cadastrado com sucesso`);
      }
    });
  }

  async findByCounterparty(counterparties: string[]) {
    const sellers = await prisma.seller.findMany({
      where: {
        counterparty: {
          in: counterparties,
        },
      },
      select: {
        name: true,
        counterparty: true,
      },
    });

    return sellers;
  }

  async findSeller(data: OperationDto) {
    const { cpf, nome, apelido, exchange } = data;
    if (cpf) throw new CustomError("Só cadastra Vendedor");

    const searchConditions: any[] = [];
    if (nome) searchConditions.push({ name: nome });
    if (apelido) searchConditions.push({ counterparty: apelido });
    if (exchange) searchConditions.push({ exchange: exchange });

    if (searchConditions.length === 0)
      throw new CustomError("Cadastre algum nome, apelido ou exchange");
    const seller = await prisma.seller.findFirst({
      where: {
        AND: searchConditions,
      },
    });

    return !!seller;
  }
}
