"use client"

//export const runtime = 'edge'

import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import DOMPurify from 'dompurify'
import APIClient from '@utils/api_client'
import { BackButtonIcon } from '@/app/components/Heroicons'
import { WikiData } from '@/app/utils/interfaces'
import { convertUrlsToLinks } from '@/app/utils/utility_function'

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
            <Link href="/wiki" className="text-blue-500 font-bold hover:underline [-webkit-tap-highlight-color:transparent]">
                <div className="flex items-center mt-2">
                    <BackButtonIcon />
                    <span className="ml-2">Wiki一覧へ</span>
                </div>
            </Link>
            <div className="container mx-auto p-4 grid place-items-left">
                <h1 className="text-2xl font-bold">{wikiDetail.title}</h1>
                {wikiDetail.image_url !== "" && <Image src={wikiDetail.image_url} width={250} height={250} alt={wikiDetail.title} />}
                <div className="text-lg mt-8">
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(convertUrlsToLinks(decodeURI(wikiDetail.content)))}} />
                </div>
            </div>
        </>
    )
}

export default WikiDetail