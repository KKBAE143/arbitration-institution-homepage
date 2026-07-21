import nodemailer from "nodemailer"

export async function sendMail(input: { to: string; subject: string; text: string }) {
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV !== "production") console.info(`[mail preview] ${input.to}: ${input.subject}`)
    return { delivered: false, preview: true }
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  })
  await transport.sendMail({ from: process.env.SMTP_FROM, ...input })
  return { delivered: true, preview: false }
}
