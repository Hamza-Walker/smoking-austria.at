import React, { useState } from 'react'
import PromoCodeInput from '../PromoCodeInput'
import TermsAndConditions from '../TermsAndConditions'
import { Button } from '../../../_components/Button'
import classes from './index.module.scss'

const BankTransferPayment: React.FC<{
  userId: string
  cartItems: any[]
  cartTotal: { formatted: string; raw: number }
  onApplyCoupon: (discount: number) => void
}> = ({ userId, cartItems, cartTotal, onApplyCoupon }) => {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [discount, setDiscount] = useState(0)

  const handleTermsAccept = (accepted: boolean) => {
    setTermsAccepted(accepted)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Bank transfer payment submitted')
  }

  const handleApplyCoupon = (discountAmount: number) => {
    setDiscount(discountAmount)
    onApplyCoupon(discountAmount)
  }

  const handleMouseDown = () => {
    console.log('Button clicked')
  }

  return (
    <div className={classes.container}>
      <h3 className={classes.payment}>Bank Transfer Details</h3>
      <p>Please transfer the total amount to the following bank account:</p>
      <p>Bank: BAWAG</p>
      <p>IBAN: AT39 60000 0104 1019 7559</p>
      <p>Reference Number: {userId}</p>
      <p>Amount: {cartTotal.formatted}</p>
      <PromoCodeInput onApplyPromoCode={handleApplyCoupon} />
      <TermsAndConditions
        termsUrl="/terms-and-conditions" // Change this URL to the actual terms page URL
        onAccept={handleTermsAccept}
      />
      <div className={classes.buttonContainer}>
        <Button
          className={classes.buttonCart}
          label="Back"
          appearance="primary"
          href="/cart"
        ></Button>
        <Button
          label="Confirm Order"
          type="submit"
          disabled={!termsAccepted}
          className={classes.buttonSubmit}
          onClick={handleSubmit}
          onMouseDown={handleMouseDown}
        ></Button>
      </div>
    </div>
  )
}

export default BankTransferPayment
