
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';


export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const unitNum = event.params.unitNum;
   if(!unitNum){
      fail(400)
   }
   const unit = await prisma.unit.findUnique({
      where: {
         num: unitNum
      }, 
      include: {
         lease: {
            include: {
               customer: true
            },
            orderBy: {
               leaseEnded:{
                  sort: 'desc',
                  nulls: 'first',               }
            }
         }
      }
   });
   return { unit, };
}) satisfies PageServerLoad;