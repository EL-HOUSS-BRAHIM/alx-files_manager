import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

client.on('error', (err) => console.error('Redis Client Error', err));

await client.connect();

/**
 * Redis client to interact with Redis server
 */
const redisClient = {
  /**
   * Pings the Redis server to check connection status
   */
  async ping() {
    return client.ping();
  },

  /**
   * Sets a key-value pair in Redis with an optional expiration time
   * @param {string} key - The key to set
   * @param {string} value - The value to set
   * @param {number} [duration] - The expiration time in seconds
   */
  async set(key, value, duration) {
    if (duration) {
      await client.setEx(key, duration, value);
    } else {
      await client.set(key, value);
    }
  },

  /**
   * Gets a value by key from Redis
   * @param {string} key - The key to get the value for
   */
  async get(key) {
    return client.get(key);
  },

  /**
   * Deletes a key from Redis
   * @param {string} key - The key to delete
   */
  async del(key) {
    return client.del(key);
  }
};

export default redisClient;
