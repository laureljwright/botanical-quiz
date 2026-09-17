import { useState } from 'react'
import arrowIcon from '../assets/figma/carousel-arrow.svg'

const MAX_RETRIES = 2

export function PhotoCarousel({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState<Record<number, boolean>>({})
  const [retries, setRetries] = useState<Record<number, number>>({})

  function handleImgError(i: number) {
    setRetries((r) => {
      const attempts = (r[i] ?? 0) + 1
      if (attempts > MAX_RETRIES) {
        setFailed((f) => ({ ...f, [i]: true }))
      }
      return { ...r, [i]: attempts }
    })
  }

  if (photos.length === 0) {
    return (
      <div className="carousel">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#888',
          }}
        >
          No photo yet
        </div>
      </div>
    )
  }

  const showControls = photos.length > 1
  const currentFailed = failed[index]
  const currentRetries = retries[index] ?? 0
  const src = currentRetries > 0 ? `${photos[index]}?retry=${currentRetries}` : photos[index]

  return (
    <div className="carousel">
      {currentFailed ? (
        <div className="carousel-error">Photo couldn't load</div>
      ) : (
        <img key={src} src={src} alt={alt} onError={() => handleImgError(index)} />
      )}
      {showControls && (
        <div className="carousel-controls">
          <button
            type="button"
            className="carousel-arrow prev"
            aria-label="Previous photo"
            onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
          >
            <img src={arrowIcon} alt="" />
          </button>
          <div className="carousel-dots">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`dot ${i === index ? 'active' : ''}`}
                aria-label={`Go to photo ${i + 1}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="carousel-arrow next"
            aria-label="Next photo"
            onClick={() => setIndex((i) => (i + 1) % photos.length)}
          >
            <img src={arrowIcon} alt="" />
          </button>
        </div>
      )}
    </div>
  )
}
