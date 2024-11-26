
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load = (async (event) => {

   const unitNum = event.params.unitNum;
   if(!unitNum){
      fail(400)
   }
   const unit = await prisma.unit.findUnique({
      where: {
         num: unitNum
      }
   });
   return { unit, };
}) satisfies PageServerLoad;