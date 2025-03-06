import { PUBLIC_ADDRESS1, PUBLIC_ADDRESS_PHONE } from "$env/static/public";
import type { Address } from "@prisma/client";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({locals}) =>{
   const { user } = locals;
   const mmsAddress:Address = {
      userId:'',
      addressId: '',
      address1:PUBLIC_ADDRESS1,
      address2:'',
      city:'Moscow',
      state:'ID',
      postalCode:'83704',
      country: '',
      phoneNum1:PUBLIC_ADDRESS_PHONE,
      phoneNum1Country:'1',
      phoneNum1Validated:true,
      softDelete:false
   }
   return { user, mmsAddress};
}