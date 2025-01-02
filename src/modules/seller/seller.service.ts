import { Injectable } from "@nestjs/common";
import { prisma } from "../../config/prisma-connection";
import { CustomError } from "../../err/custom/Error.filter";
import { OperationDto } from "../compliance/dto/operations.dto";

@Injectable()
export class SellerService {
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

    const sellers = await prisma.seller.findMany({
      where: {
        OR: conditions,
      },
      select: {
        counterparty: true,
        exchange: true,
        name: true,
      },
    });

    // Cria conjuntos de validação para comparação
    const foundNamesAndExchanges = new Set(
      sellers.map((seller) => `${seller.name}|${seller.exchange}`),
    );
    const foundCounterpartiesAndExchanges = new Set(
      sellers.map((seller) => `${seller.counterparty}|${seller.exchange}`),
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
    const nameCounts = sellers.reduce(
      (acc, seller) => {
        acc[seller.name] = (acc[seller.name] || 0) + 1;
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

  async findByCounterpartyOrName(
    counterparties: (string | undefined)[],
    names: (string | undefined)[],
  ) {
    if (counterparties.length !== names.length) {
      throw new CustomError(
        `Os arrays dos vendedores 'counterparties' ${counterparties.length} e 'names' ${names.length} devem ter o mesmo tamanho.`,
      );
    }

    const sellers = await prisma.seller.findMany({
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
        counterparty: true,
        exchange: true,
      },
    });

    const results = counterparties.map((cp, index) => {
      const name = names[index];
      const foundSeller = sellers.find(
        (seller) => (seller.counterparty === cp || seller.name === name) && seller.exchange,
      );

      if (!foundSeller) {
        const missingInfo = cp ? `Counterparty '${cp}'` : `Name '${name}'`;
        throw new CustomError(`${missingInfo} não foi encontrado ou está na exchange errada.`);
      }

      return foundSeller;
    });

    return results;
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
