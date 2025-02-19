// /app/next/apply-discount/route.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import payload from 'payload'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { code, userId } = await req.json()

    // Retrieve discount that matches the code, is manual, is active, not expired
    // (Here we keep the logic you already have, but query the "discounts" collection)
    const discountResult = await payload.find({
      collection: 'discounts',
      where: {
        discountMode: { equals: 'manual' },
        code: { equals: code },
        isActive: { equals: true },
        expirationDate: { greater_than: new Date() },
      },
    })

    // If no valid discount found
    if (discountResult.docs.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 400 })
    }

    const validDiscount = discountResult.docs[0]

    // Check usage limits
    if (validDiscount.currentUses >= validDiscount.maxUses) {
      return NextResponse.json({ error: 'This discount has reached maximum uses' }, { status: 400 })
    }

    // Check if user has already used this discount
    // (This logic requires your Orders or something that tracks discountUsed/discountUsed)
    const orderResult = await payload.find({
      collection: 'orders',
      where: {
        orderedBy: { equals: userId },
        discountUsed: { equals: validDiscount.id }, // or discountUsed
      },
    })

    if (orderResult.docs.length > 0) {
      return NextResponse.json({ error: 'Discount already used by this user' }, { status: 400 })
    }

    // Increment usage
    await payload.update({
      collection: 'discounts', // note the new collection name
      id: validDiscount.id,
      data: {
        currentUses: validDiscount.currentUses + 1,
      },
    })

    // Return the discount % (to be applied on the client side)
    return NextResponse.json({
      discountPercentage: validDiscount.discountPercentage,
      discountId: validDiscount.id,
    })
  } catch (error: unknown) {
    console.error('Error applying coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
