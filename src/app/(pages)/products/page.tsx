import { draftMode } from 'next/headers'
import React from 'react'
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
  let categroies: Category[] | null = null

  const printPopulatedDocsDetails = docs => {
    docs.forEach(doc => {
      console.log('Current Document:', doc)

      // Check if populatedDocs exists and is an array
      if (Array.isArray(doc.populatedDocs)) {
        console.log('Populated Docs:')
        doc.populatedDocs.forEach(popDoc => {
          console.log(popDoc)
        })
      } else {
        console.log('No populatedDocs found.')
      }
    })
  }

  try {
    page = await fetchDoc<Page>({
      collection: 'pages',
      slug: 'products',
      draft: isDraftMode,
    })
    printPopulatedDocsDetails(page.layout)
    categroies = await fetchDocs<Category>('categories')
  } catch (error) {
    console.log(error)
  }

  return (
    <div className={classes.container}>
      <Gutter className={classes.products}>
        <Filters categories={categroies} />
        <Blocks blocks={page.layout} disableTopPadding={true} />
      </Gutter>
      <HR />
    </div>
  )
}

export default Products
