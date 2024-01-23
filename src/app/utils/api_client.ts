import {APIRequest, APIResponse} from './constants'

class APIClient {
    private host: string
    private headers: {[key: string]: string}

    constructor() {
        this.host = process.env.BACKEND_HOST_NAME || 'localhost'
        this.headers = {
            'Content-Type': 'application/json'
        }
    }
    public async get(endpoint: string, params?: {[key: string]: string}): Promise<APIResponse|null> {
        if (params) endpoint += new URLSearchParams(params).toString()

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