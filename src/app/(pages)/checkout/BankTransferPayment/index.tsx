import React from 'react'

import classes from './index.module.scss'
const BankTransferPayment: React.FC = () => {
  return (
    <div>
      <h3 className={classes.payment}>Bank Transfer Details</h3>
      <p>Please transfer the total amount to the following bank account:</p>
      <p>Bank: XYZ Bank</p>
      <p>Account Number: 123456789</p>
      <p>Sort Code: 00-00-00</p>
    </div>
  )
}
export default BankTransferPayment
