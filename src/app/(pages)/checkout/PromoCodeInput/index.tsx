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
    <div className={classes.promoCodeInput}>
      <h3>Redeem promotional coupon</h3>
      <p>Enter your promotional code below:</p>
      <input
        className={`${classes.input} ${invalidPromo ? classes.invalid : ''}`}
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
