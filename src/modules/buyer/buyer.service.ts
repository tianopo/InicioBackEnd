import { Injectable } from "@nestjs/common";
import { prisma } from "../../config/prisma-connection";
import { CustomError } from "../../err/custom/Error.filter";
import { OperationDto } from "../compliance/dto/operations.dto";

@Injectable()
export class BuyerService {
  async findByCounterpartyOrNameAndExchange(
    exchanges: string[],
    names?: (string | undefined)[],
    counterparties?: (string | undefined)[],
  ) {
    if (!names && !counterparties) {
      throw new Error("Nem nomes nem contrapartes válidas foram fornecidas.");
    }

    // Prepara os dados para a consulta
    const conditions = (names || []).map((name, index) => {
      const counterparty = counterparties?.[index];
      return {
        OR: [...(name ? [{ name }] : []), ...(counterparty ? [{ counterparty }] : [])],
        exchange: exchanges[index], // Inclui a exchange correspondente
      };
    });

    // Realiza a consulta no banco de dados
    const buyers = await prisma.buyer.findMany({
      where: {
        OR: conditions,
      },
      select: {
        document: true,
        counterparty: true,
        exchange: true,
        name: true,
      },
    });

    // Cria conjuntos de validação para comparação
    const foundNamesAndExchanges = new Set(
      buyers.map((buyer) => `${buyer.name}|${buyer.exchange}`),
    );
    const foundCounterpartiesAndExchanges = new Set(
      buyers.map((buyer) => `${buyer.counterparty}|${buyer.exchange}`),
    );

    // Verifica ausências
    const missingDetails = conditions
      .map(({ OR, exchange }, index) => {
        const [nameCondition, counterpartyCondition] = OR || [];
        const name = nameCondition?.name;
        const counterparty = counterpartyCondition?.counterparty;
        const exchangeKey = `${name || counterparty}|${exchange}`;
        const isMissing =
          (name && !foundNamesAndExchanges.has(exchangeKey)) ||
          (counterparty && !foundCounterpartiesAndExchanges.has(exchangeKey));

        if (isMissing) {
          return {
            index,
            name,
            counterparty,
            exchange,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (missingDetails.length > 0) {
      const errorDetails = missingDetails
        .map(
          ({ name, counterparty, exchange }) =>
            `${name !== "" ? `Nome: ${name}` : ""}
           ${counterparty !== undefined ? `, Contraparte: ${counterparty}` : ""},
    Exchange: ${exchange} `,
        )
        .join("\n");

      throw new CustomError(`Dados não encontrados: \n${errorDetails} `);
    }
    // Conta a ocorrência de cada nome no banco de dados
    const nameCounts = buyers.reduce(
      (acc, buyer) => {
        acc[buyer.name] = (acc[buyer.name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Filtra os nomes duplicados (aparecem mais de uma vez)
    const duplicateNames = Object.keys(nameCounts).filter((name) => nameCounts[name] > 1);

    // Se houver nomes duplicados, lança um erro
    if (duplicateNames.length > 0) {
      const details = duplicateNames.join(", ");
      throw new CustomError(`Nome duplicado: ${details}`);
    }

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

  async findBuyerUser() {
    const buyers = await prisma.buyer.findMany();
    return buyers;
  }

  async registerBuyers(
    buyerData: { documento: string; nome: string; apelido: string; exchange: string }[],
  ) {
    await prisma.$transaction(async (prismaTransaction) => {
      for (const { documento: document, nome, apelido, exchange } of buyerData) {
        if (nome.length === 0)
          throw new CustomError(`comprador ${apelido} e ${document} não tem nome`);
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

  async findByCounterpartyOrName(
    counterparties: (string | undefined)[],
    names: (string | undefined)[],
  ) {
    if (counterparties.length !== names.length) {
      throw new CustomError("Os arrays 'counterparties' e 'names' devem ter o mesmo tamanho.");
    }

    const buyers = await prisma.buyer.findMany({
      where: {
        OR: [
          {
            counterparty: {
              in: counterparties.filter((cp) => cp && cp.trim() !== ""),
            },
          },
          {
            name: {
              in: names.filter((name) => name && name.trim() !== ""),
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        document: true,
        counterparty: true,
        exchange: true,
      },
    });

    const results = counterparties.map((cp, index) => {
      const name = names[index];
      const foundBuyer = buyers.find(
        (buyer) => (buyer.counterparty === cp || buyer.name === name) && buyer.exchange,
      );

      if (!foundBuyer) {
        const missingInfo = cp ? `Counterparty '${cp}'` : `Name '${name}'`;
        throw new CustomError(`${missingInfo} não foi encontrado ou está na exchange errada.`);
      }

      return foundBuyer;
    });

    return results;
  }

  async checkDocumentExists(document: string): Promise<boolean> {
    const buyer = await prisma.buyer.findUnique({
      where: {
        document,
      },
    });
    if (buyer !== null) if (buyer.blocked) throw new CustomError(`Usuário ${buyer.name} `);
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
    if (buyer !== null) if (buyer.blocked) throw new CustomError(`Usuário ${buyer.name} `);
    return !!buyer;
  }

  async checkCounterpartyExists(counterparty: string, exchange: string): Promise<boolean> {
    const buyer = await prisma.buyer.findFirst({
      where: {
        AND: [{ counterparty }, { exchange }],
      },
    });
    if (buyer !== null) if (buyer.blocked) throw new CustomError(`Usuário ${buyer.name} `);
    return !!buyer;
  }

  async updateBuyer(data: OperationDto) {
    const { nome, apelido, exchange, documento, bloqueado } = data;
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
        blocked: bloqueado,
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
