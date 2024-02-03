import {APIRequest, APIResponse} from './constants'
import * as dotenv from 'dotenv'
dotenv.config()


class APIClient {
    private host: string
    private headers: {[key: string]: string}

    constructor() {
        this.host = process.env.BACKEND_HOST_NAME as string
        this.headers = {
            'Content-Type': 'application/json',
            'Environment': process.env.DATABASE_ENVIRONMENT as string
        }
    }
    public async get(endpoint: string, params?: string): Promise<APIResponse[]> {
        if (params) endpoint += params

        try {
            const res = await fetch(this.host + endpoint, {
                method: 'GET',
                headers: this.headers
            })
            return await res.json()
        } catch (e) {
            console.log(e)
            return []
        }
    }
    public async post(endpoint: string, data: APIRequest): Promise<APIResponse|null> {
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
}

export default APIClient