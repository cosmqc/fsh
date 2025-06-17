import { useEffect, useState } from 'react'
import styled from 'styled-components'
import type { ShortFishStatus } from '../secretjs/SecretJsFunctions'

type FishContainerProps = {
  $startPosition: number
}

const FishContainer = styled.div.attrs<FishContainerProps>(
  ({ $startPosition }: FishContainerProps) => ({
    style: {
      top: `${$startPosition}%`
    }
  })
)`
  position: absolute;
`

type PixelFishProps = {
  $reverse: boolean,
  $size: number,
  $colour: number,
  $x: number
}

const PixelFish = styled.img.attrs<PixelFishProps>(
  ({ $reverse, $size, $colour, $x }: PixelFishProps) => ({
    style: {
      left: `${$x}px`,
      width: `${$size}px`,
      height: 'auto',
      filter: `hue-rotate(${$colour}deg)`,
      opacity: `${$size}%`,
      transform: $reverse ? 'scaleX(-1)' : 'scaleX(1)',
      transition: 'left 0.1s linear', // Smooth movement between ticks
    }
  })
)`
  position: absolute;
`

export type FishProps = {
  $speed: number
  $reverse: boolean
  startY: number
  size: number
  fishStatus: ShortFishStatus,
  onRemove?: () => void // Callback when fish moves off screen
}

const Fish: React.FC<FishProps> = ({ 
  $speed, 
  $reverse, 
  startY, 
  size, 
  fishStatus, 
  onRemove 
}) => {
  // Calculate initial position based on direction
  const getInitialX = () => {
    if ($reverse) {
      return -60 // Start from left side
    } else {
      return window.innerWidth + 60 // Start from right side
    }
  }

  const [x, setX] = useState(getInitialX)

  useEffect(() => {
    // Calculate movement per tick based on speed
    // Higher speed = faster movement
    const pixelsPerTick = $speed * 0.5 // Adjust multiplier as needed
    
    const interval = setInterval(() => {
      setX(prevX => {
        let newX
        
        if ($reverse) {
          // Moving left to right
          newX = prevX + pixelsPerTick
          
          // Check if fish has moved off the right side
          if (newX > window.innerWidth + 200) {
            onRemove?.()
            return prevX // Don't update if we're removing
          }
        } else {
          // Moving right to left
          newX = prevX - pixelsPerTick
          
          // Check if fish has moved off the left side
          if (newX < -200) {
            onRemove?.()
            return prevX // Don't update if we're removing
          }
        }
        
        return newX
      })
    }, 100) // Tick every 100ms - adjust for smoother/choppier movement

    return () => clearInterval(interval)
  }, [$speed, $reverse, onRemove])

  // Reset position if window is resized
  useEffect(() => {
    const handleResize = () => {
      if (!$reverse && x > window.innerWidth) {
        setX(window.innerWidth + 60)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [x, $reverse])

  return (
    <FishContainer
      //@ts-ignore
      $startPosition={startY}
      style={{ pointerEvents: 'auto' }}
    >
      <PixelFish
        src='/fish.png'
        // @ts-ignore
        $reverse={$reverse}
        // @ts-ignore
        $size={size}
        $colour={fishStatus.colour}
        $x={x}
      />
    </FishContainer>
  )
}

export default Fish