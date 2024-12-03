import { APIRequest, APIResponse, R2Response, Result , IsSuccess } from './interfaces'
import * as dotenv from 'dotenv'
dotenv.config()

export const execExternalGetAPI = async<T>(url: string, getParams?: string): Promise<Result<T>> => {
    if (getParams) url += getParams
    try {
        const res = await fetch(url, {method: 'GET'})
        const jsonRes = await res.json()
    return { data: <T>jsonRes, error: null }
    } catch(e) {
        console.log(e)
        return { data: null, error: String(e) }
    }   
}

class APIClient {
    private readonly host: string
    private readonly headers: {[key: string]: string}

    constructor() {
        this.host = process.env.NEXT_PUBLIC_BACKEND_HOST_NAME as string
        this.headers = {
            'Content-Type': 'application/json',
            'Environment': process.env.NEXT_PUBLIC_DATABASE_ENVIRONMENT as string
        } as const
    }
    public async get<T extends APIRequest | APIResponse>(endpoint: string, params?: string): Promise<Result<T>> {
        if (params) endpoint += params

        try {
            const res = await fetch(this.host + endpoint, {
                method: 'GET',
                headers: this.headers
            })
            const jsonRes = await res.json()
            return { data: <T>jsonRes, error: null }
        } catch (e) {
            console.log(e)
            return { data: null, error: String(e) }
        }
    }
    public async post<T extends APIRequest>(endpoint: string, data: T): Promise<Result<IsSuccess>> {
        try {
            const res = await fetch(this.host + endpoint, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            })
            const jsonRes = await res.json()
            return { data: <IsSuccess>jsonRes, error: null }
        } catch (e) {
            console.log(e)
            return { data: null, error: String(e) }
        }
    }
    public async upload(file: File): Promise<R2Response> {
        const headers = {
            'Content-Type': 'application/octet-stream',
            'Environment': process.env.NEXT_PUBLIC_DATABASE_ENVIRONMENT as string
        } as const
        const res = await fetch(`${process.env.NEXT_PUBLIC_R2_WORKER_HOST_NAME}/upload`, {
            method: 'POST',
            body: file,
            headers: headers
        })
        return await res.json()
    }
    public async delete(fileName: string): Promise<R2Response> {
        const headers = {
            'Content-Type': 'application/octet-stream',
            'Environment': process.env.NEXT_PUBLIC_DATABASE_ENVIRONMENT as string
        } as const
        const res = await fetch(`${process.env.NEXT_PUBLIC_R2_WORKER_HOST_NAME}/delete`, {
            method: 'POST',
            body: JSON.stringify({file_name: fileName}),
            headers: headers
        })
        return await res.json()
    }
}

export default APIClient