

import { decodeIdToken, type OAuth2Tokens } from 'arctic';
import {ObjectParser} from '@pilcrowjs/object-parser'
import type { RequestHandler } from './$types';
import { googleOAuth } from '$lib/server/oauth';
import { prisma } from '$lib/server/prisma';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/authUtils';

export const GET: RequestHandler = async (event) => {
   const storedState = event.cookies.get('googleOauthState') ?? null;
   const codeVerifier = event.cookies.get('googleCodeVerifier') ?? null;
   const code = event.url.searchParams.get('code');
   const state = event.url.searchParams.get('state');
   if(storedState === null || codeVerifier === null || code === null || state === null) {
      return new Response('Please restart the process something is null', { status: 400});
   }
   if(storedState !== state) {
      return new Response('Please restart the process state doesn\'t equal stored state', {status: 400});
   }
   let tokens:OAuth2Tokens;
   try {
      tokens = await googleOAuth.validateAuthorizationCode(code, codeVerifier);  
   } catch (error) {
      console.error(error);
      return new Response('Please restart the process tokens invalid', {status: 400});
   }
   const claims = decodeIdToken(tokens.idToken());
   const claimsParser = new ObjectParser(claims);
   const email = claimsParser.getString('email');
   const googleId = claimsParser.getString('sub');
   const givenName = claimsParser.getString('given_name');
   const familyName = claimsParser.getString('family_name');
   const existingUser = await prisma.user.findUnique({
      where: {
         email
      }
   })
   if(existingUser){
      if(!existingUser.googleId){
         await prisma.user.update({
            where: {
               email
            },
            data: {
               googleId
            }
         })
      }
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, existingUser.id);
      setSessionTokenCookie(event, sessionToken,  session.expiresAt);
      return new Response(null, {status:302, headers: { Location: '/'}})
   }
   const user = await prisma.user.create({
      data: {
         email,
         googleId,
         givenName,
         familyName,
         emailVerified: true
      }
   })
   const sessionToken = generateSessionToken();
   const session = await createSession(sessionToken, user.id);
   setSessionTokenCookie(event, sessionToken, session.expiresAt);
   return new Response(null, {status:302, headers:{Location:'/'}});
};