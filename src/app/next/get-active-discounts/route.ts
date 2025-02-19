import { NextApiRequest, NextApiResponse } from 'next'
import { getPayloadClient } from '../../../utils/payload'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const payload = await getPayloadClient()

    // Fetch active discounts from PayloadCMS
    const { docs: discounts } = await payload.find({
      collection: 'discounts',
      where: {
        active: {
          equals: true,
        },
        startDate: {
          less_than_equal: new Date().toISOString(),
        },
        $or: [
          { endDate: { greater_than_equal: new Date().toISOString() } },
          { endDate: { exists: false } },
        ],
      },
    })

    return res.status(200).json(discounts)
  } catch (error) {
    console.error('Error fetching active discounts:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

