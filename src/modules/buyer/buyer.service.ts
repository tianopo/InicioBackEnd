import { Injectable } from "@nestjs/common";
import { prisma } from "../../config/prisma-connection";
import { CustomError } from "../../err/custom/Error.filter";

@Injectable()
export class BuyerService {
  async findByCounterpartyAndExchange(counterparties: string[], exchanges: string[]) {
    const buyers = await prisma.buyer.findMany({
      where: {
        counterparty: {
          in: counterparties,
        },
        exchange: {
          in: exchanges,
        },
      },
      select: {
        document: true,
        counterparty: true,
      },
    });

    return buyers;
  }

  async findByDocument(documentList: string[]) {
    const buyers = await prisma.buyer.findMany({
      where: {
        document: {
          in: documentList,
        },
      },
      select: {
        document: true,
      },
    });

    const registeredDocuments = buyers.map((buyer) => buyer.document);
    return registeredDocuments;
  }

  async findCounterpartyAndName() {
    const buyers = await prisma.buyer.findMany();
    const counterpartiesAndNames = buyers.map((buyer) => ({
      counterparty: buyer.counterparty,
      name: buyer.name,
    }));
    return counterpartiesAndNames;
  }

  async findBuyerUser() {
    const buyers = await prisma.buyer.findMany();
    return buyers;
  }

  async registerBuyers(
    buyerData: { documento: string; nome: string; apelido: string; exchange: string }[],
  ) {
    await prisma.$transaction(async (prismaTransaction) => {
      for (const { documento: document, nome, apelido, exchange } of buyerData) {
        if (nome.length === 0) throw new CustomError(`${apelido} e ${document} não tem nome`);
        await prismaTransaction.buyer.create({
          data: {
            document,
            name: nome,
            counterparty: apelido,
            exchange: exchange,
          },
        });
        console.log(`${apelido} de CPF ${document} cadastrado com sucesso`);
      }
    });
  }

  async findByCounterparty(counterparties: string[]) {
    const buyers = await prisma.buyer.findMany({
      where: {
        counterparty: {
          in: counterparties,
        },
      },
      select: {
        id: true,
        name: true,
        document: true,
        counterparty: true,
      },
    });

    return buyers;
  }

  async checkDocumentExists(document: string): Promise<boolean> {
    const buyer = await prisma.buyer.findUnique({
      where: {
        document,
      },
    });
    if (buyer !== null) {
      const buyerBlocked = buyer.name.split(" ")[buyer.name.split(" ").length - 1];
      if (buyerBlocked === "Bloqueado") throw new CustomError(`Usuário ${buyer.name}`);
    }
    return !!buyer;
  }

  async checkNameExists(nome: string, exchange: string): Promise<boolean> {
    const buyer = await prisma.buyer.findFirst({
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
    if (buyer !== null) {
      const buyerBlocked = buyer.name.split(" ")[buyer.name.split(" ").length - 1];
      if (buyerBlocked === "Bloqueado") throw new CustomError(`Usuário ${buyer.name}`);
    }
    return !!buyer;
  }

  async checkCounterpartyExists(counterparty: string, exchange: string): Promise<boolean> {
    const buyer = await prisma.buyer.findFirst({
      where: {
        AND: [{ counterparty }, { exchange }],
      },
    });
    if (buyer !== null) {
      const buyerBlocked = buyer.name.split(" ")[buyer.name.split(" ").length - 1];
      if (buyerBlocked === "Bloqueado") throw new CustomError(`Usuário ${buyer.name}`);
    }
    return !!buyer;
  }

  async updateBuyer(data: { documento: string; nome: string; apelido: string; exchange: string }) {
    const { nome, apelido, exchange, documento } = data;
    let buyer = await prisma.buyer.findFirst({
      where: { name: nome, exchange },
    });

    if (!buyer) {
      buyer = await prisma.buyer.findFirst({
        where: { counterparty: apelido },
      });
    }
    if (!buyer) return false;

    await prisma.buyer.update({
      where: { id: buyer.id },
      data: {
        name: nome,
        counterparty: apelido,
        exchange,
        document: documento,
      },
    });
    console.log(`Comprador ${nome} atualizado com sucesso`);

    return true;
  }

  async findById(id: string) {
    const buyer = await prisma.buyer.findUnique({
      where: { id },
    });
    return buyer;
  }

  async delete(id: string) {
    if (!id) throw new CustomError("ID de usuário é obrigatório.");
    const buyer = await this.findById(id);
    if (!buyer) return;
    return prisma.buyer.delete({
      where: { id },
    });
  }
}
