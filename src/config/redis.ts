import Redis from "ioredis";
import { LOG_COLORS } from "../utils/logColors";

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
});

redis.on("error", (err: string) => {
  console.error(`${LOG_COLORS.red + LOG_COLORS.bright}Error on Redis: ${LOG_COLORS.reset}`, err);
});

redis.on("connect", () => {
  console.log(`${LOG_COLORS.green + LOG_COLORS.bright}Redis connected! ${LOG_COLORS.reset}`);
});

export const setKey = async (key: string, value: string, expire?: number): Promise<void> => {
  await redis.set(key, value);
  if (expire) {
    await redis.expire(key, expire);
  }
};
