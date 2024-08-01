import type { AfterChangeHook } from 'payload/dist/collections/config/types'
import type { Order } from '../../../payload-types'

export const sendOrderConfirmation: AfterChangeHook<Order> = async ({ req }) => {
  const { payload } = req
  const email = req.user.email

  try {
    await payload.sendEmail({
      to: email,
      from: {
        name: 'Smoking-Austria',
        address: process.env.EMAIL_SALES,
      },
      subject: 'Your order has been confirmed',
      text: 'We will begin processing your order shortly. Thank you for your patience.',
    })
    console.log('sendOrderConfirmation called on the client. Email sent to:', email)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
