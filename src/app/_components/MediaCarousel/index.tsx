'use client'

import React, { useState, useEffect } from 'react'
import { Blocks } from '../../_components/Blocks'
import classes from './index.module.scss'

const MediaCarousel = ({ mediaBlocks }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  const handleNextMedia = () => {
    setCurrentMediaIndex(prevIndex => (prevIndex + 1) % mediaBlocks.length)
  }

  useEffect(() => {
    const interval = setInterval(handleNextMedia, 5000) // Auto-advance every 5 seconds
    return () => clearInterval(interval)
  }, [mediaBlocks])

  return (
    <div className={classes.mediaCarousel}>
      <Blocks blocks={[mediaBlocks[currentMediaIndex]]} />
      <button className={classes.nextButton} onClick={handleNextMedia}>
        Next Media
      </button>
    </div>
  )
}

export default MediaCarousel
