import React, { useCallback, useRef, useState, useEffect } from 'react'

import AddressForm from './AddressForm'
import { Button } from '../../../_components/Button'
import { Order } from '../../../../payload/payload-types'
import PromoCodeInput from '../PromoCodeInput'
import TermsAndConditions from '../TermsAndConditions'
import classes from './index.module.scss'
import { priceFromJSON } from '../../../_components/Price'
import { useCart } from '../../../_providers/Cart'
import { useRouter } from 'next/navigation'

const BankTransferPayment: React.FC<{
  userId: string
}> = ({ userId }) => {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddressComplete, setIsAddressComplete] = useState(false)
  const router = useRouter()
  const { applyCoupon, removeCoupon, couponDiscount, cart, cartTotal, couponId } = useCart()
  const addressFormRef = useRef<{ submitAddress: () => Promise<void>; isAddressComplete: boolean }>(
    null,
  )

  const handleTermsAccept = (accepted: boolean) => {
    setTermsAccepted(accepted)
    if (accepted && isAddressComplete) {
      setError(null)
    }
  }

  const handleAddressCompleteChange = (isComplete: boolean) => {
    setIsAddressComplete(isComplete)
  }

  useEffect(() => {
    if (addressFormRef.current) {
      setIsAddressComplete(addressFormRef.current.isAddressComplete)
      if (addressFormRef.current.isAddressComplete && termsAccepted) {
        setError(null)
      }
    }
  }, [addressFormRef.current?.isAddressComplete, termsAccepted])

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault()

      if (!isAddressComplete) {
        setError('Please complete all address fields.')
        return
      }

      if (!termsAccepted) {
        setError('Please accept the terms and conditions.')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        if (addressFormRef.current) {
          await addressFormRef.current.submitAddress()
        }

        try {
          console.log(couponDiscount, couponId)
          const orderReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              total: cartTotal.raw - (couponDiscount ? couponDiscount / 100 : 0),
              items: (cart?.items || [])?.map(({ product, quantity }) => ({
                product: typeof product === 'string' ? product : product.id,
                quantity,
                price:
                  typeof product === 'object'
                    ? priceFromJSON(product.priceJSON, 1, true)
                    : undefined,
              })),
              couponUsed: couponId,
              discountAmount: couponDiscount ? couponDiscount : 0,
            }),
          })
          handleRemoveCoupon()
          if (!orderReq.ok) throw new Error(orderReq.statusText || 'Something went wrong.')

          const {
            error: errorFromRes,
            doc,
          }: {
            message?: string
            error?: string
            doc: Order
          } = await orderReq.json()

          if (errorFromRes) throw new Error(errorFromRes)
          router.push(`/order-confirmation?order_id=${doc.id}`)
        } catch (err) {
          console.error(err.message)
          router.push(`/order-confirmation?error=${encodeURIComponent(err.message)}`)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        setError(`Error while submitting payment: ${msg}`)
        setIsLoading(false)
      }
    },
    [router, cart, cartTotal, isAddressComplete, couponDiscount, termsAccepted, couponId],
  )

  const handleApplyCoupon = (promoCode: string) => {
    applyCoupon(promoCode)
  }
  const handleRemoveCoupon = () => {
    removeCoupon()
  }
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    e.currentTarget.style.setProperty('--x', `${x}px`)
    e.currentTarget.style.setProperty('--y', `${y}px`)
  }

  const handleMouseDown = () => {
    console.log('Button clicked')
  }

  return (
    <div className={classes.container}>
      <div className={classes.bankDetails}>
        <h3 className={classes.payment}>Bank Transfer Details</h3>
        <p>Please transfer the total amount to the following bank account:</p>
        <p>Bank: BAWAG</p>
        <p>IBAN: AT39 60000 0104 1019 7559</p>
        <p>Reference Number: {userId}</p>
        <p>Amount: {cartTotal.formatted}</p>

        <PromoCodeInput
          onApplyPromoCode={handleApplyCoupon}
          onRemovePromoCode={handleRemoveCoupon}
        />
        {couponDiscount > 0 && (
          <p className={classes.discountApplied}>
            Discount applied:{' '}
            {(couponDiscount / 100).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
          </p>
        )}
        <TermsAndConditions termsUrl="/terms-and-conditions" onAccept={handleTermsAccept} />
        <div className={classes.buttonContainer}>
          <Button
            className={classes.buttonCart}
            label="Back"
            appearance="primary"
            href="/cart"
          ></Button>
          <Button
            label={isLoading ? 'Loading...' : 'Confirm Order'}
            type="submit"
            className={classes.buttonSubmit}
            onClick={handleSubmit}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
          ></Button>
        </div>
        {error && <div className={classes.error}>{error}</div>}
      </div>
      <div className={classes.addressFormContainer}>
        <div className={classes.addressForm}>
          <AddressForm
            ref={addressFormRef}
            userId={userId}
            onAddressCompleteChange={handleAddressCompleteChange}
            onSubmit={() => {}}
          />
        </div>
      </div>
    </div>
  )
}

export default BankTransferPayment
