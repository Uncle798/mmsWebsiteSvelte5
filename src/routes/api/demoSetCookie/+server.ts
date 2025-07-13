import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
   const demoPage = event.url.searchParams.get('demoPage');
   if(demoPage){
      event.cookies.set(`${demoPage}Complete`, 'true', {path:demoPage, maxAge:60*60*24})
   }
   return new Response(null, {status: 200});
};