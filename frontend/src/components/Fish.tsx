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
      return -100 // Start from left side
    } else {
      return window.innerWidth + 100 // Start from right side
    }
  }

  const [x, setX] = useState(getInitialX)
  const [isVisible, setIsVisible] = useState(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    const pixelsPerTick = $speed * 0.25
    
    setInterval(() => {
      if (!isVisible) return;

      setX(prevX => {
        const newX = $reverse ? prevX + pixelsPerTick : prevX - pixelsPerTick
        return newX
      })
    }, 100)

  }, [$speed, $reverse])

  useEffect(() => {
    const handleResize = () => {
      if (!$reverse && x > window.innerWidth) {
        setX(window.innerWidth + 200)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (x < -200 || x > window.innerWidth + 200) {
      onRemove?.();
    }
  }, [x]);

  return (
    <FishContainer
      $startPosition={startY}
      onMouseEnter={() => console.log(fishStatus)}
    >
      <PixelFish
        src='/fish.png'
        $reverse={$reverse}
        $size={size}
        $colour={fishStatus.colour}
        $x={x}
      />
    </FishContainer>
  )
}

export default Fish