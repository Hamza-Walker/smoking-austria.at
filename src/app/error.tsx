'use client'

import { useEffect } from 'react'
import { Button } from './_components/Button'
import { Gutter } from './_components/Gutter'
import { VerticalPadding } from './_components/VerticalPadding'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <Gutter>
      <VerticalPadding top="none" bottom="large">
        <h1 style={{ marginBottom: 0 }}>500</h1>
        <p>Something went wrong!</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button onClick={reset} label="Try again" appearance="primary" />
          <Button href="/" label="Go Home" appearance="secondary" />
        </div>
      </VerticalPadding>
    </Gutter>
  )
}
