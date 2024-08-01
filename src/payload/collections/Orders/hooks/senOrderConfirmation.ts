import type { AfterChangeHook } from 'payload/dist/collections/config/types'
import type { PayloadRequest } from 'payload/types'
import fs from 'fs'
import generateEmailHTML from './utilities/generateEmailHTML'
import generatePDF from './utilities/generatePDF'
import path from 'path'

const sendOrderConfirmationWithReceipt: AfterChangeHook = async ({
  doc,
  req,
}: {
  doc: any
  req: PayloadRequest
}) => {
  const orderId = doc.id
  const customerEmail = req.user.email

  console.log('sendOrderConfirmation called with:', { orderId, customerEmail })

  try {
    const receiptTemplatePath = path.join(__dirname, './utilities/recieptTemplate.html')
    const outputPath = path.join(__dirname, `../../../../../order_${orderId}.pdf`)

    if (!fs.existsSync(receiptTemplatePath)) {
      throw new Error(`Receipt template not found at ${receiptTemplatePath}`)
    }

    const receiptHtmlContent = fs.readFileSync(receiptTemplatePath, 'utf-8')
    await generatePDF(receiptHtmlContent, outputPath)

    const emailData = {
      recipient: {
        name: req.user.name,
        address: req.user.address,
      },
      invoiceNumber: orderId,
      date: new Date().toLocaleDateString(),
      sender: {
        name: 'Your Company Name',
        address: 'Your Company Address',
      },
    }

    const emailHtmlContent = await generateEmailHTML(emailData)

    const emailOptions = {
      from: process.env.EMAIL_SALES,
      to: customerEmail,
      subject: 'Order Confirmation',
      html: emailHtmlContent,
      attachments: [
        {
          filename: `order_${orderId}.pdf`,
          path: outputPath,
        },
      ],
    }

    await req.payload.sendEmail(emailOptions)

    const response = await fetch(
      `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users/order-confirmation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${req.user.token}`,
        },
        body: JSON.stringify({
          orderId,
          customerEmail,
        }),
      },
    )

    console.log('Order confirmation response status:', response.status)
    if (!response.ok) {
      console.error('Error response from order confirmation:', await response.text())
    }
  } catch (error: unknown) {
    console.error('Error sending order confirmation:', error)
  }
}

export default sendOrderConfirmationWithReceipt
