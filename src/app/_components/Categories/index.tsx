import Link from 'next/link'
import React from 'react'
import { Category } from '../../../payload/payload-types'
import CategoryCard from './CategroyCard'
import classes from './index.module.scss'

const Categories = ({ categories }: { categories: Category[] }) => {
  if (!categories || categories.length === 0) {
    return <div>No categories available.</div>
  }
  return (
    <section className={classes.constainer}>
      <div className={classes.titleWrapper}>
        <h3 className={classes.title}>Shop by Categroies</h3>
        <Link href="/products">View All</Link>
      </div>
      <div className={classes.list}>
        {categories.map((category, index) => (
          <CategoryCard key={index} category={category} />
        ))}
      </div>
    </section>
  )
}

export default Categories
