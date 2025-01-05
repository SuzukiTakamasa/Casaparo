import Link from 'next/link'
import { ArrowRightStartToIcon } from './Heroicons'

type TextLinkProps = {
    path: string,
    text: string
}

const TextLink = ({ path, text }: TextLinkProps) => {
    return (
        <Link href={path} className="flex text-xl text-blue-500 font-bold hover:underline">
            <ArrowRightStartToIcon />
            {text}
        </Link>
    )
}

export default TextLink