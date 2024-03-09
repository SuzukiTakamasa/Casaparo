"use client"

import APIClient from '@utils/api_client'
import { WikiResponse } from '@utils/constants'

const client = new APIClient()

/*export const generateStaticParams = async() => {
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

export default WikiDetail*/



import { useParams } from "next/navigation";

export default function WikiDetail() {
  const { id } = useParams()
  return <div>Post: {id}</div>;
}