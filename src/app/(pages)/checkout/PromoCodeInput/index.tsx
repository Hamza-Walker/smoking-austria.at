import React, { useState } from 'react'

import classes from './index.module.scss'

const PromoCodeInput: React.FC<{
  onApplyPromoCode: (promoCode: string) => void // Update prop type
}> = ({ onApplyPromoCode }) => {
  const [promoCode, setPromoCode] = useState('')
  const [invalidPromo, setInvalidPromo] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value)
    setInvalidPromo(false) // Reset invalid promo state on input change
  }

  const handleApplyPromoCode = () => {
    if (promoCode === 'DISCOUNT20') {
      onApplyPromoCode(promoCode)
      setPromoCode('') // Clear input after applying promo code
    } else {
      setInvalidPromo(true) // Set state to show invalid promo message
    }
  }

  return (
    <div className={classes.promoCodeInputContainer}>
      <h3>Redeem promotional coupon</h3>
      <label>Enter your promotional code below:</label>
      <input
        className={classes.promoCodeInput}
        type="text"
        placeholder="Promotional Code"
        value={promoCode}
        onChange={handleInputChange}
      />
      <button className={classes.applyButton} onClick={handleApplyPromoCode}>
        Apply
      </button>
      {invalidPromo && <p className={classes.errorMsg}>Invalid promo code. Please try again.</p>}
    </div>
  )
}

export default PromoCodeInput
