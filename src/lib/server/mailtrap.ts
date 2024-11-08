import { MailtrapClient } from "mailtrap";

const token = process.env.MAILTRAP_TOKEN!;
export const mailtrap = new MailtrapClient({token})

export async function sendVerificationEmail(verificationCode:string, email:string) {
   const sender = {
      name: 'computer@bransonschlegel.com',
      email: 'computer@bransonschlegel.com',
   }
   const response = await mailtrap.send({
      from:sender,
      to: [{email}],
      subject: "Please verify your email",
      html: `Verification code: ${verificationCode}`
   }).catch((err) =>{
      console.error(err);
   })
   return response;
}