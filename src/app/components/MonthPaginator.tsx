import {createContext, useContext, useState, ReactNode} from 'react'

export type MonthContextType  = {
    month: number,
    handleMonthIncrement: () => void
    handleMonthDecrement: () => void
}

type MonthProviderProps = {
    children: ReactNode
}

const currentMonth = new Date().getMonth() + 1
const defaultMonthContext: MonthContextType = {
    month: currentMonth,
    handleMonthIncrement: () => {},
    handleMonthDecrement: () => {},
}

export const MonthContext = createContext<MonthContextType>(defaultMonthContext)

export const MonthProvider = ({ children }: MonthProviderProps) => {
    const [month, setMonth] = useState(currentMonth)

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

export const MonthPaginator = () => {
    const {month, handleMonthIncrement, handleMonthDecrement} = useContext(MonthContext) as MonthContextType

    return (
        <div className="fixed bottom-0 w-full px-4 flex justify-between">
            <button
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${month === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                onClick={handleMonthDecrement}
                disabled={month <= 1}
            >
                {month > 1 ? `${month - 1}月の家計簿` : `-`}
            </button>
            <button
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${month === 12 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bule-700'}`}
                onClick={handleMonthIncrement}
                disabled={month >= 12}
            >
                {month < 12 ? `${month + 1}月の家計簿` : `-`}
            </button>
        </div>
    )
}

export default MonthPaginator