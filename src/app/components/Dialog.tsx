import { ReactNode } from 'react'

type DialogProps = {
    showDialog: boolean
    children: ReactNode
}

export const Dialog = ({ showDialog, children }: DialogProps) => {
    {showDialog && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded">
                {children}
            </div>
        </div>
    )}
}