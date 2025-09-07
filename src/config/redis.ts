import { Redis as HTTPRedis } from "@upstash/redis";
import { REDIS_TCP, REDIS_TOKEN, REDIS_URL } from "./env";
import { createClient } from "@redis/client";

const redisClient = new HTTPRedis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

export const getNodeRedisClient = () =>
  createClient({
    url: REDIS_TCP,
  });

export default redisClient;
