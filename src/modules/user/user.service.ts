import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { prisma } from "../../config/prisma-connection";
import { redis } from "../../config/redis";
import { Role } from "../../decorators/roles.decorator";
import { CustomError } from "../../err/custom/Error.filter";
import { cacheStale } from "../../utils/cacheStale";
import { UserEntity } from "./user.dto";

@Injectable()
export class UserService {
  async create(data: UserEntity) {
    const existEmail = await prisma.user.findFirst({
      where: { email: data.email, id: { not: data.id } },
    });
    if (existEmail) throw new CustomError("E-mail already registered");

    const cacheCount = JSON.parse(await redis.get("users")).length;

    let countUser;
    if (cacheCount === 0) countUser = await this.countUser();
    else countUser = cacheCount;
    const firstRole = countUser === 0 ? Role.Admin : Role.User;
    return prisma.user.create({
      data: {
        ...data,
        role: firstRole,
      },
    });
  }

  async update(id: string, user: UserEntity) {
    const { ...data } = user;

    if (!id) throw new CustomError("User ID is required for updating.");
    const updated = new Date();

    const existEmail = await prisma.user.findFirst({
      where: { email: data.email, id: { not: data.id } },
    });
    if (existEmail) throw new CustomError("E-mail already registered");

    const userId = await prisma.user.findUnique({
      where: { id },
    });
    if (!userId) throw new CustomError(`User ID ${id} not found`);

    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        updated,
      },
    });
  }

  async list() {
    const data = await prisma.user.findMany();
    cacheStale("users", data);

    const cache = await redis.get("users");
    if (cache) return JSON.parse(cache);

    await redis.set("users", JSON.stringify(data));

    return data;
  }

  async delete(id: string) {
    if (!id) throw new CustomError("User ID was not found");

    return prisma.user.delete({ where: { id } });
  }

  async updateToken(user: User) {
    const { id, ...data } = user;
    if (!id) throw new CustomError("User ID is required for updating.");
    const updated = new Date();

    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        updated,
      },
    });
  }

  async countUser() {
    return prisma.user.count();
  }

  async findToken(token: string) {
    if (token !== "") {
      const existToken = await prisma.user.findFirst({
        where: { token },
      });

      if (!existToken) return undefined;
      return existToken;
    } else return undefined;
  }
}
