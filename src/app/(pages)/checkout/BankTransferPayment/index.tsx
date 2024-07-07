import React, { useState, useCallback } from 'react'
import PromoCodeInput from '../PromoCodeInput'
import TermsAndConditions from '../TermsAndConditions'
import { Button } from '../../../_components/Button'
import classes from './index.module.scss'

const BankTransferPayment: React.FC = () => {
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleTermsAccept = (accepted: boolean) => {
    setTermsAccepted(accepted)
  }

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    console.log('Bank transfer payment submitted')
    // TODO: add logic to send an email
    // TODO: add logic to redirect to a successful processing of the order
    // TODO: add logic to clear the cart
    // TODO: add logic to redirect to the order confirmation page
  }, [])

  console.log('BankTransferPayment component is rendered')

  return (
    <div className={classes.container}>
      <h3 className={classes.payment}>Bank Transfer Details</h3>
      <p>Please transfer the total amount to the following bank account:</p>
      <p>Bank: BAWAG</p>
      <p>IBAN: AT39 60000 0104 1019 7559</p>
      <p>Reference Number: {'add reference number'}</p>
      <p>Amount: {'add amount'}</p>
      <PromoCodeInput />
      <TermsAndConditions
        termsUrl="/terms-and-conditions" // to alter the contents go to (Pages)/terms-and-conditions/index.tsx
        onAccept={handleTermsAccept}
      />
      <div className={classes.buttonContainer}>
        <Button
          label="Confirm Order"
          type="submit"
          appearance="secondary"
          disabled={!termsAccepted}
          onClick={handleSubmit}
        ></Button>
        <Button label="Back to cart" href="/cart" appearance="secondary" />
      </div>
    </div>
  )
}

export default BankTransferPayment
