import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (request) => {
   console.log(request)
   return new Response(null, {status:200});
};