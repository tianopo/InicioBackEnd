import { redis } from "../config/redis";
import { CustomError } from "../err/custom/Error.filter";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const cacheStale = async (table: string, data: any) => {
  const isCacheStale = !(await redis.get(`${table}:validation`));

  if (isCacheStale) {
    const isRefetching = !!(await redis.get(`${table}:is-refetching`));
    // console.log({ isRefetching })
    if (!isRefetching) {
      await redis.set(`${table}:is-refetching`, `true`, `EX`, 20);
      try {
        // console.log('Cache is stale - refetching ...');
        await redis.set(`${table}`, JSON.stringify(data));
        await redis.set(`${table}:validation`, `true`, `EX`, 5);
      } catch (error) {
        throw new CustomError(`Failed to update cache`);
      } finally {
        await redis.del(`${table}:is-refetching`);
      }
    }
  }
};
