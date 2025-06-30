import { PrismaClient } from "@prisma/client";
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';
import dayjs from "dayjs";

const prisma = new PrismaClient();

function generateSessionToken():string {
   const bytes = new Uint8Array(20);
   crypto.getRandomValues(bytes);
   const token = encodeBase32LowerCaseNoPadding(bytes);
   return token;
}

async function main() {
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
   let session = await prisma.session.findFirst({
      where: {
         userId: user.id
      }
   })
   if(!session){
      session = await prisma.session.create({
         data: {
            userId: user.id,
            expiresAt: dayjs().add(1, 'month').toDate(),
            id: process.env.DEMO_SESSION_TOKEN!,
         }
      })
   }
}

main().catch((error) => {
   console.error(error);
   process.exit(1);
}).finally(()=>{
   prisma.$disconnect();
})