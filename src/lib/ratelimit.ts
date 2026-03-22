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

// 20 downloads per 10 minutes per IP
export const downloadRatelimit = createRatelimiter(20, '10 m');

// 10 free claims per hour per IP
export const freeClaimRatelimit = createRatelimiter(10, '1 h');

// 5 auth attempts per 15 minutes per IP (login, register, password reset)
export const authRatelimit = createRatelimiter(5, '15 m');

// 10 profile updates per hour per IP
export const profileRatelimit = createRatelimiter(10, '1 h');

// 30 affiliate click tracks per minute per IP (prevent bot abuse)
export const affiliateClickRatelimit = createRatelimiter(30, '1 m');

export function getIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() ?? real ?? '127.0.0.1';
}
