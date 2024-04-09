import * as dotenv from 'dotenv'
dotenv.config()
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.blob()
        const response = await fetch(process.env.NEXT_PUBLIC_R2_WORKER_HOST_NAME as string, {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        })
        const data = await response.json()
        return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({error: (e as Error).message }, { status: 500 })
    }
}