'use client'

import React, { useEffect, useState } from 'react'
import { Product } from '../../../payload/payload-types'
import { AddToCartButton } from '../AddToCartButton'
import { RemoveFromCartButton } from '../RemoveFromCartButton'
import { useAuth } from '../../_providers/Auth' // Assuming you have an auth provider

import classes from './index.module.scss'

export const priceFromJSON = (priceJSON: string, quantity: number = 1, raw?: boolean): string => {
  let price = ''

  if (priceJSON) {
    try {
      const parsed = JSON.parse(priceJSON)?.data[0]
      const priceValue = parsed.unit_amount * quantity
      const currencySymbol =
        parsed.currency === 'usd'
          ? '$'
          : parsed.currency === 'eur'
          ? '€'
          : parsed.currency.toUpperCase()
      const priceType = parsed.type

      if (raw) return priceValue.toString()

      price = `${currencySymbol}${(priceValue / 100).toFixed(2)}`

      if (priceType === 'recurring') {
        price += `/${
          parsed.recurring.interval_count > 1
            ? `${parsed.recurring.interval_count} ${parsed.recurring.interval}`
            : parsed.recurring.interval
        }`
      }
    } catch (e) {
      console.error(`Cannot parse priceJSON`, e)
    }
  }

  return price
}

export const Price: React.FC<{
  product: Product
  quantity?: number
  button?: 'addToCart' | 'removeFromCart' | false
}> = props => {
  const { product, product: { priceJSON } = {}, button = 'addToCart', quantity } = props

  const { status } = useAuth() // Fetch user status
  const [price, setPrice] = useState<{
    actualPrice: string
    withQuantity: string
  }>(() => ({
    actualPrice: priceFromJSON(priceJSON),
    withQuantity: priceFromJSON(priceJSON, quantity),
  }))

  useEffect(() => {
    setPrice({
      actualPrice: priceFromJSON(priceJSON),
      withQuantity: priceFromJSON(priceJSON, quantity),
    })
  }, [priceJSON, quantity])

  return (
    <div className={classes.actions}>
      {status === 'loggedIn' ? (
        <>
          {typeof price?.actualPrice !== 'undefined' && price?.withQuantity !== '' && (
            <div className={classes.price}>
              <p>{price?.withQuantity}</p>
              {quantity > 1 && (
                <small className={classes.priceBreakdown}>
                  {`${price.actualPrice} x ${quantity}`}
                </small>
              )}
            </div>
          )}
          {button === 'addToCart' && <AddToCartButton product={product} appearance="default" />}
          {button === 'removeFromCart' && <RemoveFromCartButton product={product} />}
        </>
      ) : (
        <p className={classes.priceHidden}>Login to view price</p>
      )}
    </div>
  )
}
