import {createContext, useContext, ReactNode} from 'react'

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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
                </svg>
            </button>
            <MonthStrProvider monthStr={monthStr} cssStr={cssStr}/>
            <button
                className={`bg-transparent text-white font-bold py-2 px-4 rounded ${month === 12 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                onClick={handleMonthIncrement}
                disabled={month >= 12}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    )
}

export default MonthPaginator