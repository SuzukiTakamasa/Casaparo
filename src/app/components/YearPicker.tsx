import {createContext, useContext, useState, ReactNode} from 'react'

type YearContextType  = {
    year: number,
    setYear: (year: number) => void
}

type YearProviderProps = {
    children: ReactNode
}

const YearContext = createContext<YearContextType | undefined>(undefined)

const currentYear = new Date().getFullYear()
const lastYear = currentYear - 1

export const YearProvider = ({ children }: YearProviderProps) => {
    const [year, setYear] = useState(currentYear)

    return (
        <YearContext.Provider value={{year, setYear}}>
            {children}
        </YearContext.Provider>
    )
}

const YearComponent = () => {
    const {year, setYear} = useContext(YearContext) as YearContextType

    return (
        <div className="w-40">
            <select
                value={year}
                onChange={(e) => {setYear(parseInt(e.target.value, 10))}}
                className="form-select block w-full px-3 py-2 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-int-out m-0 focs:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
                <option value={lastYear}>{lastYear}</option>
                <option value={currentYear}>{currentYear}</option>
            </select>
        </div>
    )
}

const YearPicker = () => {
    return (
    <YearProvider>
        <YearComponent />
    </YearProvider>
    )
}

export default YearPicker