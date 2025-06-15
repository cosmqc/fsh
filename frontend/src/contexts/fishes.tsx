import React, { createContext, useContext, useState } from 'react'
import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react'
import Fish from '../components/Fish'
import type { FishStatus } from '../secretjs/SecretJsFunctions'
import { Timestamp } from 'secretjs/dist/protobuf/google/protobuf/timestamp'

export type FishContextProps = {
  fishElements: ReactElement[],
  showFish: (fish: FishStatus, ) => void,
  fishInTank: Set<FishStatus>,
  setFishInTank: Dispatch<SetStateAction<Set<FishStatus>>>
}

export type FishProviderProps = {
  children: ReactNode
}

export const FishContext: React.Context<FishContextProps> = createContext<
  FishContextProps
>({} as FishContextProps)

export const FishContextProvider = ({ children }: FishProviderProps) => {
  const [fishElements, setFishElements] = useState<ReactElement[]>([])
  const [ fishInTank, setFishInTank ] = useState(new Set<FishStatus>())

  const removeFish = (fishToRemove: FishStatus) => {
    setFishInTank(new Set(
      Array.from(fishInTank).filter((fish) => fish != fishToRemove)
    ))
    setFishElements(fishElements.filter((fish) => fish != null))
  }

  const showFish = (fish: FishStatus) => {
    const reverse = Math.random() * 10 > 5
    const startY = Math.floor(Math.random() * 90) + 5
    const duration = Math.floor(Math.random() * 15 + 30)
    const distance = Math.floor(Math.random() * 100 + 13)

    setFishInTank(new Set([...fishInTank, fish]))

    setFishElements([
      ...fishElements,
      <Fish
        key={`fish-${fish.id}-${new Date().getMilliseconds()}`}
        $duration={duration}
        $reverse={reverse}
        startY={startY}
        distance={distance}
        fishStatus={fish}
        removeFish={removeFish}
      />
    ])
  }

  return (
    <FishContext.Provider
      value={{
        fishInTank,
        setFishInTank,
        showFish,
        fishElements
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