
import { validateSessionToken } from "$lib/server/authUtils";

import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
   const token = event.cookies.get('demoSession') ?? null;
   if(!token){
      event.locals.user = null;
      event.locals.session = null;
      return await resolve(event, {
         transformPageChunk: ({html}) => {
            return html.replace('data-theme=""', `data-theme="hamlindigo"`)
         }
      });
   }
   console.log(token);
   const { session, user } = await validateSessionToken(token);
   console.log('session', session);
   console.log('user', user);
   if(session){
      event.cookies.set('demoSession', token, {
         httpOnly: true,
         path: '/',
         secure: import.meta.env.PROD,
         sameSite: 'lax',
         expires: session.expiresAt
      })
   } else {      
      event.cookies.set('demoSession', '', {
         httpOnly: true,
         path: '/',
         secure: import.meta.env.PROD,
         sameSite: 'lax',
         maxAge: 0,
      })
   }
   event.locals.session = session;
   event.locals.user = user;
   const theme = event.cookies.get('theme')
   if(!theme){
      return await resolve(event, {
         transformPageChunk: ({html}) => {
            return html.replace('data-theme=""', `data-theme="seafoam"`)
         }
      })
   }
   return await resolve(event, {
      transformPageChunk: ({html}) => {
         return html.replace('data-theme=""', `data-theme="${theme}"`)
      }
   })
}
