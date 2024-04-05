import { APIRequest } from './constants'
import * as dotenv from 'dotenv'
dotenv.config()


class APIClient {
    private readonly host: string
    private readonly r2Host: string
    private readonly headers: {[key: string]: string}
    private readonly r2Headers: {[key: string]: string}

    constructor() {
        this.host = process.env.NEXT_PUBLIC_BACKEND_HOST_NAME as string
        this.r2Host = process.env.NEXT_PUBLIC_R2_HOST_NAME as string
        this.headers = {
            'Content-Type': 'application/json',
            'Environment': process.env.NEXT_PUBLIC_DATABASE_ENVIRONMENT as string
        }
        const date = new Date().toISOString().slice(0, 19).replace('T', 'T')
        this.r2Headers = {
            'x-amz-content-sha256': '',
            'Content-Type': 'image/png',
            'X-Amz-Date': '',
            'Authorization': `AWS4-HMAC-SHA256 Credential=`
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
    public async put(fileName: string): Promise<string|null> {
        const file = new File([fileName], fileName, {type: 'image/png'})
        try {
            const res = await fetch(this.r2Host, {
                method: 'PUT',
                headers: this.r2Headers,
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