import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } from '$env/static/private';


const redis = new Redis({
   url: UPSTASH_REDIS_REST_URL,
   token: UPSTASH_REDIS_REST_TOKEN,
})

export const ratelimit = {
   register: new Ratelimit({
      redis,
      analytics: false,
      prefix: 'ratelimit:register',
      timeout: 15000,
      limiter: Ratelimit.slidingWindow(1, '15s')
   }),
   login: new Ratelimit({
      redis,
      analytics: false,
      prefix: 'ratelimit:login',
      timeout: 5000,
      limiter: Ratelimit.slidingWindow(1, '5s')
   }),
   emailVerification: new Ratelimit({
      redis,
      analytics: false, 
      prefix: 'ratelimit:emailVerification',
      timeout: 10000,
      limiter: Ratelimit.slidingWindow(1, '10s')
   }),
   createLease: new Ratelimit({
      redis,
      analytics: true,
      prefix: 'ratelimit:createLease',
      timeout: 10000,
      limiter: Ratelimit.slidingWindow(1, '10s')
   }),
   employeeForm: new Ratelimit({
      redis,
      analytics: true,
      prefix: 'ratelimit:employeeForm',
      timeout: 1000,
      limiter: Ratelimit.slidingWindow(1, '1s'),
   }),
   customerForm: new Ratelimit({
      redis,
      analytics: false,
      prefix: 'ratelimit:customerForm',
      timeout: 7000,
      limiter: Ratelimit.slidingWindow(1, '7s'),
   }),
}