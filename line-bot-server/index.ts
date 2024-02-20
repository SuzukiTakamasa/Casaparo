
const LINE_MESSAGING_API_HOST = "https://api.line.me/v2/bot/message/broadcast"

interface Env {
    LINE_BOT_ACCESS_TOKEN: string
    WORKER_RS_BACKEND_API_HOST: string
}

interface FixedAmount {
    billing_amount: number
    total_amount: number
}

const getAPIHandler = async <T>(url: string, params?: string, headers?: object): Promise<T> => {
    if (params) url += params
    try {
        const response = await fetch(url, {
            method: 'GET'
        })
        return response.json()
    } catch (e) {
        throw new Error(`Failed to get: ${e}`)
    }
}

const postAPIHandler = async <T>(url: string, data: object, headers: {[key: string]: string}): Promise<T> => {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        })
        return await res.json()
    } catch(e) {
        throw new Error(`Failed to post: ${e}`)
    }
}

const broadcastFixedHousehold = async (env: Env) => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const responseFixedHousehold = await getAPIHandler<FixedAmount>(`${env.WORKER_RS_BACKEND_API_HOST}/household/fixed_amount/${currentYear}/${currentMonth}`)
}