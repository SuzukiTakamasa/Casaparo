
export interface Env {
    LINE_BOT_CHANNEL_ACCESS_TOKEN: string
    WORKER_RS_BACKEND_API_HOST: string
    WORKER_RS: Fetcher
}

export interface FixedAmount {
    billing_amount: number
    total_amount: number
}

interface Result<T> {
    data: T | null,
    error: string | null
}

export class WorkerRsAPIHandler {
    private readonly host: string
    private readonly headers: {[key: string]: string}

    constructor(env: Env) {
        this.host = env.WORKER_RS_BACKEND_API_HOST
        this.headers = {
            "Content-Type": "application/json",
        } as const
    }

    public async get<T>(params: string): Promise<Result<T>> {
        try {
            const response = await fetch(this.host + params, {
                method: 'GET',
                headers: this.headers
            })
            const jsonRes = response.json()
            return { data: <T>jsonRes, error: null }
        } catch (e) {
            return { data: null, error: String(e) }
        }
    }

    public async post<T>(endpoint: string, data: T): Promise<Result<T>> {
        try {
            const response = await fetch(this.host + endpoint, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            })
            const jsonRes = response.json()
            return { data: <T>jsonRes, error: null }
        } catch(e) {
            return  { data: null, error: String(e)}
        }
    }
}

export default class LINEMessagingAPIHandler {
    private host: string
    private readonly accessToken: string
    private readonly headers: {[key: string]: string}

    constructor(env: Env) {
        this.host = "https://api.line.me/v2/bot/message"
        this.accessToken = env.LINE_BOT_CHANNEL_ACCESS_TOKEN
        this.headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.accessToken}`
        } as const
    }

    public async callback<T>(url: string, endpoint: string, data: T): Promise<Result<T>> {
        try {
            const response = await fetch(url + endpoint, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            })
            const jsonRes = response.json()
            return { data: <T>jsonRes, error: null }
        } catch(e) {
            return  { data: null, error: String(e)}
        }
    }

    public async broadcastFixedHousehold(wsHandler: WorkerRsAPIHandler) { 
        const currentYear = new Date().getFullYear()
        const currentMonth = new Date().getMonth() + 1
        const responseFixedHousehold = await wsHandler.get<FixedAmount>(`/household/fixed_amount/${currentYear}/${currentMonth}`)
        
        const msgText = responseFixedHousehold.error != null ?
            `エラーが発生しました。${responseFixedHousehold.error}`:
            `【今月の生活費のお知らせ 】\n 負担分： ${responseFixedHousehold.data!.billing_amount}\n生活費合計: ${responseFixedHousehold.data!.total_amount}\n(※清算が終わったら家計簿を確定してください。)`
        const requestBody = {
            messages: [
                {
                    "type": "text",
                    "text": msgText
                }
            ]
        }
       await this.callback<any>(this.host, "/broadcast", requestBody)
    }

    public async remindFixedHousehold() {
      const requestBody = {
        messages: [
          {
            "type": "text",
            "text": "【リマインド】\n今月の生活費の入力期限が明日に迫ってます。まだ入力していないものがある場合は本日中に入力してください。"
          }
        ]
      }
      await this.callback<any>(this.host, "/broadcast", requestBody)
    }
}