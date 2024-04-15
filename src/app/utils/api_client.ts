import { APIRequest, UploadResponse } from './constants'
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
        } catch (e) {
            console.log(e)
            return null
        }
    }
    public async upload(file: File): Promise<UploadResponse|null> {
        const headers = {
            'Content-Type': 'application/octet-stream',
            'Environment': process.env.NEXT_PUBLIC_DATABASE_ENVIRONMENT as string
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_R2_WORKER_HOST_NAME}/upload`, {
                method: 'POST',
                body: file,
                headers: headers
            })
            return await res.json()
        } catch (e) {
            console.error(e)
            return null
        }
    }
}

export default APIClient