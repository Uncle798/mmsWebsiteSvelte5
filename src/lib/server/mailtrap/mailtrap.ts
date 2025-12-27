import { MailtrapClient } from "mailtrap";
import { MAILTRAP_TOKEN } from "$env/static/private";

export const mailtrap = new MailtrapClient({token:MAILTRAP_TOKEN})

export const sender = {
   name: 'info@moscowministorage.com',
   email: 'info@moscowministorage.com',
}
