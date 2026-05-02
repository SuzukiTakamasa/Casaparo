import { ReactNode } from 'react'

type HorizontallyScrollableTableProps = {
    children: ReactNode
}

export const HorizontallyScrollableTable = ({ children }: HorizontallyScrollableTableProps) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full mt-4">
                {children}
            </table>
        </div>
    )
}

