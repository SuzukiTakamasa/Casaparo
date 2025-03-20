import LINEMessagingAPIHandler, { Env, WorkerRsAPIHandler } from "./api_handler"

export default {
  async scheduled(event: any, env: Env, _: ExecutionContext) {
    const origin = new URL(event.url).origin
    const wsHandler = new WorkerRsAPIHandler(env, origin)
    const lbHandler = new LINEMessagingAPIHandler(env)
    switch (event.cron) {
        case "0 0 24 * *":
            await lbHandler.remindFixedHousehold()
            break
        case "0 0 25 * *":
            await lbHandler.broadcastFixedHousehold(wsHandler)
            break
    }
  }
}