import { createSession, generateSessionToken, setSessionTokenCookie, verifyMagicLink } from '$lib/server/authUtils';
import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load = (async (event) => {
   const linkToken = event.params.linkToken;
   const result = await verifyMagicLink(linkToken);
   if(result === 'not found'){
      return fail(404, {message:'token not found'})
   }
   if(result === 'expired'){
      redirect(302, '/login/magicLink?toast=linkExpired');
   }
   const user = await prisma.user.findUnique({
      where:{
         email: result
      }
   })
   if(!user){
      return fail(500)
   }
   const token = await generateSessionToken();
   const session = await createSession(token, user.id!);
   setSessionTokenCookie(event, token, session.expiresAt);
   const redirectTo = event.url.searchParams.get('redirectTo');
   const unitNum = event.url.searchParams.get('unitNum');
   if(redirectTo){
      return redirect(302, `/${redirectTo}?unitNum=${unitNum}`)
   }
   redirect(302, '/units/available');
}) satisfies PageServerLoad;