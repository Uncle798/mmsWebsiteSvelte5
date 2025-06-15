
import { generateEmailVerificationRequest } from "$lib/server/authUtils";
import { sendVerificationEmail } from "$lib/server/mailtrap";
import { prisma } from "$lib/server/prisma";
import type { RequestHandler } from "@sveltejs/kit";

export const POST:RequestHandler = async (event) =>{
   const body = await event.request.json();
   const { userId } = body;
   if(!userId){
      return new Response(JSON.stringify('userId not provided'), {status: 400})
   }
   const user = await prisma.user.findUnique({
      where: {
         id: userId
      }
   })
   if(!user){
      return new Response(JSON.stringify('User not found'), { status: 404 });
   }
   if(!user.email){
      return new Response(JSON.stringify('user does not have an email address'));
   }
   const code = await generateEmailVerificationRequest(user.id, user.email);
   const response = await sendVerificationEmail(code, user.email);
   return new Response(JSON.stringify({email: user.email}), {status:200});
}