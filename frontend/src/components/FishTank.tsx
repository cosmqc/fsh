import { useEffect, useState } from 'react'
import styled from 'styled-components'
import useFish from '../contexts/fishes'
import { sleep } from '../utils/sleep'
import type { FishStatus } from '../secretjs/SecretJsFunctions'

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`

type FishTankProps = {
  allFish: FishStatus[];
};

const FishTank = ({ allFish }: FishTankProps) => {
  const { fishElements, showFish, fishInTank, setFishInTank } = useFish()
  const [tick, setTick] = useState(0)

  const updateTick = async () => {
    await sleep(2)
    setTick((tick + 1) % 3)
  }

  useEffect(() => {
    // Get a random fish that isn't on screen
    
    let fish = allFish.filter(
      (fish) => !fishInTank.has(fish)
    )[Math.floor(Math.random() * allFish.length)]
    console.log(fish)

    if (fish) {
      // Show it
      showFish(fish)
      setFishInTank(new Set([...fishInTank, fish]))
    }

    updateTick()
  }, [tick])

  return <Container>{fishElements}</Container>
}

export default FishTank