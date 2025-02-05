'use client'

import React from 'react'
import { Category } from '../../../../payload/payload-types'
import { Checkbox } from '../../../_components/Checkbox'
import { HR } from '../../../_components/HR'
import { RadioButton } from '../../../_components/Radio'
import { useFilter } from '../../../_providers/Filter'

import classes from './index.module.scss'

const Filters = ({ categories }: { categories: Category[] }) => {
  const { categoryFilters, sort, setCategoryFilters, setSort } = useFilter()

  // Debug the incoming data
  console.log('Raw Categories:', categories)

  // First, separate parent and child categories
  const parentCategories = categories.filter(cat => !cat.parentCategory)
  const childCategories = categories.filter(cat => cat.parentCategory)

  // Create hierarchy map
  const categoryMap = childCategories.reduce<{ [key: string]: Category[] }>((acc, category) => {
    if (category.parentCategory) {
      const parentId =
        typeof category.parentCategory === 'object'
          ? category.parentCategory.id.toString()
          : category.parentCategory.toString()

      if (!acc[parentId]) {
        acc[parentId] = []
      }
      acc[parentId].push(category)
    } else {
      const catId = category.id.toString()
      acc[catId] = acc[catId] || [] // Ensure every category has an entry
    }
    return acc
  }, {})

  // Debug logging
  console.log('Category Map:', categoryMap)

  const handleCategories = (categoryId: string) => {
    if (categoryFilters.includes(categoryId)) {
      setCategoryFilters(categoryFilters.filter(id => id !== categoryId))
    } else {
      setCategoryFilters([...categoryFilters, categoryId])
    }
  }

  const handleSort = (value: string) => setSort(value)

  const renderCategories = (categories: Category[], level = 0) => {
    return categories.map(category => (
      <div key={category.id} className={classes.categoryGroup}>
        <div className={level === 0 ? classes.parentCategory : classes.subcategoryItem}>
          {level > 0 && (
            <>
              <span className={classes.treeLine}>└──</span>
              <div className={classes.checkboxWrapper}>
                <Checkbox
                  label={category.title}
                  value={category.id.toString()}
                  isSelected={categoryFilters.includes(category.id.toString())}
                  onClickHandler={handleCategories}
                />
              </div>
            </>
          )}
          {level === 0 && (
            <Checkbox
              label={category.title}
              value={category.id.toString()}
              isSelected={categoryFilters.includes(category.id.toString())}
              onClickHandler={handleCategories}
            />
          )}
        </div>
        {categoryMap[category.id.toString()]?.length > 0 && (
          <div className={level === 0 ? classes.subcategories : classes.subSubcategories}>
            {renderCategories(
              categoryMap[category.id.toString()].sort((a, b) => a.title.localeCompare(b.title)),
              level + 1,
            )}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className={classes.filters}>
      <div>
        <h6 className={classes.title}>Product Categories</h6>
        <div className={classes.categories}>{renderCategories(categories)}</div>
        <HR className={classes.hr} />
        <h6 className={classes.title}>Sort By</h6>
        <div className={classes.categories}>
          <RadioButton
            label="Latest"
            value="-createdAt"
            isSelected={sort === '-createdAt'}
            onRadioChange={handleSort}
            groupName="sort"
          />
          <RadioButton
            label="Oldest"
            value="createdAt"
            isSelected={sort === 'createdAt'}
            onRadioChange={handleSort}
            groupName="sort"
          />
        </div>
      </div>
    </div>
  )
}

export default Filters
