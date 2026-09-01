import { useState } from 'react'
import arrowIcon from '../assets/figma/carousel-arrow.svg'

export function PhotoCarousel({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0)

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

  return (
    <div className="carousel">
      <img src={photos[index]} alt={alt} />
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
