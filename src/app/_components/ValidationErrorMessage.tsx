
type ValidationErrorMessageProps = {
    message: string
}

const ValidationErrorMessage = ({ message }: ValidationErrorMessageProps) => {
    return (
        <>{message !== "" && <div className="text-sm text-red-500">{message}</div>}</>
    )
}

export default ValidationErrorMessage