
import { PencilIcon, TrashBoxIcon } from '@/app/components/Heroicons'

type ButtonProps = {
    onClick: () => void
}

export const EditButton = ({ onClick }: ButtonProps) => {
    return (
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-blod py-1 px-1 rounded"
            onClick={onClick}
        >
            <PencilIcon />
        </button>
    )
}

export const DeleteButton = ({ onClick }: ButtonProps) => {
    return (
        <button
            className="bg-red-500 hover:bg-red-700 text-white font-blod py-1 px-1 rounded"
            onClick={onClick}
        >
            <TrashBoxIcon />
        </button>
    )
}