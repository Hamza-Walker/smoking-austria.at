// app/api/get-active-discounts/route.ts

import { NextResponse } from 'next/server'
import payload from 'payload'

// Define return type for the handler
export async function GET(): Promise<NextResponse> {
  try {
    //    const now = new Date()

    // Fetch active discounts
    const discounts = await payload.find({
      collection: 'discounts',
      where: {
        and: [
          {
            isActive: {
              equals: true,
            },
          },
          // Add any other conditions you need
        ],
      },
    })

    return NextResponse.json(discounts.docs)
  } catch (error: unknown) {
    // Explicitly type the error
    console.error('Error fetching active discounts:', error)
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 })
  }
}
