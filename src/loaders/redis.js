import config from "../config/index.js";
import { createClient } from "redis";

const client = createClient({ url: config.REDIS_URL });

export default {
  init: () => {
    return new Promise(async (resolve, reject) => {
      await client.connect();

      await client.set("init-test", 0);
      const testVal = await client.get("init-test");

      client.del("init-test");
      testVal === "0" ? resolve() : reject(new Error("Redis Intialization failed"));
    });
  },

  client,
};
