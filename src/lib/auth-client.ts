import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
   baseURL: 'http://www.localhost:5173'
})