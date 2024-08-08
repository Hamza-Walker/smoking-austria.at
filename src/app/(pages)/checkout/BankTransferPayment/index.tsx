import React, { useCallback, useState } from 'react'
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

  const handleTermsAccept = (accepted: boolean) => {
    setTermsAccepted(accepted)
  }

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault()
      setIsLoading(true)

      try {
        // Simulate payment intent confirmation
        const paymentIntent = { id: 'mock_payment_intent_id' }

        // Before redirecting to the order confirmation page, we need to create the order in Payload
        // Cannot clear the cart yet because if you clear the cart while in the checkout
        // you will be redirected to the `/cart` page before this redirect happens
        // Instead, we clear the cart in an `afterChange` hook on the `orders` collection in Payload
        try {
          const orderReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              total: cartTotal.raw,
              stripePaymentIntentID: paymentIntent.id,
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
          // don't throw an error if the order was not created successfully
          // this is because payment _did_ in fact go through, and we don't want the user to pay twice
          console.error(err.message) // eslint-disable-line no-console
          router.push(`/order-confirmation?error=${encodeURIComponent(err.message)}`)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        setError(`Error while submitting payment: ${msg}`)
        setIsLoading(false)
      }
    },
    [router, cart, cartTotal],
  )

  const handleApplyCoupon = (discountAmount: number) => {
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
  const onSubmit = () => {
    console.log('Form submitted')
  }
  return (
    <div className={classes.container}>
      <div className={classes.addressForm}>
        <AddressForm onSubmit={onSubmit} />
      </div>
      <h3 className={classes.payment}>Bank Transfer Details</h3>
      <p>Please transfer the total amount to the following bank account:</p>
      <p>Bank: BAWAG</p>
      <p>IBAN: AT39 60000 0104 1019 7559</p>
      <p>Reference Number: {userId}</p>
      <p>Amount: {cartTotal.formatted}</p>
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
  )
}

export default BankTransferPayment
