'use client'

import React, { useState, useEffect } from 'react'
import { Blocks } from '../../_components/Blocks'
import classes from './index.module.scss'

const MediaCarousel = ({ mediaBlocks }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  const handleNextMedia = () => {
    setCurrentMediaIndex(prevIndex => (prevIndex + 1) % mediaBlocks.length)
  }

  const handlePreviousMedia = () => {
    setCurrentMediaIndex(prevIndex => (prevIndex - 1 + mediaBlocks.length) % mediaBlocks.length)
  }

  useEffect(() => {
    const interval = setInterval(handleNextMedia, 5000) // Auto-advance every 5 seconds
    return () => clearInterval(interval)
  }, [mediaBlocks])

  return (
    <div className={classes.carouselContainer}>
      <div className={classes.imageContainer}>
        <Blocks blocks={[mediaBlocks[currentMediaIndex]]} className={classes.image} />
      </div>
      {mediaBlocks.length > 1 && (
        <div className={classes.navigationContainer}>
          <button
            onClick={handlePreviousMedia}
            className={classes.nextButton}
            aria-label="Previous"
          >
            &#9664; {/* Left Arrow */}
          </button>
          <button onClick={handleNextMedia} className={classes.nextButton} aria-label="Next">
            &#9654; {/* Right Arrow */}
          </button>
        </div>
      )}
    </div>
  )
}

export default MediaCarousel
