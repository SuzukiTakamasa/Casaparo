import { Hono } from "hono"
import LINEMessagingAPIHandler, { Env } from "../api_handler"

const app = new Hono()

app.post("/reply_message", async (ctx) => {
    const env = {
        LINE_BOT_CHANNEL_ACCESS_TOKEN: ctx.env!.LINE_BOT_CHANNEL_ACCESS_TOKEN,
        WORKER_RS_BACKEND_API_HOST: ctx.env!.WORKER_RS_BACKEND_API_HOST,
        DATABASE_ENVIRONMENT: ctx.env!.DATABASE_ENVIRONMENT
    }
    const apiHandler = new LINEMessagingAPIHandler(env as Env)
    const result = await apiHandler.replyFixedHousehold(ctx)
    return result
})

export default app