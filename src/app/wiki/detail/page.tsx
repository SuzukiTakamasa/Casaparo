"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import DOMPurify from 'dompurify'
import APIClient from '@utils/api_client'
import { WikiData } from '@utils/constants'


const client = new APIClient()


const WikiDetail = () => {
    const [wikiDetail, setWikiDetail] = useState<WikiData>({id: 0, title: "", content: "", created_by: 0, updated_at: "", image_url: "", version: 0})
    const param = useSearchParams()
    const id = param.get("id")

    const fetchWikiDetail = useCallback(async () => {
        const res = await client.get<WikiData>(`/v2/wiki/${id}`)
        if (res.data) {
            setWikiDetail(res.data)
        }
    }, [id]) 

    useEffect(() => {
        fetchWikiDetail()
    }, [fetchWikiDetail])
    return (
        <>
            <div className="container mx-auto p-4 grid place-items-left">
                <h1 className="text-2xl font-bold">{wikiDetail.title}</h1>
                {wikiDetail.image_url !== "" && <Image src={wikiDetail.image_url} alt={wikiDetail.title} />}
                <div className="text-lg mt-8">
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(wikiDetail.content)}} />
                </div>
            </div>
        </>
    )
}

export default WikiDetail