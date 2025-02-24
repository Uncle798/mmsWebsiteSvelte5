import { generateState } from 'arctic';
import type { RequestHandler } from './$types';
import { yahooOauth } from '$lib/server/oauth';

export const GET: RequestHandler = async (event) => {
   const state = generateState();
   const url = yahooOauth.createAuthorizationURL(state, ['openid', 'profile', 'email']);
   event.cookies.set('yahooOauthState', state, {
      httpOnly: true,
      maxAge: 60 *10,
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