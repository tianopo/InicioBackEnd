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

  async findCounterparty() {
    const buyers = await prisma.buyer.findMany();
    const counterparties = buyers.map((buyer) => buyer.counterparty);
    return counterparties;
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
        console.log(`${nome} cadastrado com sucesso`);
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
    return !!buyer;
  }

  async checkNameExists(nome: string, exchange: string): Promise<boolean> {
    const buyer = await prisma.buyer.findFirst({
      where: {
        AND: {
          name: nome,
          exchange,
        },
      },
    });
    return !!buyer;
  }
}
