
import { PushSubscription } from 'web-push'
import { Env, WebPushSubscription } from './index'

interface Result<T> {
    data: T | null,
    error: string | null
}

export default class APIHandler {
    private readonly host: string
    private readonly headers: {[key: string]: string}

    constructor({WORKER_RS_BACKEND_API_HOST}: Env) {
        this.host = WORKER_RS_BACKEND_API_HOST as string
        this.headers = {
            'Content-Type': 'application/json'
        } as const
    }

    public async getSubscriptions(): Promise<Result<WebPushSubscription[]>> {
        try {
            const res = await fetch(this.host + '/v2/web_push_subscription', {
                method: 'GET',
                headers: this.headers
            })
            const jsonRes = await res.json()
            return { data: <WebPushSubscription[]>jsonRes, error: null }
        } catch (e) {
            return { data: null, error: String(e) }
        }
    }

    public async subscribe(body: PushSubscription): Promise<Result<PushSubscription>> {
        try {
            const res = await fetch(this.host + '/v2/web_push_subscription/create', {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(body)
            })
            const jsonRes = await res.json()
            return { data: <PushSubscription>jsonRes, error: null }
        } catch(e) {
            return { data: null, error: String(e) }
        }
    }

    public async unsubscribe(body: PushSubscription): Promise<Result<PushSubscription>> {
        try {
            const res = await fetch(this.host + '/v2/web_push_subscription/delete', {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(body)
            })
            const jsonRes = await res.json()
            return { data: <PushSubscription>jsonRes, error: null }
        } catch(e) {
            return { data: null, error: String(e) }
        }
    }
}