import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import useFish from '../contexts/fishes'
import { sleep } from '../utils/sleep'
import type { ShortFishStatus } from '../secretjs/SecretJsFunctions'

const waveAnimation = keyframes`
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-100px);
  }
  100% {
    transform: translateX(0);
  }
`

const Container = styled.div`
  position: fixed;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    #87CEEB 0%,     /* Sky blue at top */
    #4682B4 15%,    /* Steel blue */
    #2191FB 25%,    /* Your original blue */
    #1E90FF 40%,    /* Dodger blue */
    #0066CC 55%,    /* Ocean blue */
    #2151aB 70%,    /* Your original darker blue */
    #004080 80%,    /* Deep blue */
    #003366 90%,    /* Darker blue */
    #D4B896 95%,    /* Sandy beige */
    #C4A77D 100%    /* Darker sand */
  );
  overflow: hidden;

  /* first layer of waves */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 150vw;
    height: 100px;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="%23ffffff"/><path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="%23ffffff"/><path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="%23ffffff"/></svg>') repeat-x;
    background-size: 1200px 120px;
    animation: ${waveAnimation} 8s ease-in-out infinite;
    opacity: 0.6;
    z-index: 1;
  }

  /* second layer of waves */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 150vw;
    height: 100px;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="%23ffffff"/><path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="%23ffffff"/><path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="%23ffffff"/></svg>') repeat-x;
    background-size: 1200px 120px;
    animation: ${waveAnimation} 5s ease-in-out infinite reverse;
    opacity: 0.3;
    z-index: 1;
  }
`

const SandTexture = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: 
    radial-gradient(circle at 20% 80%, rgba(160, 140, 100, 0.3) 1px, transparent 1px),
    radial-gradient(circle at 80% 20%, rgba(180, 160, 120, 0.3) 1px, transparent 1px),
    radial-gradient(circle at 40% 40%, rgba(200, 180, 140, 0.2) 1px, transparent 1px),
    radial-gradient(circle at 60% 70%, rgba(170, 150, 110, 0.2) 1px, transparent 1px);
  background-size: 15px 15px, 20px 20px, 10px 10px, 25px 25px;
  z-index: 2;
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
  
  return (
    <Container>
      <SandTexture />
      {fishElements}
    </Container>
  )
}

export default FishTank