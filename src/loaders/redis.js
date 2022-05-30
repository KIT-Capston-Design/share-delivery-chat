import config from "../config/index.js";
import { createClient } from "redis";

const client = createClient({ url: config.REDIS_URL });

const resolvePromise = (resolve, reject) => {
  return (err, data) => {
    if (err) {
      reject(err);
    }
    resolve(data);
  };
};

export default {
  init: () => {
    return new Promise(async (resolve, reject) => {
      await client.connect();

      await client.set("init-test", 0);
      const testVal = await client.get("init-test");

      client.del("init-test");
      testVal === "0"
        ? resolve()
        : reject(new Error("Redis Intialization failed"));
    });
  },

  client,

  incr: (key = "key") =>
    new Promise((a, b) => client.incr(key, resolvePromise(a, b))),

  decr: (key = "key") =>
    new Promise((a, b) => client.decr(key, resolvePromise(a, b))),

  exists: (key = "key") =>
    new Promise((a, b) => client.exists(key, resolvePromise(a, b))),

  hexists: (key = "key", key2 = "") =>
    new Promise((a, b) => client.hexists(key, key2, resolvePromise(a, b))),

  set: (key = "key", value) =>
    new Promise((a, b) => client.set(key, value, resolvePromise(a, b))),

  get: (key = "key") =>
    new Promise((a, b) => client.get(key, resolvePromise(a, b))),

  hgetall: (key = "key") =>
    new Promise((a, b) => client.hgetall(key, resolvePromise(a, b))),

  zrangebyscore: (key = "key", min = 0, max = 1) =>
    new Promise((a, b) =>
      client.zrangebyscore(key, min, max, "WITHSCORES", resolvePromise(a, b))
    ),

  zadd: (key = "key", key2 = "", value) =>
    new Promise((a, b) => client.zadd(key, key2, value, resolvePromise(a, b))),

  sadd: (key = "key", value) =>
    new Promise((a, b) => client.sadd(key, value, resolvePromise(a, b))),

  hmget: (key = "key", key2 = "") =>
    new Promise((a, b) => client.hmget(key, key2, resolvePromise(a, b))),

  sismember: (key = "key", key2 = "") =>
    new Promise((a, b) => client.sismember(key, key2, resolvePromise(a, b))),

  smembers: (key = "key") =>
    new Promise((a, b) => client.smembers(key, resolvePromise(a, b))),

  srem: (key = "key", key2 = "") =>
    new Promise((a, b) => client.srem(key, key2, resolvePromise(a, b))),

  hset: (key = "key", values = []) =>
    new Promise((a, b) => client.hset(key, values, resolvePromise(a, b))),

  expire: (key = "key", value) =>
    new Promise((a, b) => client.expire(key, value, resolvePromise(a, b))),

  lrem: (key = "key", value) =>
    new Promise((a, b) => client.lrem(key, value, resolvePromise(a, b))),

  flushdb: () => new Promise((a, b) => client.flushdb(resolvePromise(a, b))),

  lpush: (key = "key", value) =>
    new Promise((a, b) => client.lpush(key, value, resolvePromise(a, b))),

  hgetall: (key = "key") =>
    new Promise((a, b) => client.hgetall(key, resolvePromise(a, b))),

  zscore: (key = "key", key2 = "") =>
    new Promise((a, b) => client.zscore(key, key2, resolvePromise(a, b))),

  zrem: (key = "key", key2 = "") =>
    new Promise((a, b) => client.zrem(key, key2, resolvePromise(a, b))),

  time: () => new Promise((a, b) => client.time(resolvePromise(a, b))),
};
