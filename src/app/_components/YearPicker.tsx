import { createContext, useContext, ReactNode } from 'react'

export type YearContextType  = {
    year: number,
    setYear: (year: number) => void
}

type YearProviderProps = {
    children: ReactNode
    year: number
    setYear: React.Dispatch<React.SetStateAction<number>>
}

const defaultYearContext: YearContextType = {
    year: new Date().getFullYear(),
    setYear: () => {}
}

export const YearContext = createContext<YearContextType>(defaultYearContext)

export const YearProvider = ({ children, year, setYear }: YearProviderProps) => {

    return (
        <YearContext.Provider value={{ year, setYear }}>
            {children}
        </YearContext.Provider>
    )
}

const YearPicker = () => {
    const { year, setYear } = useContext(YearContext) as YearContextType

    return (
        <div className="w-40">
            <select
                value={year}
                onChange={(e) => {setYear(parseInt(e.target.value, 10))}}
                className="form-select block w-full px-3 py-2 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-int-out m-0 focs:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
                <option value={year - 1}>{year - 1}</option>
                <option value={year}>{year}</option>
                <option value={year + 1}>{year + 1}</option>
            </select>
        </div>
    )
}

export default YearPicker