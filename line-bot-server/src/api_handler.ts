
export interface Env {
    LINE_BOT_CHANNEL_ACCESS_TOKEN: string
    WORKER_RS_BACKEND_API_HOST: string
    DATABASE_ENVIRONMENT: string
}

export interface FixedAmount {
    billing_amount: number
    total_amount: number
}

interface Result<T> {
    data: T | null,
    error: string | null
}

export default class LINEMessagingAPIHandler {
    private readonly lineBotHost: string
    private readonly backendHost: string
    private readonly accessToken: string
    private readonly lineBotHeaders: {[key: string]: string}
    private readonly backendHeaders: {[key: string]: string}
    public currentYear: number
    public currentMonth: number

    constructor({WORKER_RS_BACKEND_API_HOST, LINE_BOT_CHANNEL_ACCESS_TOKEN, DATABASE_ENVIRONMENT}: Env) {
        this.lineBotHost = "https://api.line.me/v2/bot/message"
        this.backendHost = WORKER_RS_BACKEND_API_HOST
        this.accessToken = LINE_BOT_CHANNEL_ACCESS_TOKEN
        this.lineBotHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.accessToken}`
        }
        this.backendHeaders = {
            "Content-Type": "application/json",
            "Environment": DATABASE_ENVIRONMENT
        }
        this.currentYear = new Date().getFullYear()
        this.currentMonth = new Date().getMonth() + 1
    }

    public async _getAPIHandler<T>(url: string, params?: string): Promise<Result<T>> {
        if (params) url += params
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.backendHeaders
            })
            const jsonRes = response.json()
            return { data: <T>jsonRes, error: null }
        } catch (e) {
            return { data: null, error: String(e) }
        }
    }

    public async _postAPIHandler<T>(url: string, endpoint: string, data: object): Promise<Result<T>> {
        try {
            const response = await fetch(url + endpoint, {
                method: 'POST',
                headers: url === this.lineBotHost ? this.lineBotHeaders : this.backendHeaders,
                body: JSON.stringify(data)
            })
            const jsonRes = response.json()
            return { data: <T>jsonRes, error: null }
        } catch(e) {
            return  { data: null, error: String(e)}
        }
    }

    public async broadcastFixedHousehold() { 
        const responseFixedHousehold = await this._getAPIHandler<FixedAmount>(`${this.backendHost}/household/fixed_amount/${this.currentYear}/${this.currentMonth}`)
        const requestBody = responseFixedHousehold.error != null ? {
            messages: [
              {
                "type": "text",
                "text": `【今月の生活費のお知らせ 】\n 負担分： ${responseFixedHousehold.data!.billing_amount}\n生活費合計: ${responseFixedHousehold.data!.total_amount}\n(※清算が終わったら家計簿を確定してください。)`
              }
            ]
        }
        :
        {
            messages: [
                {
                    "type": "text",
                    "text": `エラーが発生しました。${responseFixedHousehold.error}`
                }
            ]
        }
       await this._postAPIHandler<any>(this.lineBotHost, "/broadcast", requestBody)
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
      await this._postAPIHandler<any>(this.lineBotHost, "/broadcast", requestBody)
    }
}