import { createContext, useContext, useState, ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './Heroicons'

export type GeneralPaginationContextType = {
    page: number
    handlePageIncrement: () => void
    handlePageDecrement: () => void
    firstDataIndexPerPage: number
    lastDataIndexPerPage: number
    handleFilterDataWithPagination: <T>(data: T[]) => T[]
}

type GeneralPaginationProviderProps = {
    children: ReactNode
    numberOfDataPerPage: number
}

export type GeneralPaginationStrProps = {
    className: string
    numberOfData: number
}

const defaultGeneralPagenationContext: GeneralPaginationContextType = {
    page: 1,
    handlePageIncrement: () => {},
    handlePageDecrement: () => {},
    firstDataIndexPerPage: 1,
    lastDataIndexPerPage: 1,
    handleFilterDataWithPagination: <T,>(data: T[]) => data
}

export const GeneralPaginationContext = createContext<GeneralPaginationContextType>(defaultGeneralPagenationContext)

export const GeneralPaginationProvider = ({ children, numberOfDataPerPage }: GeneralPaginationProviderProps) => {
    const [page, setPage] = useState(1)

    const handlePageIncrement = () => {
        setPage(page => page + 1)
    }
    const handlePageDecrement = () => {
        setPage(page => page - 1)
    }

    const firstDataIndexPerPage = (page - 1) * numberOfDataPerPage + 1
    const lastDataIndexPerPage = page * numberOfDataPerPage

    const handleFilterDataWithPagination = <T,>(data: T[]) => {
            return (
                data.length >= lastDataIndexPerPage ?
                data.slice(firstDataIndexPerPage - 1, lastDataIndexPerPage) :
                data.slice(firstDataIndexPerPage - 1)
            )
        }

    return (
        <GeneralPaginationContext.Provider value={{ page, handlePageIncrement, handlePageDecrement, firstDataIndexPerPage, lastDataIndexPerPage, handleFilterDataWithPagination }}>
            {children}
        </GeneralPaginationContext.Provider>
    )
}

const GeneralPaginator = ({ numberOfData, className }: GeneralPaginationStrProps) => {
    const { page, handlePageIncrement, handlePageDecrement, firstDataIndexPerPage, lastDataIndexPerPage } = useContext(GeneralPaginationContext) as GeneralPaginationContextType
    const isDisabledLeft = page === 1
    const isDisabledRight = lastDataIndexPerPage >= numberOfData

    return (
        <div className="flex justify-center space-x-16">
            <button
                className={`bg-transparent ${isDisabledLeft ? "text-gray-700" : "text-white"} font-bold py-2 px-4 rounded`}
                onClick={handlePageDecrement}
                disabled={isDisabledLeft}
            >
                <ChevronLeftIcon />
            </button>
            <div className={`${className}`}>
                {`${numberOfData > 0 ? firstDataIndexPerPage : 0} - ${lastDataIndexPerPage <= numberOfData ? lastDataIndexPerPage : numberOfData} / ${numberOfData}`}
            </div>
            <button
                className={`bg-transparent ${isDisabledRight ? "text-gray-700" : "text-white"} font-bold py-2 px-4 rounded`}
                onClick={handlePageIncrement}
                disabled={isDisabledRight}
            >
                <ChevronRightIcon />
            </button>
        </div>
    )
}

export default GeneralPaginator