import React from 'react'

import classes from './index.module.scss'

const PromoCodeInput: React.FC = () => {
  return (
    <div className={classes.promoCodeInput}>
      <h3>Redeem promotional coupon</h3>
      <p>Enter your promotional code below:</p>
      <input className={classes.input} type="text" placeholder="Promotional Code" />
    </div>
  )
}

export default PromoCodeInput
