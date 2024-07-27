import type { AfterChangeHook } from 'payload/dist/collections/config/types';
import type { Order } from '../../../payload-types';

export const sendOrderConfirmation: AfterChangeHook<Order> = async ({ doc, req, operation }) => {
  const { payload } = req;

  console.log('sendOrderConfirmation hook triggered');
  console.log('Order created:', doc);

  if (operation === 'create' && req.user) {
    const orderedBy = req.user.id;
    console.log('Ordered by:', orderedBy);

    try {
      // Find the user by ID
      const user = await payload.findByID({
        collection: 'users',
        id: orderedBy,
      });

      console.log('User found:', user);

      if (user) {
        // Send confirmation email
        await payload.sendEmail({
          from: 'hamza@walker-vienna.com',
          to: user.email,
          subject: 'Order Confirmation',
          html: `
            <h1>Thank you for your order!</h1>
            <p>Order ID: ${doc.id}</p>
            <ul>
              ${doc.items
                .map(item => `<li>${item.product.name} - ${item.quantity} x ${item.price}</li>`)
                .join('')}
            </ul>
            <p>Total: ${doc.total}</p>
          `,
        });
        console.log('Email sent to:', user.email);
      } else {
        console.error('User not found:', orderedBy);
      }
    } catch (err) {
      console.error('Error finding user or sending email:', err);
    }
  } else {
    console.log('Operation is not create or req.user is not defined');
  }
};

