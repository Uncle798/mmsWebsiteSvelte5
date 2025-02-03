import { GOOGLE_MAPS_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {

   const user = event.locals.user
   if(!user){
      return new Response(JSON.stringify('User not specified'), { status:400 })
   }
   if(!user.employee){
      return new Response(JSON.stringify('Unauthorized'), {status:401})
   }
   const apiKey = GOOGLE_MAPS_KEY;
   return new Response(JSON.stringify(apiKey), {status:200});
};