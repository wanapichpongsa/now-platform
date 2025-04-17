"use server";
import Redis from 'ioredis';
/*
$ brew install redis && brew services start redis
*/

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// use server file can only 'export async function' meaning I can't call native functions?
// why can't have nested asyncs?
export async function getLatestKey(): Promise<string | null> {
  const keys = await redis.keys("*");
  return keys.sort().pop() || null;
}

export async function cacheMessage(
  value: string, 
  ttl: number = 3600
): Promise<void> {
  const latestKey = await getLatestKey() || "MSG-1";
  const newKey = `MSG-${parseInt(latestKey.split('-')[1]) + 1}`;
  await redis.set(newKey, value, 'EX', ttl); // EX = expiration
}

export async function getCachedMessage(
  key: string
): Promise<string | null> {
  const splitKey = key.split('-');
  if (splitKey[0] !== "MSG" && !(parseInt(splitKey[1]))) throw new Error('message key must be MSG-{int}');
  return await redis.get(key);
}

export async function cacheFile(base64String: string): Promise<string> {
  const latestKey = await getLatestKey() || "FS-1";
  const newKey = `FS-${parseInt(latestKey.split('-')[1]) + 1}`;
  await redis.set(newKey, base64String);
  return newKey
}

export async function getCachedFile(
  key: string
): Promise<string | null> {
  const splitKey = key.split('-');
  if (splitKey[0] !== "FS" && !(parseInt(splitKey[1]))) throw new Error('file key must be FS-{int}');
  return await redis.get(key);
}