import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import type { ShortFishStatus } from '../secretjs/SecretJsFunctions'

type NametagProps = {
  $x: number
  $size: number
}

const Nametag = styled.div.attrs<NametagProps>(
  ({ $x, $size }) => ({
    style: {
      left: `${$x + $size / 2}px`,
      transform: 'translateX(-50%)'
    }
  })
)`
  position: absolute;
  top: -50px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;

  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2),
              inset 0 1px 2px rgba(255, 255, 255, 0.3),
              inset 0 -1px 2px rgba(0, 0, 0, 0.2);

  border: 1px solid rgba(255, 255, 255, 0.4);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.2) transparent transparent transparent;
    filter: blur(0.5px);
  }
`

type FishContainerProps = {
  $startPosition: number
}

const FishContainer = styled.div.attrs<FishContainerProps>(
  ({ $startPosition }) => ({
    style: { top: `${$startPosition}%` }
  })
)`
  position: absolute;
`

type PixelFishProps = {
  $reverse: boolean
  $size: number
  $colour: number
  $x: number
}

const PixelFish = styled.img.attrs<PixelFishProps>(
  ({ $reverse, $size, $colour, $x }) => ({
    style: {
      left: `${$x}px`,
      width: `${$size}px`,
      height: 'auto',
      filter: `hue-rotate(${$colour}deg)`,
      opacity: `${$size}%`,
      transform: $reverse ? 'scaleX(-1)' : 'scaleX(1)',
      transition: 'left 0.1s linear'
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
  fishStatus: ShortFishStatus
  hoveredFishIdRef: React.RefObject<number | null>
  onRemove?: () => void
}

const Fish: React.FC<FishProps> = ({
  $speed,
  $reverse,
  startY,
  size,
  fishStatus,
  hoveredFishIdRef,
  onRemove
}) => {
  const getInitialX = () => ($reverse ? -100 : window.innerWidth + 100)

  const [x, setX] = useState(getInitialX)
  const [isVisible, setIsVisible] = useState(!document.hidden)
  const [isHovered, setIsHovered] = useState(false)
  const [showNametag, setShowNametag] = useState(false)

  const visibleRef = useRef(isVisible)
  const hoveredRef = useRef(isHovered)

  // Keep refs in sync with their respective variables
  useEffect(() => {
    visibleRef.current = isVisible
  }, [isVisible])

  useEffect(() => {
    hoveredRef.current = isHovered
  }, [isHovered])

  // When the tab isn't active, pause the fish from moving and spawning
  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(!document.hidden)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Move the fish and show nametag if hovered
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!visibleRef.current) return;
      if (
        hoveredRef.current ||
        hoveredFishIdRef.current === fishStatus.id
      ) {
        setShowNametag(true);
        return;
      } else {
        setShowNametag(false);
      }

      const pixelsPerTick = $speed * 0.25

      setX(prevX =>
        $reverse ? prevX + pixelsPerTick : prevX - pixelsPerTick
      )
    }, 100)

    return () => clearInterval(intervalId)
  }, [])

  // Reset the R->L fish back to the side of the screen if it's resized
  useEffect(() => {
    const handleResize = () => {
      if (!$reverse && x > window.innerWidth) {
        setX(window.innerWidth + 200)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [x])

  // Remove the fish if it has left the screen
  useEffect(() => {
    if (x < -200 || x > window.innerWidth + 200) {
      onRemove?.()
    }
  }, [x])

  return (
    <FishContainer
      $startPosition={startY}
    >
      <PixelFish
        src='/fish.png'
        $reverse={$reverse}
        $size={size}
        $colour={fishStatus.colour}
        $x={x}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {(showNametag) && (
        <Nametag
          $x={x}
          $size={size}
        >
          <span style={{
            display: "inline-block",
            maxWidth: "300px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {fishStatus.name}
          </span>
        </Nametag>
      )}
    </FishContainer>
  )
}

export default Fish
