'use client'

import React, { Fragment, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { Button } from '../../../_components/Button'
import { LoadingShimmer } from '../../../_components/LoadingShimmer'
import { useTheme } from '../../../_providers/Theme'
import cssVariables from '../../../cssVariables'
import { CheckoutForm } from '../CheckoutForm'

import classes from './index.module.scss'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)

const StripePayment: React.FC = props => {
  const { theme } = useTheme()
  const [error, setError] = React.useState<string | null>(null)
  const [clientSecret, setClientSecret] = React.useState()

  useEffect(() => {
    if (!clientSecret) {
      const makeIntent = async () => {
        try {
          const paymentReq = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-payment-intent`,
            {
              method: 'POST',
              credentials: 'include',
            },
          )

          const res = await paymentReq.json()

          if (res.error) {
            setError(res.error)
          } else if (res.client_secret) {
            setError(null)
            setClientSecret(res.client_secret)
          }
        } catch (e) {
          setError('Something went wrong.')
        }
      }

      makeIntent()
    }
  }, [clientSecret])

  if (!clientSecret && !error) {
    return (
      <div className={classes.loading}>
        <LoadingShimmer number={2} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={classes.error}>
        <p>{`Error: ${error}`}</p>
        <Button label="Back to cart" href="/cart" appearance="secondary" />
      </div>
    )
  }

  return (
    <div className={classes.stripePayment}>
      <Fragment>
        <h3 className={classes.payment}>Payment Details</h3>
        <Elements
          stripe={stripe}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorText:
                  theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                fontSizeBase: '16px',
                fontWeightNormal: '500',
                fontWeightBold: '600',
                colorBackground:
                  theme === 'dark' ? cssVariables.colors.base850 : cssVariables.colors.base0,
                fontFamily: 'Inter, sans-serif',
                colorTextPlaceholder: cssVariables.colors.base500,
                colorIcon:
                  theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                borderRadius: '0px',
                colorDanger: cssVariables.colors.error500,
                colorDangerText: cssVariables.colors.error500,
              },
            },
          }}
        >
          <CheckoutForm />
        </Elements>
      </Fragment>
    </div>
  )
}
export default StripePayment
