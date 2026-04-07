import { Resend } from "resend"

export const resend = new Resend(process.env.SEND_EMAIL_API_KEY)