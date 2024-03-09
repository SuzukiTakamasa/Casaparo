import APIClient from '@utils/api_client'
import { WikiResponse } from '@utils/constants'
import { useParams } from "next/navigation";

const client = new APIClient()

export const generateStaticParams = async() => {
    const wikis = await client.get<WikiResponse>('/wiki').then((res) => res)
    return wikis!.map((wiki) => ({
        id: String(wiki.id)
    }))
}


const Page = ({ params }: {params: {id: string}}) => {
    return (
        <>{params.id}</>
    )
}

export default Page