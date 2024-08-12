import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { code, userId } = await req.json()

    // First, retrieve the coupon details
    const couponResult = await payload.find({
      collection: 'coupons',
      where: {
        code: { equals: code },
        isActive: { equals: true },
        expirationDate: { greater_than: new Date() },
      },
    })

    if (couponResult.docs.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 400 })
    }

    const validCoupon = couponResult.docs[0]

    // Check if the coupon has exceeded the maximum usage
    if (validCoupon.currentUses >= validCoupon.maxUses) {
      return NextResponse.json({ error: 'Coupon has reached maximum uses' }, { status: 400 })
    }

    // Check if the user has already used this coupon
    const orderResult = await payload.find({
      collection: 'orders',
      where: {
        orderedBy: { equals: userId },
        couponUsed: { equals: validCoupon.id },
      },
    })

    if (orderResult.docs.length > 0) {
      return NextResponse.json({ error: 'Coupon already used by this user' }, { status: 400 })
    }

    // Increment coupon usage
    await payload.update({
      collection: 'coupons',
      id: validCoupon.id,
      data: {
        currentUses: validCoupon.currentUses + 1,
      },
    })

    return NextResponse.json({
      discountPercentage: validCoupon.discountPercentage,
      couponId: validCoupon.id,
    })
  } catch (error: unknown) {
    console.error('Error applying coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
