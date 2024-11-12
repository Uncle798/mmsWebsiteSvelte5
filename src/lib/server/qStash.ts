import { QSTASH_TOKEN, UPSTASH_WORKFLOW_URL } from "$env/static/private";
import { Client } from "@upstash/qstash";

export const qstash = new Client({
   token: QSTASH_TOKEN, 
   baseUrl: UPSTASH_WORKFLOW_URL
})