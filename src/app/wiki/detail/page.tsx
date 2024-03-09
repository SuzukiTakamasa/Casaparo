"use client"

import { useEffect, useState, useCallback} from 'react'
import { useSearchParams } from 'next/navigation'
import APIClient from '@utils/api_client'
import { WikiData } from '@utils/constants'


const client = new APIClient()


const WikiDetail = () => {
    const [wikiDetail, setWikiDetail] = useState<WikiData>({id: 0, title: "", content: "", created_by: 0, version: 0})
    const param = useSearchParams()
    const id = param.get("id")

    const fetchWikiDetail = useCallback(async () => {
        const res = await client.get<WikiData>(`/wiki/${id}`)
        if (res !== null) {
            setWikiDetail(res)
        }
    }, [id]) 

    useEffect(() => {
        fetchWikiDetail()
    }, [fetchWikiDetail])
    return (
        <>
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold">{wikiDetail.title}</h1>
                <p className="text-lg mt-8">{wikiDetail.content}</p>
            </div>
        </>
    )
}

export default WikiDetail