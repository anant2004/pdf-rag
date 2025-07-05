import IORedis from 'ioredis';

const REDIS_URL="rediss://default:Ab-eAAIjcDExNmUxMGYxOTUyNDk0OTVjYTI1YWM3YzQwOTRmZjY4MnAxMA@innocent-anchovy-49054.upstash.io:6379"

const connection = new IORedis(REDIS_URL, {
  tls: REDIS_URL?.startsWith("rediss://") ? {} : undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  keepAlive: 10000,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000); // Exponential backoff up to 2s
    console.warn(`Redis recoNNecting (attempt ${times}). Retrying in ${delay}ms...`);
    return delay;
  }
});

// Log successful connection
connection.on('connect', () => {
  console.log('Redis client connected');
});

// Log when Redis is ready to receive commands
connection.on('ready', () => {
  console.log('Redis client is ready');
});

// Log disconnect
connection.on('end', () => {
  console.warn('Redis connection closed');
});

// Log errors
connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export { connection };
