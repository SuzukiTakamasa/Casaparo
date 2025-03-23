
import { Env, WebPushSubscription } from './index'

interface Result<T> {
    data: T | null,
    error: string | null
}

export default class APIHandler {
    private readonly host: string
    private readonly service: Fetcher
    private readonly headers: {[key: string]: string}

    constructor({WORKER_RS, WORKER_RS_BACKEND_API_HOST}: Env, origin: string) {
        this.service = WORKER_RS
        this.host = WORKER_RS_BACKEND_API_HOST
        this.headers = {
            "Content-Type": "application/json",
            "Origin": origin
        } as const
    }

    public async getSubscriptions(): Promise<Result<WebPushSubscription[]>> {
        try {
            const res = await this.service.fetch(this.host + '/v2/web_push_subscription', {
                method: 'GET',
                headers: this.headers
            })
            const jsonRes = await res.json()
            return { data: <WebPushSubscription[]>jsonRes, error: null }
        } catch (e) {
            return { data: null, error: String(e) }
        }
    }
}