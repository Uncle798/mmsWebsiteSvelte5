import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
   console.log(event)
   return new Response();
};