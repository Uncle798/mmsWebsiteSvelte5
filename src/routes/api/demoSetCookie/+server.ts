import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
   const demoPage = event.url.searchParams.get('demoPage');
   if(demoPage){
      event.cookies.set(`${demoPage}`, 'true', {path: '/', maxAge:60*60*24*7})
   }
   return new Response(null, {status: 200});
};