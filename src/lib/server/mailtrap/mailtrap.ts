import { MailtrapClient } from "mailtrap";

const token = process.env.MAILTRAP_TOKEN!;
export const currencyFormatter = new Intl.NumberFormat('en-us', {style: 'currency', currency:'USD'})
export const mailtrap = new MailtrapClient({token})

export const sender = {
   name: 'info@moscowministorage.com',
   email: 'info@moscowministorage.com',
}
