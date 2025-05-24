import { Toaster, toast } from 'react-hot-toast'
import { Result } from '@/app/_utils/interfaces'

export type ToastMessageProps = {
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
}

export const toastMessage = ({ message, type }: ToastMessageProps) => {
    switch (type) {
        case 'success':
            toast.success(message)
            break
        case 'error':
            toast.error(message)
            break
        case 'info':
            toast(message)
            break
        case 'warning':
            toast(message, { icon: '⚠️' })
            break
        default:
            break
    }
}

export const APIResponseToast = <T,>(response: Result<T>, successMsg: string, errMsg: string) => {
    if (response.error === null) {
        toastMessage({ message: successMsg, type: 'success' })
    } else {
        toastMessage({ message: `${errMsg}:\n${response.error}`, type: 'error' })
    }
}

export const ToasterComponent = () => {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                duration: 3000,
            }}
        />
    )
}