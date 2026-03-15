import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only instantiate if env vars are present (skip in dev without Upstash)
function createRatelimiter(requests: number, window: `${number} s` | `${number} m` | `${number} h`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

// 3 requests per hour per IP — contact form
export const contactRatelimit = createRatelimiter(3, '1 h');

// 10 requests per 10 minutes per IP — checkout
export const checkoutRatelimit = createRatelimiter(10, '10 m');

export function getIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() ?? real ?? '127.0.0.1';
}
