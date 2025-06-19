import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react'
import Fish from '../components/Fish'
import type { ShortFishStatus } from '../secretjs/SecretJsFunctions'

export type FishContextProps = {
  fishElements: ReactElement[],
  showFish: (fish: ShortFishStatus) => void,
  fishInTank: Set<number>,
  setFishInTank: Dispatch<SetStateAction<Set<number>>>
  setHoveredFishId: React.Dispatch<React.SetStateAction<number | null>>
}

export type FishProviderProps = {
  children: ReactNode
}

export const FishContext: React.Context<FishContextProps> = createContext<
  FishContextProps
>({} as FishContextProps)

export const FishContextProvider = ({ children }: FishProviderProps) => {
  const [fishElements, setFishElements] = useState<ReactElement[]>([])
  const [fishInTank, setFishInTank] = useState<Set<number>>(new Set())
  const [hoveredFishId, setHoveredFishId] = useState<number | null>(null)
  const hoveredFishIdRef = useRef(hoveredFishId);

  // Keep hoveredFishId current with the variable
  useEffect(() => {
    hoveredFishIdRef.current = hoveredFishId
  }, [hoveredFishId])

  // Callback function to remove a fish from the context
  const handleRemove = (fishId: number) => {
    setFishElements(current => current.filter(ele => ele.key !== `fish-${fishId}`))
    setFishInTank(current => {
      const newSet = new Set(current)
      newSet.delete(fishId)
      return newSet
    })
  }

  // Add a fish to the context with random speed, position, direction, and distance from foreground.
  const showFish = (fish: ShortFishStatus) => {
    const reverse = Math.random() > 0.5
    const startY = Math.floor(Math.random() * 70) + 15
    const speed = Math.floor(Math.random() * 15 + 30)
    const size = Math.floor(Math.random() * 100 + 13)

    setFishElements(currentElements => [
      ...currentElements,
      <Fish
        key={`fish-${fish.id}`}
        $speed={speed}
        $reverse={reverse}
        startY={startY}
        size={size}
        fishStatus={fish}
        hoveredFishIdRef={hoveredFishIdRef}
        onRemove={() => handleRemove(fish.id)}
      />
    ])
  }

  return (
    <FishContext.Provider
      value={{
        fishInTank,
        setFishInTank,
        showFish,
        fishElements,
        setHoveredFishId
      }}
    >
      {children}
    </FishContext.Provider>
  )
}

export default function useFish () {
  const context = useContext(FishContext)
  return context
}