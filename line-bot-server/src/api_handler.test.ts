import LINEMessagingAPIHandler, { FixedAmount } from "./api_handler"
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })


test('fetch FixedAmount', async () => {
    const WORKER_RS_BACKEND_API_HOST = process.env.WORKER_RS_BACKEND_API_HOST as string
    const LINE_BOT_CHANNEL_ACCESS_TOKEN = process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN as string
    const DATABASE_ENVIRONMENT = process.env.DATABASE_ENVIRONMENT as string

    const handler = new LINEMessagingAPIHandler({
        WORKER_RS_BACKEND_API_HOST,
        LINE_BOT_CHANNEL_ACCESS_TOKEN,
        DATABASE_ENVIRONMENT
    })
    const fixedAmount = await handler._getAPIHandler<FixedAmount>(`${WORKER_RS_BACKEND_API_HOST}/household/fixed_amount/${handler.currentYear}/${handler.currentMonth}`)

    console.log(fixedAmount)
    expect(fixedAmount).toMatchObject<FixedAmount>({
        billing_amount: expect.any(Number),
        total_amount: expect.any(Number)
    })
})