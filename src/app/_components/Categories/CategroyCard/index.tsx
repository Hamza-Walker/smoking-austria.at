'use client'

import { Category, Media } from '../../../../payload/payload-types'
import Link from 'next/link'
import React from 'react'
import classes from './index.module.scss'
import { useFilter } from '../../../_providers/Filter'

type CategoryCardProps = {
  category: Category
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const { setCategoryFilters } = useFilter()
  
  // Skip rendering if category has a parent
  if (category.parentCategory) {
    return null
  }

  const media = category.media as Media

  const backgroundStyle = media?.url
    ? { backgroundImage: `url(${media.url})` }
    : { backgroundColor: '#f5f5f5' } // fallback background color
  return (
    <Link
      href="/products"
      className={classes.card}
      style={backgroundStyle}
      onClick={() => {
        setCategoryFilters([category.id])
      }}
    >
      <p className={classes.title}>{category.title}</p>
    </Link>
  )
}

export default CategoryCard
