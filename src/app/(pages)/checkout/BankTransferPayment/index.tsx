import React from 'react'
import PromoCodeInput from '../PromoCodeInput/index'

import classes from './index.module.scss'
const BankTransferPayment: React.FC = () => {
  return (
    <div>
      <h3 className={classes.payment}>Bank Transfer Details</h3>
      <p>Please transfer the total amount to the following bank account:</p>
      <p>Bank: BAWAG</p>
      <p>IBAN: AT39 60000 0104 1019 7559</p>
      <p>Account Number: 123456789</p>
      <p>Sort Code: 00-00-00</p>
      <PromoCodeInput />
    </div>
  )
}
export default BankTransferPayment

// TODO: add terms and conditions checkbox
// TODO: create a function that will send an email after the user confirms the orders
// TODO: add button to redicrect to a successful processing of the order
// TODO: add Promo code field
