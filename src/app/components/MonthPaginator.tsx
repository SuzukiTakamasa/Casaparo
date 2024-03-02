import { createContext, useContext, ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './HeroicIcons'

export type MonthContextType  = {
    month: number,
    handleMonthIncrement: () => void
    handleMonthDecrement: () => void
}

type MonthProviderProps = {
    children: ReactNode
    month: number
    setMonth: React.Dispatch<React.SetStateAction<number>>
}

type MonthStrProps = {
    monthStr: string,
    cssStr: string
}

const defaultMonthContext: MonthContextType = {
    month: new Date().getMonth() + 1,
    handleMonthIncrement: () => {},
    handleMonthDecrement: () => {},
}

export const MonthContext = createContext<MonthContextType>(defaultMonthContext)

export const MonthProvider = ({ children, month, setMonth }: MonthProviderProps) => {

    const handleMonthIncrement = () => {
        setMonth(m => m + 1)
    }

    const handleMonthDecrement = () => {
        setMonth(m => m - 1)
    }

    return (
        <MonthContext.Provider value={{month, handleMonthIncrement, handleMonthDecrement}}>
            {children}
        </MonthContext.Provider>
    )
}

export const MonthStrProvider = ({monthStr, cssStr}: MonthStrProps) => {
    const {month} = useContext(MonthContext) as MonthContextType
    return (
        <div className={`${cssStr}`}>
            {month + `${monthStr}`}
        </div>
    )
}

const MonthPaginator = ({monthStr, cssStr}: MonthStrProps) => {
    const {month, handleMonthIncrement, handleMonthDecrement} = useContext(MonthContext) as MonthContextType

    return (
        <div className="flex justify-center space-x-16">
            <button
                className={`bg-transparent text-white font-bold py-2 px-4 rounded ${month === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                onClick={handleMonthDecrement}
                disabled={month <= 1}
            >
                <ChevronLeftIcon />
            </button>
            <MonthStrProvider monthStr={monthStr} cssStr={cssStr}/>
            <button
                className={`bg-transparent text-white font-bold py-2 px-4 rounded ${month === 12 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                onClick={handleMonthIncrement}
                disabled={month >= 12}
            >
                <ChevronRightIcon />
            </button>
        </div>
    )
}

export default MonthPaginator