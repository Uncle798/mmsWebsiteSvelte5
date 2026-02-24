import { PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
import { mailtrap, sender } from "./mailtrap";

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
         to log in: <a href="${PUBLIC_URL}/login/magicLink/${magicLink}">${PUBLIC_URL}/login/magicLink/${magicLink}</a>`
      }).catch((err) => {
         console.error(err);
      });
      return response;
   } catch (error) {
      console.error(error);
      return error;
   }
}
