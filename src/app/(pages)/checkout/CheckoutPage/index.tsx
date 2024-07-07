'use client'
import React, { Fragment, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings } from '../../../../payload/payload-types'
import { useAuth } from '../../../_providers/Auth'
import { useCart } from '../../../_providers/Cart'
import { CheckoutItem } from '../CheckoutItem'

import classes from './index.module.scss'
import StripePayment from '../StripePayment'
import BankTransferPayment from '../BankTransferPayment'
import { Button } from '../../../_components/Button'

export const CheckoutPage: React.FC<{
  settings: Settings
}> = props => {
  const {
    settings: { productsPage },
  } = props

  const { user } = useAuth()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = React.useState<'stripe' | 'bankTransfer'>('stripe')
  const { cart, cartIsEmpty, cartTotal, applyCoupon } = useCart()

  const handleApplyCoupon = (discount: number) => {
    applyCoupon(discount)
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
            <div className={classes.orderTotal}>
              <p>Order Total</p>
              <p>{cartTotal.formatted}</p>
            </div>
          </ul>
        </div>
      )}

      <div className={classes.paymentMethod}>
        <h3>Select Payment Method</h3>
        <div className={classes.buttonContainer}>
          <Button
            appearance={paymentMethod === 'stripe' ? 'primary' : 'default'}
            onClick={() => setPaymentMethod('stripe')}
          >
            Credit Card
          </Button>
          <Button
            appearance={paymentMethod === 'bankTransfer' ? 'primary' : 'default'}
            onClick={() => setPaymentMethod('bankTransfer')}
          >
            Bank Transfer
          </Button>
        </div>
      </div>
      {paymentMethod === 'stripe' && <StripePayment />}
      {paymentMethod === 'bankTransfer' && (
        <BankTransferPayment
          userId={user.id}
          cartItems={cart.items}
          cartTotal={cartTotal}
          onApplyCoupon={handleApplyCoupon}
        />
      )}
    </Fragment>
  )
}
