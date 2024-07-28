import path from 'path'
import type { AfterChangeHook } from 'payload/dist/collections/config/types'
import type { Order } from '../../../payload-types'
import generateEmailHTML from './utilities/generateEmailHTML'
import { generatePDF } from './utilities/generatePDF'
import fs from 'fs'

export const sendOrderConfirmation: AfterChangeHook<Order> = async ({ doc, req, operation }) => {
  const { payload } = req

  console.log('sendOrderConfirmation hook triggered')
  console.log('Order created:', doc)

  if (operation === 'create' && req.user) {
    const orderedBy = req.user.id
    console.log('Ordered by:', orderedBy)

    try {
      // Find the user by ID
      const user = await payload.findByID({
        collection: 'users',
        id: orderedBy,
      })

      console.log('User found:', user)

      if (user) {
        const emailData = {
          invoiceNumber: '1/2024',
          sender: {
            name: 'Toifl Hans Christian e.U.',
            address: 'Meinhartsdorfergasse 10/2, 1150 Wien, Österreich',
          },
          recipient: {
            name: user.name,
            address: user.address,
          },
          date: new Date().toLocaleDateString('de-AT'),
          items: doc.items.map(item => ({
            quantity: item.quantity,
            description: item.product.name,
            unitPriceBrutto: item.price,
            totalNetto: item.price * item.quantity * 0.8, // example calculation
            totalBrutto: item.price * item.quantity,
            mwst: item.price * item.quantity * 0.2, // example calculation
          })),
          total: doc.total,
        }

        // Generate HTML for the receipt
        const htmlContent = await generateEmailHTML(emailData)

        // Generate PDF
        const outputPath = path.join(__dirname, `../receipts/receipt_${doc.id}.pdf`)
        const pdfPath = await generatePDF(htmlContent, outputPath)

        // Read the generated PDF file as a Buffer
        const pdfBuffer = fs.readFileSync(pdfPath)

        // Send confirmation email with PDF attachment
        await payload.sendEmail({
          from: 'hamza@walker-vienna.com',
          to: user.email,
          subject: 'Order Confirmation',
          html: htmlContent,
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
