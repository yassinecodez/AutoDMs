import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const getRedisConnection = () => {
  const connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ
  });

  // Gracefully handle connection errors (e.g. during build or local downtime)
  connection.on("error", (err) => {
    console.warn(`[Redis] Connection warning: ${err.message}`);
  });

  return connection;
};

const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || getRedisConnection();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
