import ClipLoader from 'react-spinners/ClipLoader'

type LoaderProps = {
    size: number
    isLoading: boolean
}

const Loader = ({size, isLoading}: LoaderProps) => {
    return (
        <ClipLoader
            color="#747474"
            size={size}
            loading={isLoading}
        />
    )
}

export default Loader