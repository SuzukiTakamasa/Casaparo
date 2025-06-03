import { createContext, useContext, ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './Heroicons'


export type MonthContextType  = {
    month: number
    handleMonthIncrement: () => void
    handleMonthDecrement: () => void
}

type MonthProviderProps = {
    children: ReactNode
    month: number
    setMonth: React.Dispatch<React.SetStateAction<number>>
    setYear: React.Dispatch<React.SetStateAction<number>>
}

type MonthPaginatorProps = {
    className?: string
}

const defaultMonthContext: MonthContextType = {
    month: new Date().getMonth() + 1,
    handleMonthIncrement: () => {},
    handleMonthDecrement: () => {},
}

export const MonthContext = createContext<MonthContextType>(defaultMonthContext)

export const MonthProvider = ({ children, month, setMonth, setYear }: MonthProviderProps) => {

    const handleMonthIncrement = () => {
        if (month === 12) {
            setMonth(1)
            setYear(y => y + 1)
        } else {
            setMonth(m => m + 1)
        }
    }

    const handleMonthDecrement = () => {
        if (month === 1) {
            setMonth(12)
            setYear(y => y - 1)
        } else {
            setMonth(m => m - 1)
        }
    }

    return (
        <MonthContext.Provider value={{ month, handleMonthIncrement, handleMonthDecrement }}>
            {children}
        </MonthContext.Provider>
    )
}

const MonthPaginator = ({ className }: MonthPaginatorProps) => {
    const { month, handleMonthIncrement, handleMonthDecrement } = useContext(MonthContext) as MonthContextType

    return (
        <div className="flex justify-center space-x-16">
            <button
                className={`bg-transparent text-white font-bold py-2 px-4 rounded`}
                onClick={handleMonthDecrement}
            >
                <ChevronLeftIcon />
            </button>
            <div className={className}>
                {month + "月"}
            </div>
            <button
                className={`bg-transparent text-white font-bold py-2 px-4 rounded`}
                onClick={handleMonthIncrement}
            >
                <ChevronRightIcon />
            </button>
        </div>
    )
}

export default MonthPaginator