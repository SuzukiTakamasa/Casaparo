import * as dotenv from 'dotenv'
dotenv.config()
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
    const r2BucketHost = process.env.NEXT_PUBLIC_R2_BUCKET_NAME as string
    try {
        const body = await request.blob()
        const response = await fetch(process.env.NEXT_PUBLIC_R2_WORKER_HOST_NAME as string, {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Envionment': process.env.NEXT_PUBLIC_DATABASE_ENVIRONMENT as string
            }
        })
        const data = await response.json()
        return NextResponse.json({ image_url: `${r2BucketHost}/${data.file_name}`})
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}