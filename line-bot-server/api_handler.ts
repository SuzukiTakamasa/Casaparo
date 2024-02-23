import {
  MessageAPIResponseBase,
  TextMessage,
  WebhookEvent
} from "@line/bot-sdk"

interface Env {
    LINE_BOT_CHANNEL_ACCESS_TOKEN: string
    WORKER_RS_BACKEND_API_HOST: string
    DATABASE_ENVIRONMENT: string
}

interface FixedAmount {
    billing_amount: number
    total_amount: number
}

interface CompletedHouseholds {
  year: number,
  month: number
}

interface IsCompleted {
  is_completed: number
}

export default class LINEMessagingAPIHandler {
    private lineBotHost: string
    private backendHost: string
    private accessToken: string
    private lineBotHeaders: {[key: string]: string}
    private backendHeaders: {[key: string]: string}
    private currentYear: number
    private currentMonth: number

    constructor(env: Env) {
        this.lineBotHost = "https://api.line.me/v2/bot/message"
        this.backendHost = env.WORKER_RS_BACKEND_API_HOST
        this.accessToken = env.LINE_BOT_CHANNEL_ACCESS_TOKEN
        this.lineBotHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bear ${this.accessToken}`
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
            return <T>response.json()
        } catch (e) {
            throw new Error(`Failed to get: ${e}`)
        }
    }

    public async _postAPIHandler<T>(url: string, endpoint: string, data: object): Promise<T> {
        try {
            const response = await fetch(url + endpoint, {
                method: 'POST',
                headers: url === this.lineBotHost ? this.lineBotHeaders : this.backendHeaders,
                body: JSON.stringify(data)
            })
            return await <T>response.json()
        } catch(e) {
            throw new Error(`Failed to post: ${e}`)
        }
    }

    public async broadcastFixedHousehold() { 
        const responseFixedHousehold = await this._getAPIHandler<FixedAmount>(`${this.backendHost}/household/fixed_amount/${this.currentYear}/${this.currentMonth}`)
        const requestBody = {
            messages: [
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
        await this._postAPIHandler<any>(this.lineBotHost, "/broadcast", requestBody)
    }

    public async remindFixedHousehold() {
      const requestBody = {
        messages: [
          {
            "type": "text",
            "text": "【リマインド】\n今月の生活費の入力期限が明日に迫っていますので、まだ入力していないものがある場合は本日中に入力お願いします。"
          }
        ]
      }
      await this._postAPIHandler<any>(this.lineBotHost, "/broadcast", requestBody)
    }

    public async replyFixedHousehold(context: any) {
      const data = await context.req.json()
      const events = data.events

      await Promise.all(
        events.map(async (event: any) => {
          if (event.type !== "message") return
          const { replyToken } = event

          let message = ""
          if (event.message.type === "text") {
            const { text } = event.message
            message = text
          }

          let response = ""

          if (message === "支払い完了") {
            const is_completed = await this._getAPIHandler<IsCompleted>(`${this.backendHost}/completed_household/${this.currentYear}/${this.currentMonth}`)
            if (is_completed.is_completed === 1) {
              response += "今月分の支払いは既に完了しています。"
              return
            }
            const completed_household: CompletedHouseholds = {
              year: this.currentYear,
              month: this.currentMonth
            }
            await this._postAPIHandler<any>(this.backendHost, "/completed_household/create", completed_household)
            response += "来月もよろしくな！！"
          } else {
            const responseArr = [
              "⚪️< まんまるまる！",
              "🦀< かにまろ！",
              "🦵🦵< あんよくわがた！",
              "💥< うにまろ！",
              "🛏️< ねんねマン！",
              "🛀< オフロンタロス",
              "🗡️< あたたまろ〜",
              "🧊< ひんやりまろ！",
            ]
            const randomIndex = Math.floor(Math.random() * responseArr.length)
            response += responseArr[randomIndex]
          }
          await this._postAPIHandler(this.lineBotHost, "/reply", {
            replyToken: replyToken,
            messages: [
              {
                type: "text",
                response
              }
            ]
          })
        })
      )
    }
}