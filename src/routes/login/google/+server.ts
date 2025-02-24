import { generateCodeVerifier, generateState } from 'arctic';
import type { RequestHandler } from './$types';
import { googleOAuth } from '$lib/server/oauth';

export const GET: RequestHandler = async (event) => {
   const state = generateState();
   const codeVerifier = generateCodeVerifier();
   const url = googleOAuth.createAuthorizationURL(state, codeVerifier, ['email', 'openid', 'profile']);
   event.cookies.set('googleOauthState', state, {
      httpOnly: true,
      maxAge: 60 *10,
      secure: import.meta.env.PROD,
      path: '/',
      sameSite: 'lax'
   });
   event.cookies.set('googleCodeVerifier', codeVerifier, {
      httpOnly: true,
      maxAge: 60*10,
      secure: import.meta.env.PROD,
      path: '/',
      sameSite: 'lax'
   })
   return new Response(null, {
      status: 302,
      headers: {
         Location: url.toString()
      }
   });
};