'use client'
import React, { Fragment, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Settings } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import { useAuth } from '../../../_providers/Auth'
import { useCart } from '../../../_providers/Cart'
import BankTransferPayment from '../BankTransferPayment'
// import StripePayment from '../StripePayment'

import classes from './index.module.scss'
import { CheckoutItem } from '../CheckoutItem'

export const CheckoutPage: React.FC<{
  settings: Settings
}> = props => {
  const {
    settings: { productsPage },
  } = props

  const { user } = useAuth()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = React.useState<'stripe' | 'bankTransfer'>(
    'bankTransfer',
  )
  const { cart, cartIsEmpty, cartTotal, discountAmount, autoDiscount } = useCart()

  const handleapplyDiscount = (discount: number) => {
    applyDiscount(discount)
  }
  useEffect(() => {
    if (user !== null && cartIsEmpty) {
      router.push('/cart')
    }
  }, [router, user, cartIsEmpty])

  if (!user) return null

  return (
    <Fragment>
      {cartIsEmpty && (
        <div>
          {'Your '}
          <Link href="/cart">cart</Link>
          {' is empty.'}
          {typeof productsPage === 'object' && productsPage?.slug && (
            <Fragment>
              {' '}
              <Link href={`/${productsPage.slug}`}>Continue shopping?</Link>
            </Fragment>
          )}
        </div>
      )}
      {!cartIsEmpty && (
        <div className={classes.items}>
          <div className={classes.header}>
            <p>Products</p>
            <div className={classes.headerItemDetails}>
              <p></p>
              <p className={classes.quantity}>Quantity</p>
            </div>
            <p className={classes.subtotal}>Subtotal</p>
          </div>

          <ul>
            {cart?.items?.map((item, index) => {
              if (typeof item.product === 'object') {
                const {
                  quantity,
                  product,
                  product: { title, meta },
                } = item

                if (!quantity) return null

                const metaImage = meta?.image

                return (
                  <Fragment key={index}>
                    <CheckoutItem
                      product={product}
                      title={title}
                      metaImage={metaImage}
                      quantity={quantity}
                      index={index}
                    />
                  </Fragment>
                )
              }
              return null
            })}
          </ul>

          <div className={classes.orderTotal}>
            {/* Show bulk discount if applicable */}
            {autoDiscount > 0 && (
              <div className={classes.totalRow}>
                <p className={classes.label}>Discount</p>
                <p className={classes.discount}>
                  -{(autoDiscount / 100).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>
              </div>
            )}

            {/* Show manual coupon discount if applicable */}
            {discountAmount > 0 && (
              <div className={classes.totalRow}>
                <p className={classes.label}>Discount</p>
                <p className={classes.discount}>
                  -{(discountAmount / 100).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>
              </div>
            )}

            {/* Order Total */}
            <div className={classes.totalRow}>
              <p className={classes.label}>Order Total</p>
              <p className={classes.label}>{cartTotal.formatted}</p>
            </div>
          </div>
        </div>
      )}

      {/* <div className={classes.paymentMethod}>
        <h3>Select Payment Method</h3>
        <div className={classes.buttonContainer}>
          <Button
            className={classes.button}
            appearance={paymentMethod === 'bankTransfer' ? 'primary' : 'default'}
            onClick={() => setPaymentMethod('bankTransfer')}
          >
            Bank Transfer
          </Button>
          <Button
            className={classes.button}
            appearance={paymentMethod === 'stripe' ? 'primary' : 'default'}
            onClick={() => setPaymentMethod('stripe')}
          >
            Credit Card
          </Button>
        </div>
      </div>
      {paymentMethod === 'stripe' && <StripePayment />} */}
      {paymentMethod === 'bankTransfer' && <BankTransferPayment userId={user.id} />}
    </Fragment>
  )
}
