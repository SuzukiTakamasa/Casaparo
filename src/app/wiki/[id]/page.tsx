
import { useEffect } from 'react'
import APIClient from '@utils/api_client'
import { WikiResponse, WikiData } from '@utils/constants'

const client = new APIClient()

export async function generateStaticParams() {
    const wikis = await client.get<WikiResponse>('/wiki')
    return wikis!.map((wiki) => ({
        id: String(wiki.id)
    }))
}

const WikiDetail = ({ params }: {params: {id: string}}) => {
    
    return (
        <>{params.id}</>
    )
}

export default WikiDetail