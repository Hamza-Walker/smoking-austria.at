import React, { useState } from 'react'
import classes from './index.module.scss'

const PromoCodeInput: React.FC<{
  onApplyPromoCode: (promoCode: string) => void
  onRemovePromoCode: () => void
}> = ({ onApplyPromoCode, onRemovePromoCode }) => {
  const [promoCode, setPromoCode] = useState('')
  const [invalidPromo, setInvalidPromo] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value)
    setInvalidPromo(false)
  }

  const handleApplyPromoCode = () => {
    if (promoCode.trim()) {
      onApplyPromoCode(promoCode)
    } else {
      setInvalidPromo(true)
    }
  }

  const handleRemovePromoCode = () => {
    setPromoCode('')
    onRemovePromoCode()
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
      <button className={classes.removeButton} onClick={handleRemovePromoCode}>
        Remove
      </button>
      {invalidPromo && <p className={classes.errorMsg}>Invalid promo code. Please try again.</p>}
    </div>
  )
}

export default PromoCodeInput
