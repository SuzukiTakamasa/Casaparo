import { APIRequest, APIResponse, R2Response, Result, JSONResponse, WebPushSubscriptionData, BroadcastPayload, BroadcastData, BroadcastResult } from './interfaces'
import { urlBase64ToUint8Array } from '@/app/_utils/utility_function'
import * as dotenv from 'dotenv'
dotenv.config()
import { v4 as uuidv4 } from 'uuid'

const SUBSCRIPTION_ID_STORAGE_KEY = 'subscription_id'


export const execExternalGetAPI = async<T>(url: string, getParams?: string): Promise<Result<T>> => {
    if (getParams) url += getParams
    try {
        const res = await fetch(url, {method: 'GET'})
        const jsonRes = await res.json()
    return { data: <T>jsonRes, error: null }
    } catch(e) {
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
            const jsonResponse: JSONResponse<T> = await res.json()
            if (jsonResponse.status >= 400) {
                return { data: null, error: jsonResponse.message }
            }
            return { data: jsonResponse.data, error: null}
        } catch (e) {
            return { data: null, error: String(e) }
        }
    }
    // `R` defaults to the request type because most endpoints echo it back, but
    // it can be widened for the ones that answer with a different shape.
    public async post<T extends APIRequest, R extends APIRequest | APIResponse = T>(endpoint: string, data: T): Promise<Result<R>> {
        try {
            const res = await fetch(this.host + endpoint, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            })
            const jsonResponse: JSONResponse<R> = await res.json()
            if (jsonResponse.status >= 400) {
                return { data: null, error: jsonResponse.message }
            }
            return { data: jsonResponse.data, error: null }
        } catch (e) {
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
    private readonly client: APIClient

    constructor(apiClient: APIClient) {
        this.client = apiClient
    }
    // Built lazily: `urlBase64ToUint8Array` needs `window`, so building this in
    // the constructor would yield an empty key during the static export render.
    private buildSubscribeOptions(): PushSubscriptionOptions {
        return {
            userVisibleOnly: true,
            applicationServerKey: new Uint8Array(urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)).buffer
        }
    }
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer)
        return btoa(String.fromCharCode.apply(null, Array.from(bytes)))
    }
    public isSupported(): boolean {
        return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
    }
    public async fetchSubscription(): Promise<Result<PushSubscription>> {
        if (!this.isSupported()) return { data: null, error: 'Push notifications are not supported' }
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

    public async subscribe(): Promise<Result<WebPushSubscriptionData>> {
        if (!this.isSupported()) return { data: null, error: 'Push notifications are not supported' }
        try {
            // Chrome throws from subscribe() when permission is denied, so ask
            // for it up front and report the refusal as a plain error instead.
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                return { data: null, error: `Notification permission was ${permission}` }
            }

            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.subscribe(this.buildSubscribeOptions())
            const webPushSubscription: WebPushSubscriptionData = {
                subscription_id: uuidv4(),
                endpoint: subscription.endpoint,
                p256h_key: this.arrayBufferToBase64(subscription.getKey('p256dh') as ArrayBuffer),
                auth_key: this.arrayBufferToBase64(subscription.getKey('auth') as ArrayBuffer),
                version: 0
            }
            // `create` answers 201 with an empty body, so success is `error === null`.
            const res = await this.client.post<WebPushSubscriptionData>('/v2/web_push_subscription/create', webPushSubscription)
            if (res.error !== null) return { data: null, error: res.error }

            localStorage.setItem(SUBSCRIPTION_ID_STORAGE_KEY, webPushSubscription.subscription_id)
            return { data: webPushSubscription, error: null }
        } catch (e) {
            console.log(e)
            return { data: null, error: String(e) }
        }
    }

    public async unsubscribe(): Promise<Result<WebPushSubscriptionData>> {
        if (!this.isSupported()) return { data: null, error: 'Push notifications are not supported' }
        try {
            const subscription = await this.fetchSubscription()
            const subscriptionId = localStorage.getItem(SUBSCRIPTION_ID_STORAGE_KEY)

            // Revoke in the browser first so the toggle always takes effect. A
            // row left behind is dropped on the next broadcast, when the push
            // service reports the endpoint as gone.
            if (subscription.data) await subscription.data.unsubscribe()
            localStorage.removeItem(SUBSCRIPTION_ID_STORAGE_KEY)

            if (!subscriptionId) return { data: null, error: null }
            const savedSubscription = await this.client.get<WebPushSubscriptionData>(`/v2/web_push_subscription/${subscriptionId}`)
            if (savedSubscription.error !== null || !savedSubscription.data) return { data: null, error: null }

            const res = await this.client.post<WebPushSubscriptionData>('/v2/web_push_subscription/delete', savedSubscription.data)
            return { data: savedSubscription.data, error: res.error }
        } catch (e) {
            console.log(e)
            return { data: null, error: String(e) }
        }
    }

    public async broadcast(payload: BroadcastPayload): Promise<Result<BroadcastResult>> {
        try {
            return await this.client.post<BroadcastData, BroadcastResult>('/v2/web_push_subscription/broadcast', { payload })
        } catch (e) {
            console.log(e)
            return { data: null, error: String(e) }
        }
    }
}