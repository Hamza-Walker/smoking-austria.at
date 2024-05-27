import { draftMode } from 'next/headers'
import React from 'react'
import { Category, Page } from '../../../payload/payload-types'
import { fetchDoc } from '../../_api/fetchDoc'
import { fetchDocs } from '../../_api/fetchDocs'
import { Blocks } from '../../_components/Blocks'
import { Gutter } from '../../_components/Gutter'
import Filters from './Filters'
import classes from './index.module.scss'

const Products = async () => {
  const { isEnabled: isDraftMode } = draftMode()
  let page: Page | null = null
  let categroies: Category[] | null = null

  try {
    page = await fetchDoc<Page>({
      collection: 'pages',
      slug: 'products',
      draft: isDraftMode,
    })

    categroies = await fetchDocs<Category>('categories')
    console.log(page)
  } catch (error) {
    console.log(error)
  }

  return (
    <div className={classes.container}>
      <Gutter className={classes.products}>
        <Filters />
        <Blocks blocks={page.layout} disableTopPadding={true} />
      </Gutter>
    </div>
  )
}

export default Products
