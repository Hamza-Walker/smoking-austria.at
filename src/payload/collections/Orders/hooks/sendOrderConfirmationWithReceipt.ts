import type { AfterChangeHook } from 'payload/dist/collections/config/types'
import Handlebars from 'handlebars'
import type { Order, Product } from '../../../payload-types'
import { formatCurrency } from './utilities/formatCurrency'
import fs from 'fs'
import { generatePDF } from './utilities/generatePDF'
import inlineCSS from 'inline-css'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

export const sendOrderConfirmationWithReceipt: AfterChangeHook<Order> = async ({
  doc,
  req,
  operation,
}) => {
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
        const taxNumber = user.taxNumber || 'ATU-'

        // Combine both discount fields
        const totalDiscount = (doc.discountAmount ?? 0) + (doc.autoDiscount ?? 0)

        const emailData = {
          invoiceNumber,
          date,
          taxNumber,
          sender: {
            name: 'Toifl Hans Christian e.U.',
            address: 'Meinhartsdorfergasse 10/2,<br>1150 Wien,<br>Österreich',
          },
          recipient: {
            name: user.name,
            address: user.address
              ? `${user.address.street || ''},
              <br> ${user.address.zipCode || ''} ${user.address.city || ''},
              <br> ${user.address.country || ''}`
              : '',
          },
          paymentMethod,
          items: doc.items.map(item => ({
            quantity: item.quantity,
            description:
              typeof item.product === 'string'
                ? 'No title'
                : (item.product as Product).title || 'No title',

            unitPriceBrutto: formatCurrency(item.price),
            totalNetto: formatCurrency(item.price * item.quantity * 0.8),
            totalBrutto: formatCurrency(item.price * item.quantity),
            mwst: formatCurrency(item.price * item.quantity * 0.2),
          })),
          discount: totalDiscount > 0 ? formatCurrency(totalDiscount) : null,
          hasDiscount: totalDiscount > 0,
          manualDiscount: doc.discountAmount ? formatCurrency(doc.discountAmount) : null,
          autoDiscount: doc.autoDiscount ? formatCurrency(doc.autoDiscount) : null,
          total: formatCurrency(doc.total),
          shippingMessage:
            ' Please note that shipping costs will be calculated and added to your order separately. A member of our team will contact you shortly with an updated invoice reflecting the final total, including shipping charges.',
        }
        console.log('discount:', doc.discountAmount)
        console.log('Auto Discount:', doc.autoDiscount)
        console.log('total:', doc.total)
        // Paths
        const emailTemplatePath = path.join(__dirname, 'utilities', 'emailTemplate.html')
        const receiptTemplatePath = path.join(__dirname, 'utilities', 'recieptTemplate.html')
        const outputPath = path.join(__dirname, `../receipts/receipt_${doc.id}.pdf`)

        // Ensure receipts directory exists
        ensureDirectoryExistence(outputPath)

        // Read and compile the email template
        const emailTemplateSource = fs.readFileSync(emailTemplatePath, 'utf-8')
        const compiledEmailTemplate = Handlebars.compile(emailTemplateSource)
        const emailHTML = await inlineCSS(compiledEmailTemplate(emailData), {
          url: ' ',
          removeStyleTags: false,
        })

        // Read and compile the receipt template
        const receiptTemplateSource = fs.readFileSync(receiptTemplatePath, 'utf-8')
        const compiledReceiptTemplate = Handlebars.compile(receiptTemplateSource)
        const receiptHTML = compiledReceiptTemplate(emailData)

        // Generate PDF
        const pdfPath = await generatePDF(receiptHTML, outputPath)

        // Read the generated PDF file as a Buffer
        const pdfBuffer = fs.readFileSync(pdfPath)

        // Send confirmation email with PDF attachment to sales
        await payload.sendEmail({
          from: process.env.EMAIL_SALES,
          to: process.env.EMAIL_SALES,
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
        // Second email to the customer
        await payload.sendEmail({
          from: process.env.EMAIL_SALES || 'office@stamm-baum.at',
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
    } catch (err: unknown) {
      console.error('Error finding user or sending email:', err)
    }
  } else {
    console.log('Operation is not create or req.user is not defined')
  }
}

// Function to ensure directory existence
const ensureDirectoryExistence = (filePath: string): boolean => {
  const dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}
