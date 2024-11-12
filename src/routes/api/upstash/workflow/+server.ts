import { serve } from '@upstash/qstash/svelte';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = serve(
   async (context) => {
      await context.run("1st step", () => {
         console.log('1st step ran')
      })
      await context.run("second-step", () => {
         console.log("second step ran")
       })
   },
   { env, verbose:true,  }
)