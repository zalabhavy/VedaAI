import Redis from 'ioredis';

let redis: Redis;

export async function connectRedis(): Promise<Redis> {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  redis = new Redis(url, {
    maxRetriesPerRequest: null,
    tls: url.startsWith('rediss://') ? {} : undefined,
  });
  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err));
  return redis;
}

export function getRedis(): Redis {
  return redis;
}
