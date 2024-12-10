import { serve } from '@upstash/workflow/svelte';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { UPSTASH_WORKFLOW_URL } from '$env/static/private';

export const { POST } = serve(
   async (context) => {
      
      const payload = context.requestPayload
      console.log(`payload: ${payload}`);
      await context.run("1st step", () => {
         console.log('1st step ran' + payload)
      })
      await context.run("second-step", () => {
         console.log("second step ran")
       })
   },
   { 
      env,
      verbose: true,
   }
)