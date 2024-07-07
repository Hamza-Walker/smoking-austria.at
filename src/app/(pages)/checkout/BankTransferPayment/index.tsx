import PromoCodeInput from '../PromoCodeInput/index'
import React, { useState } from 'react'

import classes from './index.module.scss'
import TermsAndConditions from '../TermsAndConditions'

const BankTransferPayment: React.FC = () => {
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleTermsAccept = (accepted: boolean) => {
    setTermsAccepted(accepted)
  }

  return (
    <div className={classes.container}>
      <h3 className={classes.payment}>Bank Transfer Details</h3>
      <p>Please transfer the total amount to the following bank account:</p>
      <p>Bank: BAWAG</p>
      <p>IBAN: AT39 60000 0104 1019 7559</p>
      <p>Refference Number: {'add reference number'}</p>
      <p>Amount: {'add amount'}</p>
      <PromoCodeInput />
      <TermsAndConditions
        termsUrl="/terms-and-conditions" // Change this URL to the actual terms page URL
        onAccept={handleTermsAccept}
      />
    </div>
  )
}
export default BankTransferPayment

// TODO: add terms and conditions checkbox
// TODO: create a function that will send an email after the user confirms the orders
// TODO: add button to redicrect to a successful processing of the order
// TODO: add Promo code field
