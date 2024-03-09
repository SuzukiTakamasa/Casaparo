
import APIClient from '@utils/api_client'
import { WikiResponse } from '@utils/constants'

const client = new APIClient()

export async function generateStaticParams() {
    const wikis = await client.get<WikiResponse>('/wiki').then((res) => res)
    return wikis!.map((wiki) => ({
        id: wiki.id
    }))
}


const WikiDetail = ({ params }: {params: {id: number}}) => {
    return (
        <>{params.id}</>
    )
}

export default WikiDetail