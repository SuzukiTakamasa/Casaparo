"use client"

import { useSearchParams } from 'next/navigation'
import APIClient from '@utils/api_client'
import { WikiResponse } from '@utils/constants'

const client = new APIClient()


const WikiDetail = () => {
    const param = useSearchParams()
    const id = param.get("id")
    return (
        <>{id}</>
    )
}

export default WikiDetail