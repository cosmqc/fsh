import React, { createContext, useContext, useState } from 'react'
import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react'
import Fish from '../components/Fish'
import type { ShortFishStatus } from '../secretjs/SecretJsFunctions'

export type FishContextProps = {
  fishElements: ReactElement[],
  showFish: (fish: ShortFishStatus, ) => void,
  fishInTank: Set<ShortFishStatus>,
  setFishInTank: Dispatch<SetStateAction<Set<ShortFishStatus>>>
}

export type FishProviderProps = {
  children: ReactNode
}

export const FishContext: React.Context<FishContextProps> = createContext<
  FishContextProps
>({} as FishContextProps)

export const FishContextProvider = ({ children }: FishProviderProps) => {
  const [fishElements, setFishElements] = useState<ReactElement[]>([])
  const [ fishInTank, setFishInTank ] = useState(new Set<ShortFishStatus>())

  const showFish = (fish: ShortFishStatus) => {
    const reverse = Math.random() > 0.5
    const startY = Math.floor(Math.random() * 90) + 5
    const speed = Math.floor(Math.random() * 15 + 30)
    const size = Math.floor(Math.random() * 100 + 13)

    setFishInTank(new Set([...fishInTank, fish]))

    setFishElements([
      ...fishElements,
      <Fish
        key={`fish-${fish.id}-${size}`}
        $speed={speed}
        $reverse={reverse}
        startY={startY}
        size={size}
        fishStatus={fish}
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