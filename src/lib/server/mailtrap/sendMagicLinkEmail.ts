import { PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
import { VERCEL_URL } from '$env/static/private';
import { mailtrap, sender } from "./mailtrap";

let url = VERCEL_URL ? VERCEL_URL : PUBLIC_URL;

export async function sendMagicLinkEmail(magicLink: string, email: string) {
   if (email.includes('veryFakeEmail.com'.toLowerCase()) || email.includes('yetAnotherFakeEmail.com'.toLowerCase())) {
      return null;
   }
   try {
      const response = await mailtrap.send({
         from: sender,
         to: [{ email }],
         subject: `Login link from ${PUBLIC_COMPANY_NAME} `,
         html: `Please click this link or paste it into your browser \
         to log in: <a href="${url}/login/magicLink/${magicLink}">${url}/login/magicLink/${magicLink}</a>`
      }).catch((err) => {
         console.error(err);
      });
      return response;
   } catch (error) {
      console.error(error);
      return error;
   }
}
