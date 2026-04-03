import { createClient } from "@redis/client";
import { REDIS_TCP } from "./env";

const redisClient = createClient({
  url: REDIS_TCP,
});

export const getNodeRedisClient = () =>
  createClient({
    url: REDIS_TCP,
  });

export default redisClient;
