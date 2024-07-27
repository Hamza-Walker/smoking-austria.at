import dotenv from 'dotenv'
import path from 'path'

// This file is used to replace `server.ts` when ejecting i.e. `yarn eject`
// See `../eject.ts` for exact details on how this file is used
// See `./README.md#eject` for more information

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

import express from 'express'
import nodemailer from 'nodemailer'
import payload from 'payload'

import { seed } from './payload/seed'

const app = express()
const PORT = process.env.PORT || 3000

// Redirect root to the admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})


const transport = nodemailer.createTransport({
  host: 'smtp0001.neo.space', // Update with actual SMTP host
  port: 465, // Update with actual port
  auth: {
    user: 'hamza@walker-vienna.com', // Update with your email
    pass: process.env.EMAIL_PASSWORD, // Ensure to use environment variables for sensitive data
  },
})
console.log(transport)
const emailConfig = {
  fromName: 'Hamza Walker',
  fromAddress: 'hamza@walker-vienna.com',
  transport,
}
const start = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || '',
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
    email: emailConfig,
  })

  if (process.env.PAYLOAD_SEED === 'true') {
    await seed(payload)
    process.exit()
  }

  app.listen(PORT, async () => {
    payload.logger.info(`App URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}`)
  })
}

start()
