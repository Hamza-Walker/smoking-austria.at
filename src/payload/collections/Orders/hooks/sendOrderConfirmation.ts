import path from 'path'
import fs from 'fs'
import Handlebars from 'handlebars'
import inlineCSS from 'inline-css'
import type { AfterChangeHook } from 'payload/dist/collections/config/types'
import type { Order } from '../../../payload-types'
import { formatCurrency } from './utilities/formatCurrency'
import { generatePDF } from './utilities/generatePDF'

export const sendOrderConfirmation: AfterChangeHook<Order> = async ({ doc, req, operation }) => {
  if (typeof window !== 'undefined') {
    return
  }

  const { payload } = req

  console.log('sendOrderConfirmation hook triggered')
  console.log('Order created:', doc)

  if (operation === 'create' && req.user) {
    const orderedBy = req.user.id
    console.log('Ordered by:', orderedBy)

    try {
      const user = await payload.findByID({
        collection: 'users',
        id: orderedBy,
      })

      console.log('User found:', user)

      if (user) {
        const date = new Date().toLocaleDateString('de-AT').replace(/\./g, '-')
        const uniqueID = Math.floor(1000 + Math.random() * 9000)
        const invoiceNumber = `INV-${user.id}-${date}-${uniqueID}`
        const paymentMethod = doc.stripePaymentIntentID ? 'Card' : 'Check'

        const emailData = {
          invoiceNumber,
          date,
          sender: {
            name: 'Toifl Hans Christian e.U.',
            address: 'Meinhartsdorfergasse 10/2, 1150 Wien, Österreich',
          },
          recipient: {
            name: user.name,
            address: user.email,
          },
          paymentMethod,
          items: doc.items.map(item => ({
            quantity: item.quantity,
            description: item.product.title || 'No title',
            unitPriceBrutto: formatCurrency(item.price),
            totalNetto: formatCurrency(item.price * item.quantity * 0.8),
            totalBrutto: formatCurrency(item.price * item.quantity),
            mwst: formatCurrency(item.price * item.quantity * 0.2),
          })),
          total: formatCurrency(doc.total),
        }

        // Read and compile the email template
        const emailTemplatePath = path.join(__dirname, 'utilities', 'emailTemplate.html')
        const emailTemplateSource = fs.readFileSync(emailTemplatePath, 'utf-8')
        const compiledEmailTemplate = Handlebars.compile(emailTemplateSource)
        const emailHTML = await inlineCSS(compiledEmailTemplate(emailData), {
          url: ' ',
          removeStyleTags: false,
        })

        // Read and compile the receipt template
        const receiptTemplatePath = path.join(__dirname, 'utilities', 'recieptTemplate.html')
        const receiptTemplateSource = fs.readFileSync(receiptTemplatePath, 'utf-8')
        const compiledReceiptTemplate = Handlebars.compile(receiptTemplateSource)
        const receiptHTML = compiledReceiptTemplate(emailData)

        // Generate PDF
        const outputPath = path.join(__dirname, `../receipts/receipt_${doc.id}.pdf`)
        const pdfPath = await generatePDF(receiptHTML, outputPath)

        // Read the generated PDF file as a Buffer
        const pdfBuffer = fs.readFileSync(pdfPath)

        // Send confirmation email with PDF attachment
        await payload.sendEmail({
          from: 'hamza@walker-vienna.com',
          to: user.email,
          subject: 'Order Confirmation',
          html: emailHTML,
          attachments: [
            {
              filename: 'receipt.pdf',
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        })

        console.log(`Email sent to: ${user.email}`)

        // Clean up the generated PDF file
        fs.unlinkSync(pdfPath)
      } else {
        console.error('User not found:', orderedBy)
      }
    } catch (err) {
      console.error('Error finding user or sending email:', err)
    }
  } else {
    console.log('Operation is not create or req.user is not defined')
  }
}
