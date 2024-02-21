
interface Env {
    LINE_BOT_CHANNEL_ACCESS_TOKEN: string
    WORKER_RS_BACKEND_API_HOST: string
    DATABASE_ENVIRONMENT: string
}

interface FixedAmount {
    billing_amount: number
    total_amount: number
}

class LINEMessagingAPIHandler {
    private lineBotHost: string
    private backendHost: string
    private lineBotHeaders: {[key: string]: string}
    private backendHeaders: {[key: string]: string}
    private currentYear: number
    private currentMonth: number

    constructor(env: Env) {
        this.lineBotHost = "https://api.line.me/v2/bot/message/broadcast"
        this.backendHost = env.WORKER_RS_BACKEND_API_HOST
        this.lineBotHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bear ${env.LINE_BOT_CHANNEL_ACCESS_TOKEN}`
        }
        this.backendHeaders = {
            "Content-Type": "application/json",
            "Environment": env.DATABASE_ENVIRONMENT
        }
        this.currentYear = new Date().getFullYear()
        this.currentMonth = new Date().getMonth() + 1
    }

    public async _getAPIHandler<T>(url: string, params?: string): Promise<T> {
        if (params) url += params
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.backendHeaders
            })
            return response.json()
        } catch (e) {
            throw new Error(`Failed to get: ${e}`)
        }
    }

    public async _postAPIHandler<T>(url: string, data: object): Promise<T> {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.lineBotHeaders,
                body: JSON.stringify(data)
            })
            return await response.json()
        } catch(e) {
            throw new Error(`Failed to post: ${e}`)
        }
    }

    public async broadcastFixedHousehold() { 
        const responseFixedHousehold = await this._getAPIHandler<FixedAmount>(`${this.backendHost}/household/fixed_amount/${this.currentYear}/${this.currentMonth}`)
        const requestBody = {
            message: [
                {
                    "type": "bubble",
                    "direction": "ltr",
                    "body": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": "【今月の生活費のお知らせ】",
                          "weight": "bold",
                          "align": "center",
                          "contents": []
                        },
                        {
                          "type": "text",
                          "text": `請求金額: ${responseFixedHousehold.total_amount}`,
                          "contents": []
                        },
                        {
                          "type": "text",
                          "text": `生活費合計: ${responseFixedHousehold.billing_amount}`,
                          "contents": []
                        }
                      ]
                    },
                    "footer": {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "button",
                          "action": {
                            "type": "message",
                            "label": "支払い完了",
                            "text": "支払い完了"
                          },
                          "color": "#201145FF",
                          "height": "sm",
                          "style": "primary",
                          "gravity": "bottom"
                        }
                      ]
                    }
                  }
            ]
        }
        await this._postAPIHandler<any>(this.lineBotHost, requestBody)
    }
}