import LINEMessagingAPIHandler, { Env } from "./api_handler"

export default {
  async scheduled(event: any, env: Env, ctx: ExecutionContext) {
    const apiHandler = new LINEMessagingAPIHandler(env)
    switch (event.cron) {
        case "0 0 24 * *":
            await apiHandler.remindFixedHousehold()
            break
        case "0 0 25 * *":
            await apiHandler.broadcastFixedHousehold()
            break
    }
  }
}