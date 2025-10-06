import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/authUtils';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (async () => {
   return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
   default: async (event) =>{
      if(event.locals.session === null ){
         error(401)
      }
      invalidateSession(event.locals.session.id)
      deleteSessionTokenCookie(event);
      event.locals.user = null;
      return redirect(302,'/')
   }
};