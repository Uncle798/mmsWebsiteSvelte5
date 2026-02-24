import { mailtrap, sender } from "./mailtrap";

export async function sendVerificationEmail(verificationCode: string, email: string) {
   if (email.includes('veryFakeEmail.com'.toLowerCase()) || email.includes('yetAnotherFakeEmail.com'.toLowerCase())) {
      return null;
   }
   try {
      const response = await mailtrap.send({
         from: sender,
         to: [{ email }],
         subject: "Please verify your email",
         html: `Verification code: ${verificationCode}`
      }).catch(async(err) => {
         console.error(err);
      });
      return response;
   } catch (error) {
      console.error(error);
      return error;
   }
}
