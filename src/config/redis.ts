import { createClient } from "@redis/client";
import { REDIS_TCP } from "./env";

const attachErrorListener = (client: ReturnType<typeof createClient>, label: string) => {
  client.on("error", (err) => {
    console.error(`[redis:${label}]`, err);
  });
  return client;
};

const redisClient = attachErrorListener(
  createClient({ url: REDIS_TCP }),
  "main",
);

export const getNodeRedisClient = () =>
  attachErrorListener(createClient({ url: REDIS_TCP }), "adapter");

export default redisClient;
