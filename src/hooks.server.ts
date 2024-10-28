
import { validateSessionToken } from "$lib/server/authUtils";

import type { Handle } from "@sveltejs/kit";

export const authHandle: Handle = async ({ event, resolve }) => {
   const token = event.cookies.get('session') ?? null;
   if(!token){
      event.locals.user = null;
      event.locals.session = null;
      return resolve(event);
   }
   const { session, user } = await validateSessionToken(token);
   if(session){
      event.cookies.set('session', token, {
         httpOnly: true,
         path: '/',
         secure: import.meta.env.PROD,
         sameSite: 'lax',
         expires: session.expiresAt
      })
   } else {      
      event.cookies.set('session', '', {
         httpOnly: true,
         path: '/',
         secure: import.meta.env.PROD,
         sameSite: 'lax',
         maxAge: 0,
      })
   }
   event.locals.session = session;
   event.locals.user = user;
   return resolve(event)
}
