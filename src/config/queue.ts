import { REDIS_TCP } from "./env";

export const createQueueConnection = () => {
  if (!REDIS_TCP) {
    throw new Error("Missing REDIS_TCP in env for queue connection.");
  }

  const redisUrl = new URL(REDIS_TCP);

  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    tls: redisUrl.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
  };
};
