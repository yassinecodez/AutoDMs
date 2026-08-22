import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

export const getRedisConnection = () => {
  if (!REDIS_URL) {
    console.log("[Redis] No REDIS_URL configured. Skipping connection.");
    return null;
  }
  const connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ
  });

  // Gracefully handle connection errors (e.g. during build or local downtime)
  connection.on("error", (err) => {
    console.warn(`[Redis] Connection warning: ${err.message}`);
  });

  return connection;
};

const globalForRedis = global as unknown as { redis: any };

export const redis = globalForRedis.redis || getRedisConnection();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
