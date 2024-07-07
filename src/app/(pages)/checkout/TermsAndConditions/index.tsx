'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import classes from "./index.module.scss"
type Props = {
  termsUrl: string
  onAccept: (accepted: boolean) => void
}

const TermsAndConditions: React.FC<Props> = ({ termsUrl, onAccept }) => {
  const [accepted, setAccepted] = useState(false)

  const handleCheckboxChange = () => {
    const newAcceptedStatus = !accepted
    setAccepted(newAcceptedStatus)
    onAccept(newAcceptedStatus)
  }

  return (
    <div className={classes.termsContainer}>
      <label className={classes.termsLabel}>
        <input type="checkbox" checked={accepted} onChange={handleCheckboxChange} />I agree to the{' '}
        <Link href={termsUrl} target="_blank">
          terms and conditions
        </Link>
      </label>
    </div>
  )
}

export default TermsAndConditions
