const { Socket } = require("dgram");
const { createClient } = require("redis");
const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_USERNAME,
  REDIS_PASSWORD,
  REDIS_DB_INDEX_NBQ,
  NODE_ENV,
} = process.env;

let redisClient = null;
async function connectRedisInstance() {
  const REDIS_OPTIONS = {
    ...(REDIS_USERNAME ? { username: REDIS_USERNAME } : {}),
    ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
    database: Number(REDIS_DB_INDEX_NBQ),
  };

  console.log("~~~~REDIS_OPTIONS", REDIS_OPTIONS);

  // Create a Redis client with the specified configuration options
  redisClient = createClient(REDIS_OPTIONS);

  // Properly handle connection errors
  redisClient.on("error", err => console.log("Redis Client Error", err));

  redisClient.on("connect", () => {
    console.log("Connected to Redis server successfully!!");
  });

  // Connect to the Redis server
  await redisClient.connect();

  return redisClient;
}

// Example usage
connectRedisInstance()
  .then(() => {
    console.log("Connected to NBQ Redis server successful!");
  })
  .catch(err => {
    console.error("Failed to connect to Redis:", err);
  });

module.exports = {
  redisClient,
};
