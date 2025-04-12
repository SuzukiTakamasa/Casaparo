import { APIRequest, APIResponse, R2Response, Result , IsSuccess, WebPushSubscriptionData, BroadcastPayload } from './interfaces'
import * as dotenv from 'dotenv'
dotenv.config()
import { v4 as uuidv4 } from 'uuid'

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
    private readonly client: APIClient

    constructor(applicationServerKey: Uint8Array, apiClient: APIClient) {
        this.host = process.env.NEXT_PUBLIC_WEB_PUSH_HOST_NAME as string
        this.headers = {
            'Content-Type': 'application/json',
        }
        this.subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: new Uint8Array(applicationServerKey).buffer
        }
        this.client = apiClient
    }
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer)
        return btoa(String.fromCharCode.apply(null, Array.from(bytes)))
    }
    public async fetchSubscription(): Promise<Result<PushSubscription>> {
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()

            if (subscription?.expirationTime && subscription.expirationTime < Date.now()) {
                await this.unsubscribe()
                return { data: null, error: 'Subscription expired' }
            }
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
            const webPushSubscription: WebPushSubscriptionData = {
                subscription_id: uuidv4(),
                endpoint: subscription.endpoint,
                p256h_key: this.arrayBufferToBase64(subscription.getKey('p256dh') as ArrayBuffer),
                auth_key: this.arrayBufferToBase64(subscription.getKey('auth') as ArrayBuffer),
                version: 0
            }
            const res = await this.client.post<WebPushSubscriptionData>('/v2/web_push_subscription/create', webPushSubscription)
            if (res.data) localStorage.setItem('subscription_id', webPushSubscription.subscription_id)
            return { data: res.data, error: null }
        } catch (e) {
            console.log(e)
            return { data: null, error: String(e) }
        }
    }

    public async unsubscribe(): Promise<Result<IsSuccess>> {
        try {
            const subscription = await this.fetchSubscription()
            if (!subscription.data) return { data: null, error: 'No Subscription' }
            const subscription_id = localStorage.getItem('subscription_id')

            if (!subscription_id) return { data: null, error: 'No Subscription ID' }
            const savedSubscription = await this.client.get<WebPushSubscriptionData>(`/v2/web_push_subscription/${subscription_id}`)

            if (!savedSubscription.data) return { data: null, error: 'No Saved Subscription' }
            const res = await this.client.post<WebPushSubscriptionData>('/v2/web_push_subscription/delete', savedSubscription.data)

            if (res.data) localStorage.removeItem('subscription_id')
            await subscription.data.unsubscribe()
            return { data: res.data, error: null }
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