import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { UPSTASH_PASSWORD, UPSTASH_ENDPOINT } from '$env/static/private';


const redis = new Redis({
   url: `https://${UPSTASH_ENDPOINT}`,
   token: UPSTASH_PASSWORD,
})

export const ratelimit = {
   register: new Ratelimit({
      redis,
      analytics: false,
      prefix: 'ratelimit:register',
      limiter: Ratelimit.slidingWindow(1, '15s')
   }),
   login: new Ratelimit({
      redis,
      analytics: false,
      prefix: 'ratelimit:login',
      limiter: Ratelimit.slidingWindow(1, '10s')
   }),
   emailVerification: new Ratelimit({
      redis,
      analytics: false, 
      prefix: 'ratelimit:emailVerification',
      limiter: Ratelimit.slidingWindow(1, '20s')
   }),
   createLease: new Ratelimit({
      redis,
      analytics: false,
      prefix: 'ratelimit:createLease',
      limiter: Ratelimit.slidingWindow(1, '10s')
   }),
   employeeForm: new Ratelimit({
      redis,
      analytics: false,
      prefix: 'ratelimit:employeeForm',
      limiter: Ratelimit.slidingWindow(1, '5s'),
   }),
   customerForm: new Ratelimit({
      redis,
      analytics: false,
      prefix: 'ratelimit:customerForm',
      limiter: Ratelimit.slidingWindow(1, '7s'),
   }),
}