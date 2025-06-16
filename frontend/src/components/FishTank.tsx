import { useEffect, useState } from 'react'
import styled from 'styled-components'
import useFish from '../contexts/fishes'
import { sleep } from '../utils/sleep'
import type { ShortFishStatus } from '../secretjs/SecretJsFunctions'

const Container = styled.div`
  position: fixed;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: linear-gradient(#2191FB, #2151aB);
`

type FishTankProps = {
  allFish: ShortFishStatus[];
};

const FishTank = ({ allFish }: FishTankProps) => {
  const { fishElements, showFish, fishInTank, setFishInTank } = useFish()
  const [tick, setTick] = useState(0)

  const updateTick = async () => {
    await sleep(2)
    setTick((tick + 1) % 3)
  }

  useEffect(() => {
    updateTick()

    if (allFish.length == 0) return;

    // Get a random fish that isn't on screen
    let fishNotInTank = allFish.filter(
      (fish) => !fishInTank.has(fish)
    )
    let fish = fishNotInTank[Math.floor(Math.random() * fishNotInTank.length)]

    if (fish) {
      // Show it
      showFish(fish)
      setFishInTank(new Set([...fishInTank, fish]))
    }
  }, [tick])

  return <Container>{fishElements}</Container>
}

export default FishTank