import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import styled from 'styled-components'
import { sleep } from '../utils/sleep'
import type { FishStatus } from '../secretjs/SecretJsFunctions'

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
  width: 100%;
`

type PixelFishProps = {
  $duration: number,
  $reverse: boolean,
  $distance: number,
  $colour: number
}

const PixelFish = styled.img.attrs<PixelFishProps>(
  ({ $duration, $reverse, $distance, $colour }: PixelFishProps) => ({
    style: {
      left: `${$reverse ? '-60px' : '100vw'}`,
      animation: `${$reverse ? 'ltr' : 'rtl'} ${$duration}s forwards`,
      width: `${$distance}px`,
      height: 'auto',
      filter: `hue-rotate(${$colour}deg)`
    }
  })
)`
  position: absolute;

  @keyframes ltr {
    0% {
      transform: translateX(0) scaleX(-1);
    }
    100% {
      transform: translateX(130vw) scaleX(-1);
    }
  }

  @keyframes rtl {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-130vw);
    }
  }
`

const handleHover = (fishId: number) => {
    console.log(fishId);
}

export type FishProps = {
  $duration: number
  $reverse: boolean
  startY: number
  distance: number
  fishStatus: FishStatus,
  removeFish: (fish: FishStatus) => void
}

const Fish: React.FC<FishProps> = ({ $duration, $reverse, startY, distance, fishStatus, removeFish }) => {
  const [isDead, setIsDead] = useState(false)

  const removeSelf = async () => {
    await sleep($duration)
    setIsDead(true)
    removeFish(fishStatus)
  }

  useEffect(() => {
    removeSelf()
  }, [])

  if (isDead) return null

  return (
    <FishContainer
      //@ts-ignore
      $startPosition={startY}
      onMouseEnter={() => handleHover(fishStatus.id)}
    >
      <PixelFish
        src='/fish.png'
        // @ts-ignore
        $duration={$duration}
        // @ts-ignore
        $reverse={$reverse}
        // @ts-ignore
        $distance={distance}
        $colour={fishStatus.colour}
      />
    </FishContainer>
  )
}

export default Fish