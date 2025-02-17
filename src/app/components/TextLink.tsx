import Link from 'next/link'
import { ArrowRightStartToIcon, BackButtonIcon } from './Heroicons'

type TextLinkProps = {
    path: string,
    text: string
}

export const TextLink = ({ path, text }: TextLinkProps) => {
    return (
        <Link href={path} className="flex text-xl text-blue-500 font-bold hover:underline">
            <ArrowRightStartToIcon />
            {text}
        </Link>
    )
}

export const TextLinkToBackToPreviousPage = ({ path, text}: TextLinkProps) => {
    return (
        <Link href={path} className="text-blue-500 font-bold hover:underline [-webkit-tap-highlight-color:transparent]">
            <div className="flex items-center mt-2">
                <BackButtonIcon />
                <span className="ml-2">{text}</span>
            </div>
        </Link>
    )
}