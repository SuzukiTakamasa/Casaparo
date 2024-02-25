import LINEMessagingAPIHandler, { Env } from "../api_handler"

export default {
    async scheduled(event: any, env: Env, _: ExecutionContext) {
        const apiHandler = new LINEMessagingAPIHandler(env)
        switch (event.cron) {
            case "0 0 19 * *":
                await apiHandler.remindFixedHousehold()
                break
            case "0 0 20 * *":
                await apiHandler.broadcastFixedHousehold()
                break
        }
    }
}