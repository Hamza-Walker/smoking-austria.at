import { CollectionConfig } from 'payload/types'
import { adminsOrOrderedBy } from '../Orders/access/adminsOrOrderedBy'
import { admins } from '../../access/admins'
import { adminsOrLoggedIn } from '../../access/adminsOrLoggedIn'

const Discounts: CollectionConfig = {
  slug: 'discounts',
  admin: {
    useAsTitle: 'name', // You can display "name" in the admin UI
  },
  access: {
    read: adminsOrOrderedBy,
    update: admins,
    create: adminsOrLoggedIn,
    delete: admins,
  },
  fields: [
    {
      name: 'name', // Always visible, a human-friendly label
      label: 'Discount Name',
      type: 'text',
      required: true,
    },
    {
      name: 'discountMode',
      label: 'Discount Mode',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Manual (Coupon Code)', value: 'manual' },
        { label: 'Automatic', value: 'automatic' },
        { label: 'Bulk Purchase', value: 'bulk' }, // new mode
      ],
    },
    {
      name: 'code',
      label: 'Coupon Code',
      type: 'text',
      required: false, // only required if discountMode === 'manual'
      admin: {
        condition: data => data.discountMode === 'manual',
      },
    },
    {
      name: 'discountPercentage',
      label: 'Discount Percentage',
      type: 'number',
      required: true,
      min: 1,
      max: 100,
    },
    {
      name: 'appliesTo',
      label: 'Applies To',
      type: 'select',
      required: true,
      defaultValue: 'all',
      options: [
        { label: 'All Products', value: 'all' },
        { label: 'Category', value: 'category' },
      ],
    },
    {
      name: 'category',
      label: 'Category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        condition: data => data.appliesTo === 'category',
      },
    },
    // New field for "bulk purchase" mode
    {
      name: 'bulkQuantity',
      label: 'Bulk Quantity Threshold',
      type: 'number',
      required: false,
      admin: {
        condition: data => data.discountMode === 'bulk',
      },
    },
    {
      name: 'startDate',
      label: 'Start Date',
      type: 'date',
      required: false,
    },
    {
      name: 'expirationDate',
      label: 'Expiration Date',
      type: 'date',
      required: true,
    },
    {
      name: 'maxUses',
      label: 'Max Uses',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 100, // or whatever you want
    },
    {
      name: 'currentUses',
      label: 'Current Uses',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'isActive',
      label: 'Is Active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

export default Discounts
