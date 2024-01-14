import {createContext, useContext, useState, ReactNode} from 'react'

type MonthContextType  = {
    month: number,
    setMonth: (month: number) => void
}

type MonthProviderProps = {
    children: ReactNode
}

const MonthContext = createContext<MonthContextType | undefined>(undefined)

const currentMonth = new Date().getMonth()

export const MonthProvider = ({ children }: MonthProviderProps) => {
    const [month, setMonth] = useState(currentMonth)

    return (
        <MonthContext.Provider value={{month, setMonth}}>
            {children}
        </MonthContext.Provider>
    )
}