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
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddressComplete, setIsAddressComplete] = useState(false)
  const router = useRouter()

  // ----------------------------
  // 1) Destructure your new autoDiscount (if you have it in your CartContext)
  //    plus existing manual discount data
  // ----------------------------
  const {
    applyDiscount,
    removeDiscount,
    discountAmount, // manual discount in cents
    autoDiscount, // automatic discount in cents (if you exposed it)
    cart,
    cartTotal,
    discountId,
  } = useCart()

  const addressFormRef = useRef<{
    submitAddress: () => Promise<void>
    isAddressComplete: boolean
  }>(null)

  const handleTermsAccept = (accepted: boolean) => {
    setTermsAccepted(accepted)
    if (accepted && isAddressComplete) {
      setError(null)
    }
  }

  const handleAddressCompleteChange = (isComplete: boolean) => {
    setIsAddressComplete(isComplete)
  }

  // Wrappers for discount
  const handleremoveDiscount = useCallback(() => {
    removeDiscount()
  }, [removeDiscount])

  const handleapplyDiscount = async (promoCode: string) => {
    const result = await applyDiscount(promoCode)

    if (!result.success) {
      setError(result.message || 'Invalid promo code or no more coupons available.')
    }
  }

  useEffect(() => {
    if (addressFormRef.current) {
      setIsAddressComplete(addressFormRef.current.isAddressComplete)
      if (addressFormRef.current.isAddressComplete && termsAccepted) {
        setError(null)
      }
    }
  }, [addressFormRef.current?.isAddressComplete, termsAccepted])

  // ----------------------------
  // 2) Final submit
  //    We pass the final cartTotal.raw as "total" to the API
  //    And optionally store discountAmount / autoDiscount
  // ----------------------------
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
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
          console.log('Manual discount:', discountAmount, 'Discount ID:', discountId)
          console.log('Auto discount:', autoDiscount)

          // POST to create the order
          const orderReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              total: cartTotal.raw, // final price after all discounts
              items: (cart?.items || [])?.map(({ product, quantity }) => ({
                product: typeof product === 'string' ? product : product.id,
                quantity,
                price:
                  typeof product === 'object'
                    ? priceFromJSON(product.priceJSON, 1, true)
                    : undefined,
              })),

              // If your "orders" collection tracks manual discount usage
              discountUsed: discountId || undefined,

              // Distinguish or combine discounts however you like
              discountAmount: discountAmount, // manual discount (cents)
              autoDiscount: autoDiscount, // automatic discount (cents)
            }),
          })

          // Remove the manual discount after order creation
          handleremoveDiscount()

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

          // On success, navigate to confirmation page
          router.push(`/order-confirmation?order_id=${doc.id}`)
        } catch (err: any) {
          console.error(err.message)
          router.push(`/order-confirmation?error=${encodeURIComponent(err.message)}`)
        }
      } catch (err: any) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        setError(`Error while submitting payment: ${msg}`)
        setIsLoading(false)
      }
    },
    [
      router,
      cart,
      cartTotal,
      isAddressComplete,
      discountAmount,
      autoDiscount,
      termsAccepted,
      discountId,
    ],
  )

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
    <div className={classes.parentContainer}>
      <div className={classes.bankDetails}>
        {/* Hide Bank Transfer Details */}

        {/* <h3 className={classes.payment}>Bank Transfer Details</h3>
        <p>Please transfer the total amount to the following bank account:</p>
        <p>Bank: BAWAG</p>
        <p>IBAN: AT39 60000 0104 1019 7559</p>
        <p>Reference Number: {userId}</p>
        <p>Amount: {cartTotal.formatted}</p>
        */}

        {/*
          3) PromoCodeInput usage remains the same, but we now
             also handle auto discount in the cart context
        */}

        {/* Hide Promo code input. Todo, update discounts shcema to include a boolian field. in the admin pannal to control visibility of the input component */}
        {/*
        <PromoCodeInput
          onApplyPromoCode={handleapplyDiscount}
          onRemovePromoCode={handleremoveDiscount}
        />
        */}

        {/*
          4) Show manual discount if present
        */}
        {/*
        {discountAmount > 0 && (
          <p className={classes.discountApplied}>
            Manual discount applied:{' '}
            {(discountAmount / 100).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
          </p>
        )}
        */}
        {/*
          5) (Optional) Show automatic discount if present
              If you'd prefer to show a combined discount line, skip this
        */}
        {/*
        {autoDiscount > 0 && (
          <p className={classes.discountApplied}>
            Automatic discount:{' '}
            {(autoDiscount / 100).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
          </p>
        )}
        */}
        <p className={classes.checkoutMessage}>
          Upon confirming the order, you will receive an email with your order details. Our staff
          will contact you afterward with a receipt, which will also include the shipping costs and
          bank information. Once the payment is received, the items will be shipped immediately.
        </p>
        <TermsAndConditions termsUrl="/terms-and-conditions" onAccept={handleTermsAccept} />

        <div className={classes.buttonContainer}>
          <Button className={classes.buttonCart} label="Back" appearance="primary" href="/cart" />
          <Button
            label={isLoading ? 'Loading...' : 'Confirm Order'}
            type="submit"
            className={classes.buttonSubmit}
            onClick={handleSubmit}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
          />
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
