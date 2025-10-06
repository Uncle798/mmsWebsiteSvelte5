import { PUBLIC_ADDRESS1, PUBLIC_ADDRESS_PHONE } from "$env/static/public";
import type { Address } from "@prisma/client";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({locals}) =>{
   const { user } = locals;
   return { user };
}