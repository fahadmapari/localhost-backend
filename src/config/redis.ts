import { Redis as HTTPRedis } from "@upstash/redis";
import { REDIS_TCP, REDIS_TOKEN, REDIS_URL } from "./env";
import Redis from "ioredis";

const redisClient = new HTTPRedis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

export const IoRedis = new Redis(REDIS_TCP);

export default redisClient;
