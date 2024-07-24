import React from 'react'
import { draftMode } from 'next/headers'

import { Category, Page } from '../../../payload/payload-types'
import { fetchDoc } from '../../_api/fetchDoc'
import { fetchDocs } from '../../_api/fetchDocs'
import { Blocks } from '../../_components/Blocks'
import { Gutter } from '../../_components/Gutter'
import { HR } from '../../_components/HR'
import Filters from './Filters'

import classes from './index.module.scss'

const Products = async () => {
  const { isEnabled: isDraftMode } = draftMode()
  let page: Page | null = null
  let categories: Category[] | null = null

  try {
    page = await fetchDoc<Page>({
      collection: 'pages',
      slug: 'products',
      draft: isDraftMode,
    })
    console.log('Page fetched successfully:', page)

    categories = await fetchDocs<Category>('categories')
    console.log('Categories fetched successfully:', categories)
  } catch (error) {
    console.error('Error fetching data:', error)
    return (
      <div className={classes.container}>
        <Gutter className={classes.products}>
          <p>Error loading products. Please try again later.</p>
        </Gutter>
      </div>
    )
  }

  if (!page || !categories) {
    return (
      <div className={classes.container}>
        <Gutter className={classes.products}>
          <p>No data available.</p>
        </Gutter>
      </div>
    )
  }

  return (
    <div className={classes.container}>
      <Gutter className={classes.products}>
        <Filters categories={categories} />
        <Blocks blocks={page.layout} disableTopPadding={true} />
      </Gutter>
      <HR />
    </div>
  )
}

export default Products
