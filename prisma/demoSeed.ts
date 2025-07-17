import { prisma } from '../src/lib/server/prisma';
import { createSession } from '../src/lib/server/authUtils'

async function main() {
   if(process.env.VERCEL){
      let user = await prisma.user.findUnique({
         where: {
            email: process.env.USER_EMAIL
         }
      })
      if(!user){
         user = await prisma.user.create({
            data: {
               givenName: process.env.USER_GIVEN_NAME,
               familyName: process.env.USER_FAMILY_NAME,
               email: process.env.USER_EMAIL,
               emailVerified: true,
               employee: true,
               admin: true,
            }
         });
      }
      console.log('user', user)
      let session = await prisma.session.findFirst({
         where: {
            userId: user.id
         }
      })
      if(!session){
         if(process.env.DEMO_SESSION_TOKEN){
            const session = createSession(process.env.DEMO_SESSION_TOKEN!, user.id)
         }
      }
      console.log('session', session)
   }
}

main().catch((error) => {
   console.error(error);
   process.exit(1);
}).finally(()=>{
   prisma.$disconnect();
})