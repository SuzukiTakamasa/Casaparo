import { createContext, useContext, ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './Heroicons'

export type GeneralPaginationContextType = {
    page: number
    handlePageIncrement: () => void
    handlePageDecrement: () => void
}

type GeneralPaginationProviderProps = {
    children: ReactNode
    page: number
    setPage: React.Dispatch<React.SetStateAction<number>>
}

export type GeneralPaginationStrProps = {
    numberOfDataPerPage: number
    numberOfData: number
    cssStr: string
}

const defaultGeneralPagenationContext: GeneralPaginationContextType = {
    page: 1,
    handlePageIncrement: () => {},
    handlePageDecrement: () => {}
}

export const getFirstAndLastDataIndexPerPage = (pagination: number, numberOfDataPerPage: number): readonly number[] & { length: 2 } => {
    const firstDataIndexPerPage = (pagination - 1) * numberOfDataPerPage + 1
    const lastDataIndexPerPage = pagination * numberOfDataPerPage
    return [firstDataIndexPerPage, lastDataIndexPerPage] as const
}

export const GeneralPaginationContext = createContext<GeneralPaginationContextType>(defaultGeneralPagenationContext)

export const GeneralPaginationProvider = ({ children, page, setPage }: GeneralPaginationProviderProps) => {

    const handlePageIncrement = () => {
        setPage(page => page + 1)
    }
    const handlePageDecrement = () => {
        setPage(page => page - 1)
    }

    return (
        <GeneralPaginationContext.Provider value={{ page, handlePageIncrement, handlePageDecrement }}>
            {children}
        </GeneralPaginationContext.Provider>
    )
}

export const GeneralPaginationStr = ({ numberOfDataPerPage, numberOfData, cssStr }: GeneralPaginationStrProps) => {
    const { page } = useContext(GeneralPaginationContext) as GeneralPaginationContextType
    const firstDataIndexPerPage = (page - 1) * numberOfDataPerPage + 1
    const lastDataIndexPerPage = page * numberOfDataPerPage
    return (
        <div className={`${cssStr}`}>
            {`${numberOfData > 0 ? firstDataIndexPerPage : 0} - ${lastDataIndexPerPage <= numberOfData ? lastDataIndexPerPage : numberOfData} / ${numberOfData}`}
        </div>
    )
}

const GeneralPaginator = ({ numberOfDataPerPage, numberOfData, cssStr }: GeneralPaginationStrProps) => {
    const { page, handlePageIncrement, handlePageDecrement } = useContext(GeneralPaginationContext) as GeneralPaginationContextType
    const isDisabledLeft = page === 1
    const isDisabledRight = page * numberOfDataPerPage >= numberOfData

    return (
        <div className="flex justify-center space-x-16">
            <button
                className={`bg-transparent ${isDisabledLeft ? "text-gray-700" : "text-white"} font-bold py-2 px-4 rounded`}
                onClick={handlePageDecrement}
                disabled={isDisabledLeft}
            >
                <ChevronLeftIcon />
            </button>
            <GeneralPaginationStr numberOfDataPerPage={numberOfDataPerPage} numberOfData={numberOfData} cssStr={cssStr}/>
            <button
                className={`bg-transparent ${isDisabledRight ? "text-gray-700" : "text-white"} font-bold py-2 px-4 rounded`}
                onClick={handlePageIncrement}
                disabled={page * numberOfDataPerPage >= numberOfData}
            >
                <ChevronRightIcon />
            </button>
        </div>
    )
}

export default GeneralPaginator