import { redis } from "../config/redis";
import { CustomError } from "../err/custom/Error.filter";

const cacheConfig = {
  test: { validation: 5 }, // 5 segundos validação
  dynamic: { validation: 300 }, // 5 minutos validação
  moderately: { validation: 1800 }, // 30 minutos validação
  static: { validation: 86400 }, // 24 horas validação
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const cacheStale = async (
  table: string,
  data: any,
  type?: "test" | "dynamic" | "moderately" | "static",
) => {
  const config = cacheConfig[type];
  if (!config) throw new CustomError(`Invalid cache type: ${type}`);

  const isCacheStale = !(await redis.get(`${table}:validation`));
  if (isCacheStale) {
    const isRefetching = !!(await redis.get(`${table}:is-refetching`));
    if (!isRefetching) {
      await redis.set(`${table}:is-refetching`, `true`, `EX`, 20);
      try {
        await redis.set(`${table}`, JSON.stringify(data));
        await redis.set(`${table}:validation`, `true`, `EX`, config.validation);
        await redis.del(`${table}:is-refetching`);
      } catch (error) {
        await redis.del(`${table}:is-refetching`);
        throw new CustomError(`Failed to update cache`);
      }
    }
  }
};
