import type { Mail } from '../../interfaces/Mail'
import nodemailer, { type SendMailOptions } from 'nodemailer'
import fs from 'fs/promises'
import Mustache from 'mustache'

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 0,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

export const sendEmailService = async (payload: Mail): Promise<string> => {
  const { target, subject, message, msgBody, msgHeader } = payload

  try {
    const template = await fs.readFile('src/utils/templates/mail-verification.html', 'utf-8')
    const mailConfig: SendMailOptions = {
      from: '"No-reply Kita Tiket" <no-reply@kitatiket.com>',
      to: target,
      subject,
      html: Mustache.render(template, { message, msgBody, msgHeader })
    }
    const mailInfo = await transporter.sendMail(mailConfig)

    return mailInfo.messageId
  } catch (error: any) {
    throw new Error(error.message as string)
  }
}
