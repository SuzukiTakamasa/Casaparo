import { createContext, useContext, ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './HeroicIcons'

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
    cssStr: string
}

const defaultGeneralPagenationContext: GeneralPaginationContextType = {
    page: 1,
    handlePageIncrement: () => {},
    handlePageDecrement: () => {}
}

export const GeneralPaginationContext = createContext<GeneralPaginationContextType>(defaultGeneralPagenationContext)

export const GeneralPaginationProvider = ({ children, page, setPage}: GeneralPaginationProviderProps) => {

    const handlePageIncrement = () => {

    }
    const handlePageDecrement = () => {

    }

    return (
        <GeneralPaginationContext.Provider value={{ page, handlePageIncrement, handlePageDecrement }}>
            {children}
        </GeneralPaginationContext.Provider>
    )
}

export const GeneralPaginationStr = ({ numberOfDataPerPage, cssStr }: GeneralPaginationStrProps) => {
    const { page } = useContext(GeneralPaginationContext) as GeneralPaginationContextType
    return (
        <div className={`${cssStr}`}>
            {`${page} - ${page * numberOfDataPerPage}`}
        </div>
    )
}

const GeneralPaginator = ({ numberOfDataPerPage, cssStr }: GeneralPaginationStrProps) => {
    const { handlePageIncrement, handlePageDecrement } = useContext(GeneralPaginationContext) as GeneralPaginationContextType

    return (
        <div className="flex justify-center space-x-16">
            <button
                className={`bg-transparent text-white font-bold py-2 px-4 rounded`}
                onClick={handlePageDecrement}
            >
                <ChevronLeftIcon />
            </button>
            <GeneralPaginationStr numberOfDataPerPage={numberOfDataPerPage} cssStr={cssStr}/>
            <button
                className={`bg-transparent text-white font-bold py-2 px-4 rounded`}
                onClick={handlePageIncrement}
            >
                <ChevronRightIcon />
            </button>
        </div>
    )
}

export default GeneralPaginator