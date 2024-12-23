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

  async findSellerUser() {
    const sellers = await prisma.seller.findMany();
    return sellers;
  }

  async registerSellers(sellerData: { nome: string; apelido: string; exchange: string }[]) {
    await prisma.$transaction(async (prismaTransaction) => {
      for (const { nome, apelido, exchange } of sellerData) {
        if (nome.length === 0) throw new CustomError(`vendedor ${apelido} não tem nome`);
        await prismaTransaction.seller.create({
          data: {
            name: nome,
            counterparty: apelido,
            exchange: exchange,
          },
        });
        console.log(`${apelido} cadastrado com sucesso`);
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
        id: true,
        name: true,
        counterparty: true,
      },
    });

    return sellers;
  }

  async findSeller(data: OperationDto) {
    const { documento, nome, apelido, exchange } = data;
    if (documento) throw new CustomError("Só cadastra Vendedor");

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

  async checkNameExists(nome: string, exchange: string): Promise<boolean> {
    const seller = await prisma.seller.findFirst({
      where: {
        AND: [
          {
            name: {
              in: [nome, `${nome} Bloqueado`],
            },
          },
          { exchange },
        ],
      },
    });
    if (seller !== null) if (seller.blocked) throw new CustomError(`Usuário ${seller.name}`);
    return !!seller;
  }

  async checkCounterpartyExists(counterparty: string, exchange: string): Promise<boolean> {
    const seller = await prisma.seller.findFirst({
      where: {
        AND: [{ counterparty }, { exchange }],
      },
    });
    if (seller !== null) if (seller.blocked) throw new CustomError(`Usuário ${seller.name}`);
    return !!seller;
  }

  async updateSeller(data: {
    nome: string;
    apelido: string;
    exchange: string;
    bloqueado: boolean;
  }) {
    const { nome, apelido, exchange, bloqueado } = data;

    let seller = await prisma.seller.findFirst({
      where: { name: nome, exchange },
    });

    if (!seller) {
      seller = await prisma.seller.findFirst({
        where: { counterparty: apelido },
      });
    }
    if (!seller) return false;

    await prisma.seller.update({
      where: { id: seller.id },
      data: {
        name: nome,
        counterparty: apelido,
        exchange,
        blocked: bloqueado,
      },
    });
    console.log(`Vendedor ${nome} atualizado com sucesso`);

    return true;
  }

  async findById(id: string) {
    const seller = await prisma.seller.findUnique({
      where: { id },
    });
    return seller;
  }

  async delete(id: string) {
    if (!id) throw new CustomError("ID de usuário é obrigatório.");
    const seller = await this.findById(id);
    if (!seller) return;
    return prisma.seller.delete({
      where: { id },
    });
  }
}
