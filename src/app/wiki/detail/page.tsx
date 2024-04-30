"use client"

import React, { useEffect, useState, useCallback} from 'react'
import { useSearchParams } from 'next/navigation'
import APIClient from '@utils/api_client'
import { WikiData } from '@utils/constants'


const client = new APIClient()

const addBreakPoint = (text: string) => {
    return text.split('\n').map((l, i) => (
        <span key={i}>
            {l}
            <br />
        </span>
    ))
}


const WikiDetail = () => {
    const [wikiDetail, setWikiDetail] = useState<WikiData>({id: 0, title: "", content: "", created_by: 0, updated_at: "", image_url: "", version: 0})
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
            <div className="container mx-auto p-4 grid place-items-center">
                <h1 className="text-2xl font-bold">{wikiDetail.title}</h1>
                {wikiDetail.image_url !== "" && <img src={wikiDetail.image_url} alt={wikiDetail.title} />}
                <div className="text-lg mt-8">
                    {wikiDetail.content.includes('\n') ? addBreakPoint(wikiDetail.content) : wikiDetail.content}
                </div>
            </div>
        </>
    )
}

export default WikiDetail