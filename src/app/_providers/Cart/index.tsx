/* eslint-disable prettier/prettier */
/* eslint-disable function-paren-newline */

import { CartItem, cartReducer } from './reducer'
import { Product, User } from '../../../payload/payload-types'
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

export type DiscountResponse = {
  success: boolean
  message?: string
  discountPercentage?: number
  discountId?: string
}

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
  // Our renamed function and data fields for manual "coupon" logic
  applyDiscount: (promoCode: string) => Promise<DiscountResponse>
  removeDiscount: () => void
  discountAmount: number
  discountId: string | null
  autoDiscount: number  
}

const Context = createContext({} as CartContext)

export const useCart = () => useContext(Context)

const arrayHasItems = (array: any[]) => Array.isArray(array) && array.length > 0

const flattenCart = (cart: User['cart']): User['cart'] => ({
  ...cart,
  items: cart.items
    .map((item) => {
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

  // 1) State for MANUAL discount (applied via code)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountId, setDiscountId] = useState<string | null>(null)

  // 2) If you want to show how much is automatically discounted, store separately.
  const [autoDiscount, setAutoDiscount] = useState<number>(0)

  // Combined total
  const [total, setTotal] = useState<{ formatted: string; raw: number }>({
    formatted: '0.00',
    raw: 0,
  })

  const hasInitialized = useRef(false)
  const [hasInitializedCart, setHasInitialized] = useState(false)

  // ----------------------------
  // SYNC cart from Local Storage
  // ----------------------------
  useEffect(() => {
    if (user === undefined) return
    if (!hasInitialized.current) {
      hasInitialized.current = true

      const syncCartFromLocalStorage = async () => {
        const localCart = localStorage.getItem('cart')
        const parsedCart = JSON.parse(localCart || '{}')

        if (parsedCart?.items && parsedCart?.items?.length > 0) {
          const initialCart = await Promise.all(
            parsedCart.items.map(async ({ product, quantity }: { product: string; quantity: number }) => {
              const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${product}`)
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

  // ----------------------------
  // SYNC cart to Payload
  // ----------------------------
  useEffect(() => {
    if (!hasInitialized.current) return

    if (authStatus === 'loggedIn') {
      // Merge server cart with local cart
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
            body: JSON.stringify({ cart: flattenedCart }),
            headers: { 'Content-Type': 'application/json' },
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
      // Not logged in: store cart in localStorage
      localStorage.setItem('cart', JSON.stringify(flattenedCart))
    }

    setHasInitialized(true)
  }, [user, cart])

  // ----------------------------
  // CART HELPER METHODS
  // ----------------------------
  const isProductInCart = useCallback(
    (incomingProduct: Product): boolean => {
      const { items: itemsInCart } = cart || {}
      if (Array.isArray(itemsInCart) && itemsInCart.length > 0) {
        return Boolean(
          itemsInCart.find(({ product }) => {
            if (typeof product === 'object' && product !== null && 'id' in product) {
              return product.id === incomingProduct.id
            }
            return typeof product === 'string' && product === incomingProduct.id
          }),
        )
      }
      return false
    },
    [cart],
  )

  const addItemToCart = useCallback((incomingItem: CartItem) => {
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
    dispatchCart({ type: 'CLEAR_CART' })
  }, [])

  // ----------------------------
  // APPLY / REMOVE MANUAL DISCOUNT
  // ----------------------------
  const applyDiscount = useCallback(
    async (promoCode: string): Promise<DiscountResponse> => {
      if (!user?.id) {
        console.error('User is not defined.')
        return { success: false, message: 'User is not defined.' }
      }

      try {
        const response = await fetch('/next/apply-discount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: promoCode, userId: user.id }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { success: false, message: errorData.error }
        }

        const { discountPercentage, discountId: returnedId } = await response.json()
        // Calculate the manual discount based on current total.raw
        const calcDiscount = Math.round(total.raw * (discountPercentage / 100))

        setDiscountAmount(calcDiscount)
        setDiscountId(returnedId)

        return { success: true }
      } catch (error: any) {
        console.error('Error applying discount:', error.message)
        return { success: false, message: error.message }
      }
    },
    [total.raw, user?.id],
  )

  const removeDiscount = useCallback(() => {
    setDiscountAmount(0)
    setDiscountId(null)
  }, [])

  // ----------------------------
  // MAIN EFFECT: Calculate & Update `total`
  // ----------------------------
  useEffect(() => {
    if (!hasInitialized.current) return

    // 1) Calculate base subtotal
    const baseSubtotal =
      cart?.items?.reduce((acc, item) => {
        if (typeof item.price === 'number') {
          // Use the direct price field
          const qty = typeof item.quantity === 'number' ? item.quantity : 0
          return acc + item.price * qty
        } else if (typeof item.product === 'object' && item.product !== null) {
          // fallback: parse priceJSON
          const priceData = JSON.parse(item.product?.priceJSON || '{}')
          const unitPrice = priceData?.data?.[0]?.unit_amount || 0
          const qty = typeof item.quantity === 'number' ? item.quantity : 0
          return acc + unitPrice * qty
        }
        return acc
      }, 0) || 0

    // Helper to compute the total cost of items in a category
    const getCategorySubtotal = (categoryId: number) => {
      return (
        cart?.items?.reduce((acc, item) => {
          if (
            typeof item.product === 'object' &&
            item.product !== null &&
            item.product.categories?.some((c) =>
              typeof c === 'number' ? c === categoryId : c.id === categoryId,
            )
          ) {
            const priceData = JSON.parse(item.product?.priceJSON || '{}')
            const unitPrice = priceData?.data?.[0]?.unit_amount || 0
            const qty = typeof item.quantity === 'number' ? item.quantity : 0
            return acc + unitPrice * qty
          }
          return acc
        }, 0) || 0
      )
    }

    // Helper to compute total quantity in a category
    const getCategoryQuantity = (categoryId: number) => {
      return (
        cart?.items?.reduce((acc, item) => {
          if (
            typeof item.product === 'object' &&
            item.product !== null &&
            item.product.categories?.some((c) =>
              typeof c === 'number' ? c === categoryId : c.id === categoryId,
            )
          ) {
            const qty = typeof item.quantity === 'number' ? item.quantity : 0
            return acc + qty
          }
          return acc
        }, 0) || 0
      )
    }

    // We'll define an async wrapper to fetch auto + bulk discounts
    const fetchActiveDiscounts = async () => {
      try {
        const res = await fetch('/next/get-active-discounts')
        if (!res.ok) {
          console.error('Failed to fetch active discounts')
          return 0
        }

        const discounts = await res.json()
        if (!Array.isArray(discounts)) {
          console.error('Invalid discount data')
          return 0
        }

        let autoDiscountSum = 0
        discounts.forEach((d: any) => {
          if (d.discountMode === 'automatic') {
            const discountValue = Math.round(baseSubtotal * (d.discountPercentage / 100))
            autoDiscountSum += discountValue
          } else if (d.discountMode === 'bulk') {
            let quantityInCategory = 0
            let subtotalForCategory = 0

            if (d.appliesTo === 'all') {
              const totalQty = cart?.items?.reduce((acc, i) => acc + (i.quantity || 0), 0) || 0
              quantityInCategory = totalQty
              subtotalForCategory = baseSubtotal
            } else if (d.appliesTo === 'category' && d.category?.id) {
              quantityInCategory = getCategoryQuantity(d.category.id)
              subtotalForCategory = getCategorySubtotal(d.category.id)
            }

            if (quantityInCategory >= (d.bulkQuantity || 0)) {
              const bulkDiscountValue = Math.round(
                subtotalForCategory * (d.discountPercentage / 100),
              )
              autoDiscountSum += bulkDiscountValue
            }
          }
        })

        return autoDiscountSum
      } catch (e) {
        console.error('Error fetching active discounts:', e)
        return 0
      }
    }

    ;(async () => {
      const sumOfAutoDiscounts = await fetchActiveDiscounts()
      setAutoDiscount(sumOfAutoDiscounts)

      const newTotal = baseSubtotal - sumOfAutoDiscounts - discountAmount
      setTotal({
        formatted: (newTotal / 100).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
        raw: newTotal,
      })
    })()
  }, [cart, discountAmount])

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
        applyDiscount,
        removeDiscount,
        discountAmount,
        discountId,
        autoDiscount,
      }}
    >
      {children}
    </Context.Provider>
  )
}
