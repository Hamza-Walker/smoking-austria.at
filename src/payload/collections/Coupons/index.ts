import { CollectionConfig } from 'payload/types'

const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'discountPercentage',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
    },
    {
      name: 'expirationDate',
      type: 'date',
      required: true,
    },
    {
      name: 'maxUses',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'currentUses',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

export default Coupons
