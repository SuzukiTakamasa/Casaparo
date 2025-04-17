import { Toaster, toast } from 'react-hot-toast'

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