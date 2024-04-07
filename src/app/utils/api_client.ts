import { APIRequest } from './constants'
import crypto from 'crypto'
import * as AWS from 'aws-sdk'

import * as dotenv from 'dotenv'
dotenv.config()


class APIClient {
    private readonly host: string
    private readonly headers: {[key: string]: string}

    constructor() {
        this.host = process.env.NEXT_PUBLIC_BACKEND_HOST_NAME as string
        this.headers = {
            'Content-Type': 'application/json',
            'Environment': process.env.NEXT_PUBLIC_DATABASE_ENVIRONMENT as string
        }
    }
    public async get<T>(endpoint: string, params?: string): Promise<T|null> {
        if (params) endpoint += params

        try {
            const res = await fetch(this.host + endpoint, {
                method: 'GET',
                headers: this.headers
            })
            return await res.json()
        } catch (e) {
            console.log(e)
            return null
        }
    }
    public async post<T>(endpoint: string, data: APIRequest): Promise<T|null> {
        try {
            const res = await fetch(this.host + endpoint, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            })
            return await res.json()
        } catch(e) {
            console.log(e)
            return null
        }
    }
    public async put(file: File): Promise<string|null> {
        const r2Host = process.env.NEXT_PUBLIC_R2_HOST_NAME as string

        const date = new Date().toISOString().slice(0, 19).replace('T', 'T')
        const contentSha256 = async (file: File) => {
            const hash = crypto.createHash('sha256');
            for await (const chunk of file.stream() as any) {
              hash.update(chunk as Buffer)
            }
            return hash.digest('hex')
          }
          
         // to do: implement signature from aws-sdk
          
        const r2Headers = {
            'x-amz-content-sha256': '',
            'Content-Type': 'image/png',
            'X-Amz-Date': date,
            'Authorization': `AWS4-HMAC-SHA256 Credential=`
        }

        try {
            const res = await fetch(r2Host, {
                method: 'PUT',
                headers: r2Headers,
                body: file,
                redirect: 'follow'
            })
            return res.text()
        } catch(e) {
            console.log(e)
            return null
        }
    }
}

export default APIClient