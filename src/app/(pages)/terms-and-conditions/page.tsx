import React from 'react'

import classes from './index.module.scss'

export default async function TermsAndConditions() {
  return (
    <div className={classes.termsContainer}>
      <h1 className={classes.headingPrimary}>Terms and Conditions</h1>
      <p>Last updated: July 7, 2024</p>

      <section>
        <h2 className={classes.headingSecondary}>1. Introduction</h2>
        <p>
          Welcome to our e-commerce site. These Terms and Conditions ("Terms", "Terms and
          Conditions") govern your relationship with our website (the "Service") operated by our
          company ("us", "we", or "our"). Please read these Terms and Conditions carefully before
          using our Service.
        </p>
      </section>

      <section>
        <h2 className={classes.headingSecondary}>2. Accounts</h2>
        <p>
          When you create an account with us, you must provide us with information that is accurate,
          complete, and current at all times. Failure to do so constitutes a breach of the Terms,
          which may result in immediate termination of your account on our Service.
        </p>
      </section>

      <section>
        <h2 className={classes.headingSecondary}>3. Purchases</h2>
        <p>
          If you wish to purchase any product or service made available through the Service
          ("Purchase"), you may be asked to supply certain information relevant to your Purchase
          including, without limitation, your credit card number, the expiration date of your credit
          card, your billing address, and your shipping information.
        </p>
      </section>

      <section>
        <h2 className={classes.headingSecondary}>4. Shipping</h2>
        <p>
          We will make every effort to ensure that your products are delivered within a reasonable
          time frame. However, we are not responsible for delays caused by shipping carriers or any
          other unforeseen circumstances.
        </p>
      </section>

      <section>
        <h2 className={classes.headingSecondary}>5. Returns and Refunds</h2>
        <p>
          Our Return and Refund Policy governs all returns and refunds. If you are not entirely
          satisfied with your purchase, we're here to help.
        </p>
      </section>

      <section>
        <h2 className={classes.headingSecondary}>6. Intellectual Property</h2>
        <p>
          The Service and its original content (excluding Content provided by users), features, and
          functionality are and will remain the exclusive property of our company and its licensors.
        </p>
      </section>

      <section>
        <h2 className={classes.headingSecondary}>7. Termination</h2>
        <p>
          We may terminate or suspend your account and bar access to the Service immediately,
          without prior notice or liability, under our sole discretion, for any reason whatsoever
          and without limitation, including but not limited to a breach of the Terms.
        </p>
      </section>

      <section>
        <h2 className={classes.headingSecondary}>8. Limitation of Liability</h2>
        <p>
          In no event shall our company, nor its directors, employees, partners, agents, suppliers,
          or affiliates, be liable for any indirect, incidental, special, consequential, or punitive
          damages, including without limitation, loss of profits, data, use, goodwill, or other
          intangible losses, resulting from (i) your access to or use of or inability to access or
          use the Service; (ii) any conduct or content of any third party on the Service; (iii) any
          content obtained from the Service; and (iv) unauthorized access, use, or alteration of
          your transmissions or content, whether based on warranty, contract, tort (including
          negligence), or any other legal theory, whether or not we have been informed of the
          possibility of such damage.
        </p>
      </section>

      <section>
        <h2 className={classes.headingSecondary}>9. Changes</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any
          time. If a revision is material, we will try to provide at least 30 days' notice prior to
          any new terms taking effect. What constitutes a material change will be determined at our
          sole discretion.
        </p>
      </section>

      <section>
        <h2 className={classes.headingSecondary}>10. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us.</p>
      </section>
    </div>
  )
}
