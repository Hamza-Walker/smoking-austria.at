import { CartItem, cartReducer } from './reducer'
import { CouponResponse, Product, User } from '../../../payload/payload-types'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'

import { useAuth } from '../Auth'

export type CartContext = {
  cart: User['cart']
  addItemToCart: (item: CartItem) => void
  deleteItemFromCart: (product: Product) => void
  cartIsEmpty: boolean | undefined
  clearCart: () => void
  isProductInCart: (product: Product) => boolean
  cartTotal: {
    formatted: string
    raw: number
  }
  hasInitializedCart: boolean
  applyCoupon: (promoCode: string) => void
  removeCoupon: () => void
  couponDiscount: number
  couponId: string | null // Add couponId to the context type
}

const Context = createContext({} as CartContext)

export const useCart = () => useContext(Context)

const arrayHasItems = (array: any[]) => Array.isArray(array) && array.length > 0

const flattenCart = (cart: User['cart']): User['cart'] => ({
  ...cart,
  items: cart.items
    .map(item => {
      if (!item?.product || typeof item?.product !== 'object') {
        return null
      }

      return {
        ...item,
        product: item?.product?.id,
        quantity: typeof item?.quantity === 'number' ? item?.quantity : 0,
      }
    })
    .filter(Boolean) as CartItem[],
})

export const CartProvider = (props: any) => {
  const { children } = props
  const { user, status: authStatus } = useAuth()

  const [cart, dispatchCart] = useReducer(cartReducer, {})
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponId, setCouponId] = useState<string | null>(null) // Define couponId state

  const [total, setTotal] = useState<{
    formatted: string
    raw: number
  }>({
    formatted: '0.00',
    raw: 0,
  })

  const hasInitialized = useRef(false)
  const [hasInitializedCart, setHasInitialized] = useState(false)

  // Sync cart from local storage or payload
  useEffect(() => {
    if (user === undefined) return
    if (!hasInitialized.current) {
      hasInitialized.current = true

      const syncCartFromLocalStorage = async () => {
        const localCart = localStorage.getItem('cart')

        const parsedCart = JSON.parse(localCart || '{}')

        if (parsedCart?.items && parsedCart?.items?.length > 0) {
          const initialCart = await Promise.all(
            parsedCart.items.map(async ({ product, quantity }) => {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${product}`,
              )
              const data = await res.json()
              return {
                product: data,
                quantity,
              }
            }),
          )

          dispatchCart({
            type: 'SET_CART',
            payload: {
              items: initialCart,
            },
          })
        } else {
          dispatchCart({
            type: 'SET_CART',
            payload: {
              items: [],
            },
          })
        }
      }

      syncCartFromLocalStorage()
    }
  }, [user])

  // Sync cart to payload
  useEffect(() => {
    if (!hasInitialized.current) return

    if (authStatus === 'loggedIn') {
      dispatchCart({
        type: 'MERGE_CART',
        payload: user?.cart,
      })
    }

    if (authStatus === 'loggedOut') {
      dispatchCart({
        type: 'CLEAR_CART',
      })
    }
  }, [user, authStatus])

  useEffect(() => {
    if (!hasInitialized.current || user === undefined || !cart.items) return

    const flattenedCart = flattenCart(cart)

    if (user) {
      if (JSON.stringify(flattenCart(user.cart)) === JSON.stringify(flattenedCart)) {
        setHasInitialized(true)
        return
      }

      try {
        const syncCartToPayload = async () => {
          const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
            credentials: 'include',
            method: 'PATCH',
            body: JSON.stringify({
              cart: flattenedCart,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (req.ok) {
            localStorage.setItem('cart', '[]')
          }
        }

        syncCartToPayload()
      } catch (e) {
        console.error('Error while syncing cart to Payload.')
      }
    } else {
      localStorage.setItem('cart', JSON.stringify(flattenedCart))
    }

    setHasInitialized(true)
  }, [user, cart])

  const isProductInCart = useCallback(
    (incomingProduct: Product): boolean => {
      let isInCart = false
      const { items: itemsInCart } = cart || {}

      if (Array.isArray(itemsInCart) && itemsInCart.length > 0) {
        isInCart = Boolean(
          itemsInCart.find(({ product }) => {
            // Check if product is a Product and has an 'id' property
            if (typeof product === 'object' && product !== null && 'id' in product) {
              return product.id === incomingProduct.id
            }
            // If product is a string, compare directly with incomingProduct.id
            return typeof product === 'string' && product === incomingProduct.id
          }),
        )
      }

      return isInCart
    },
    [cart],
  )

  const addItemToCart = useCallback(incomingItem => {
    dispatchCart({
      type: 'ADD_ITEM',
      payload: incomingItem,
    })
  }, [])

  const deleteItemFromCart = useCallback((incomingProduct: Product) => {
    dispatchCart({
      type: 'DELETE_ITEM',
      payload: incomingProduct,
    })
  }, [])

  const clearCart = useCallback(() => {
    dispatchCart({
      type: 'CLEAR_CART',
    })
  }, [])

  const applyCoupon = useCallback(
    async (promoCode: string): Promise<CouponResponse> => {
      if (!user?.id) {
        console.error('User is not defined.')
        return { success: false, message: 'User is not defined.' }
      }

      try {
        const response = await fetch('/next/apply-coupon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: promoCode, userId: user.id }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { success: false, message: errorData.error }
        }

        const { discountPercentage, couponId } = await response.json()
        const discountAmount = Math.round(total.raw * (discountPercentage / 100))
        setCouponDiscount(discountAmount)
        setCouponId(couponId) // Set the couponId state

        return { success: true }
      } catch (error) {
        console.error('Error applying coupon:', error.message)
        return { success: false, message: error.message }
      }
    },
    [total.raw, user?.id], // Dependencies
  )

  const removeCoupon = useCallback(() => {
    setCouponDiscount(0)
    setCouponId(null) // Clear the couponId
  }, [])

  useEffect(() => {
    if (!hasInitialized.current) return

    const newTotal =
      (cart?.items?.reduce((acc, item) => {
        return (
          acc +
          (typeof item.product === 'object'
            ? JSON.parse(item?.product?.priceJSON || '{}').data?.[0].unit_amount *
              (typeof item.quantity === 'number' ? item.quantity : 0)
            : 0)
        )
      }, 0) || 0) - couponDiscount

    setTotal({
      formatted: (newTotal / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      }),
      raw: newTotal,
    })
  }, [cart, couponDiscount])

  return (
    <Context.Provider
      value={{
        cart,
        addItemToCart,
        deleteItemFromCart,
        cartIsEmpty: hasInitializedCart && !arrayHasItems(cart?.items),
        clearCart,
        isProductInCart,
        cartTotal: total,
        hasInitializedCart,
        applyCoupon,
        removeCoupon,
        couponDiscount,
        couponId, // Make couponId available through the context
      }}
    >
      {children}
    </Context.Provider>
  )
}
