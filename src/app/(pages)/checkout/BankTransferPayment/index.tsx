import React, { useCallback, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { Order } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import PromoCodeInput from '../PromoCodeInput'
import TermsAndConditions from '../TermsAndConditions'
import { priceFromJSON } from '../../../_components/Price'
import { useCart } from '../../../_providers/Cart'

import classes from './index.module.scss'
import AddressForm from './AddressForm'

const BankTransferPayment: React.FC<{
  userId: string
  cartItems: any[]
  cartTotal: { formatted: string; raw: number }
  onApplyCoupon: (discount: number) => void
}> = ({ userId, cartItems, cartTotal, onApplyCoupon }) => {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { cart } = useCart()
  const addressFormRef = useRef<{ submitAddress: () => Promise<void> }>(null)

  const handleTermsAccept = (accepted: boolean) => {
    setTermsAccepted(accepted)
  }

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault()
      setIsLoading(true)

      try {
        if (addressFormRef.current) {
          await addressFormRef.current.submitAddress()
        }

        try {
          const orderReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              total: cartTotal.raw - discount,
              items: (cart?.items || [])?.map(({ product, quantity }) => ({
                product: typeof product === 'string' ? product : product.id,
                quantity,
                price:
                  typeof product === 'object'
                    ? priceFromJSON(product.priceJSON, 1, true)
                    : undefined,
              })),
            }),
          })

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
    [router, cart, cartTotal, discount],
  )

  const handleApplyCoupon = (promoCode: string) => {
    let discountAmount = 0

    if (promoCode === 'DISCOUNT20') {
      discountAmount = cartTotal.raw * 0.2 // Assuming a 20% discount
    } else {
      setError('Invalid promo code.')
    }

    discountAmount = isNaN(discountAmount) || discountAmount < 0 ? 0 : discountAmount

    setDiscount(discountAmount)
    onApplyCoupon(discountAmount)
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
        <p>
          Amount:{' '}
          {new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format((cartTotal.raw - discount) / 100)}
        </p>

        <PromoCodeInput onApplyPromoCode={handleApplyCoupon} />
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
            disabled={!termsAccepted || isLoading}
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
          <AddressForm ref={addressFormRef} userId={userId} onSubmit={() => {}} />
        </div>
      </div>
    </div>
  )
}

export default BankTransferPayment
