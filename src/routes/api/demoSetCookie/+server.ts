import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
   const demoPage = event.url.searchParams.get('demoPage');
   if(demoPage){
      let path=demoPage.replace(/(?<!^)(?=[A-Z])/, '/');
      console.log(path)
      event.cookies.set(`${demoPage}Complete`, 'true', {path:'/' + path?.toLowerCase(), maxAge:60*60*24})
   }
   return new Response(null, {status: 200});
};