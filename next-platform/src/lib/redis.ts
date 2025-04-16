import Redis from 'ioredis';

/*
$ brew install redis && brew services start redis
*/

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function cacheMessage(
  key: string, 
  value: string, 
  ttl: number = 3600
): Promise<void> {
  await redis.set(key, value, 'EX', ttl); // EX = expiration
}

export async function getCachedMessage(
  key: string
): Promise<string | null> {
  return await redis.get(key);
}

export async function getLatestCacheKey(): Promise<string | null> {
  const keys = await redis.keys("*");
  return keys.sort().pop() || null;
}

export default redis; 