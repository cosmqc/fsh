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
  width: 100%;
`

type PixelFishProps = {
  $speed: number,
  $reverse: boolean,
  $size: number,
  $colour: number
}

const PixelFish = styled.img.attrs<PixelFishProps>(
  ({ $speed, $reverse, $size, $colour }: PixelFishProps) => ({
    style: {
      left: `${$reverse ? '-60px' : '100vw'}`,
      animation: `${$reverse ? 'ltr' : 'rtl'} ${$speed}s forwards`,
      width: `${$size}px`,
      height: 'auto',
      filter: `hue-rotate(${$colour}deg)`,
      opacity: `${$size}%`,
      zIndex: -1
    }
  })
)`
  position: absolute;

  @keyframes ltr {
    0% {
      transform: translateX(0) scaleX(-1);
    }
    100% {
      transform: translateX(110vw) scaleX(-1);
    }
  }

  @keyframes rtl {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-110vw);
    }
  }
`

export type FishProps = {
  $speed: number
  $reverse: boolean
  startY: number
  size: number
  fishStatus: ShortFishStatus,
}

const Fish: React.FC<FishProps> = ({ $speed, $reverse, startY, size, fishStatus }) => {
  return (
    <FishContainer
      //@ts-ignore
      $startPosition={startY}
    >
      <PixelFish
        src='/fish.png'
        // @ts-ignore
        $speed={$speed}
        // @ts-ignore
        $reverse={$reverse}
        // @ts-ignore
        $size={size}
        $colour={fishStatus.colour}
      />
    </FishContainer>
  )
}

export default Fish