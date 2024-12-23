import { PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
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

export async function sendMagicLinkEmail(magicLink:string, email:string) {
   const sender = {
      name: 'computer@bransonschlegel.com',
      email: 'computer@bransonschlegel.com',
   }
   const response = await mailtrap.send({
      from:sender,
      to: [{email}],
      subject: `Login link from ${PUBLIC_COMPANY_NAME} `,
      html: `Please click this link or paste it into your browser \
      to log in: <a href="${PUBLIC_URL}/login/magicLink/${magicLink}">${PUBLIC_URL}/login/magicLink/${magicLink}</a>`
   }).catch((err) =>{
      console.error(err);
   })
   return response;
}