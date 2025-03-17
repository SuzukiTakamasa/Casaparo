import { APIRequest, APIResponse, R2Response, Result , IsSuccess, WebPushSubscription, BroadcastPayload } from './interfaces'
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

export class APIClient {
    private readonly host: string
    private readonly headers: {[key: string]: string}

    constructor() {
        this.host = process.env.NEXT_PUBLIC_BACKEND_HOST_NAME as string
        this.headers = {
            'Content-Type': 'application/json',
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
}

export class R2Client {
    private readonly host: string
    private readonly headers: {[key: string]: string}

    constructor() {
        this.host = process.env.NEXT_PUBLIC_R2_WORKER_HOST_NAME as string
        this.headers = {
            'Content-Type': 'application/octet-stream',
        } as const
    }
    public async upload(file: File): Promise<R2Response> {
        const res = await fetch(`${this.host}/upload`, {
            method: 'POST',
            body: file,
            headers: this.headers
        })
        return await res.json()
    }
    public async delete(fileName: string): Promise<R2Response> {
        const res = await fetch(`${this.host}/delete`, {
            method: 'POST',
            body: JSON.stringify({file_name: fileName}),
            headers: this.headers
        })
        return await res.json()
    }
}

export class WebPushSubscriber {
    private readonly host: string
    private readonly headers: {[key: string]: string}
    private readonly subscribeOptions: PushSubscriptionOptions

    constructor(applicationServerKey: Uint8Array) {
        this.host = process.env.NEXT_PUBLIC_WEB_PUSH_HOST_NAME as string
        this.headers = {
            'Content-Type': 'application/json',
        }
        this.subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: new Uint8Array(applicationServerKey).buffer
        }
    }
    public async isSubscribed(): Promise<Result<PushSubscription>> {
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            return { data: subscription, error: null }
        } catch (e) {
            console.log(e)
            return { data: null, error: String(e) }
        }
    }

    public async subscribe(): Promise<Result<IsSuccess>> {
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.subscribe(this.subscribeOptions)
            const webPushSubscription: WebPushSubscription = {
                endpoint: subscription.endpoint,
                p256h_key: String(subscription.getKey('p256dh')),
                auth_key: String(subscription.getKey('auth')),
                version: 0
            }
            const res = await fetch(this.host + '/subscribe', {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(webPushSubscription)
            })
            const jsonRes = await res.json()
            return { data: <IsSuccess>jsonRes, error: null }
        } catch (e) {
            console.log(e)
            return { data: null, error: String(e) }
        }
    }

    public async unsubscribe(): Promise<Result<IsSuccess>> {
        try {
            const subscription = await this.isSubscribed()
            if (!subscription.data) return { data: null, error: 'No Subscription' }
            const webPushSubscription: WebPushSubscription = {
                endpoint: subscription.data.endpoint,
                p256h_key: String(subscription.data.getKey('p256dh')),
                auth_key: String(subscription.data.getKey('auth')),
                version: 0
            }
            const res = await fetch(this.host + '/unsubscribe', {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(webPushSubscription)
            })
            const jsonRes = await res.json()
            await subscription.data.unsubscribe()
            return { data: <IsSuccess>jsonRes, error: null }
        } catch (e) {
            console.log(e)
            return { data: null, error: String(e) }
        }
    }

    public async broadcast(payload: BroadcastPayload): Promise<Result<IsSuccess>> {
        try {
            const res = await fetch(this.host + '/broadcast', {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(payload)
            })
            const jsonRes = await res.json()
            return { data: <IsSuccess>jsonRes, error: null }
        } catch (e) {
            console.log(e)
            return { data: null, error: String(e) }
        }
    }
}