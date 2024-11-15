import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { generateRandomString } from '@oslojs/crypto/random';
import type { RandomReader } from '@oslojs/crypto/random';
import { sha256 } from '@oslojs/crypto/sha2';
import { prisma } from './prisma';
import type { PartialUser } from "./partialTypes";
import type { Session, } from "@prisma/client";
import dayjs from 'dayjs';
import type { RequestEvent } from '@sveltejs/kit';

const dayOfMs = 1000*60*60*24

export function generateSessionToken():string {
   const bytes = new Uint8Array(20);
   crypto.getRandomValues(bytes);
   const token = encodeBase32LowerCaseNoPadding(bytes);
   return token;
}

export async function createSession(token: string, userId:string):Promise<Session> {
   const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
   const session: Session = {
      id: sessionId,
      userId, 
      expiresAt: new Date(Date.now() + dayOfMs * 30)
   }
   await prisma.session.create({
      data:session
   })
   return  session 
}

export async function validateSessionToken(token:string):Promise<SessionValidationResult> {
   const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
   const session = await prisma.session.findFirst({
      where: {
         id: sessionId,
      },
   });
   const user = await prisma.user.findFirst({
      where: {
         id: session?.userId
      },
      omit:{
         createdAt: true,
         updatedAt: true,
      }
   })
   if(!session){
      return {session: null, user: null};
   }
   if(Date.now() >= session.expiresAt.getTime()) {
      await prisma.session.delete({
         where: {
            id: sessionId,
         }
      });
      return { session: null, user: null};
   }
   if(Date.now() >= session.expiresAt.getDate() - dayOfMs * 15){
      session.expiresAt = new Date(Date.now() + dayOfMs * 30);
      await prisma.session.update({
         where: {
            id: sessionId
         },
         data:{
            expiresAt: session.expiresAt
         }
      });
   }
   return { session, user }
}

export async function invalidateSession(sessionId:string):Promise<void> {
   await prisma.session.delete({
      where:{
         id: sessionId
      }
   })
}

export function setSessionTokenCookie(event: RequestEvent, token:string, expiresAt: Date):void {
   event.cookies.set('session', token, {
      httpOnly: true,
      path: '/',
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      expires: expiresAt
   })
}

export function deleteSessionTokenCookie(event: RequestEvent):void {
   event.cookies.set('session', '', {
      httpOnly: true,
      path: '/',
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 0
   })
}

export function generateRandomOTP():string {
   const bytes = new Uint8Array(5);
   crypto.getRandomValues(bytes);
   const code = encodeBase32LowerCaseNoPadding(bytes);
   return code;
}

export function generateRandomRecoveryCode(): string {
   const recoveryCodeBytes = new Uint8Array(10);
   crypto.getRandomValues(recoveryCodeBytes);
   const recoveryCode = encodeBase32LowerCaseNoPadding(recoveryCodeBytes);
   return recoveryCode;
}

export async function generateEmailVerificationRequest(userId:string, email: string): Promise<string> {
   const user = await prisma.user.findFirst({
      where: {
         id: userId
      }
   })
   console.log(user)
   const del = await prisma.verification.deleteMany({
      where: {
         userId: userId,
      }
   })
   console.log(del)
   const random:RandomReader = {
      read(bytes) {
         crypto.getRandomValues(bytes)
      }
   }
   const code = generateRandomString(random, '0123456789', 8);
   console.log(code)
   const expiresAt = dayjs(new Date).add(15, 'minutes').toDate();
   await prisma.verification.create({
      data:{
         userId,
         email,
         code,
         expiresAt,
      }
   })
   return code;
}


export type SessionValidationResult =
   | {session:Session; user:PartialUser | null}
   | {session:null; user:null};