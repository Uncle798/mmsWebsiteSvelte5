
import { functions, inngest } from '$lib/server/inngest/inngest';
import { serve } from 'inngest/sveltekit';

const inngestServe = serve({ client: inngest, functions}); 
export const GET = inngestServe.GET;
export const POST = inngestServe.POST;
export const PUT = inngestServe.PUT;