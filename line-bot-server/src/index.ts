import LINEMessagingAPIHandler, { Env } from "./api_handler"


const scheduled = async(event: any, env: Env) => {
    const apiHandler = new LINEMessagingAPIHandler(env)
    switch (event.cron) {
        case "0 0 19 * *":
            await apiHandler.remindFixedHousehold()
            break
        case "0 0 20 * *":
            await apiHandler.broadcastFixedHousehold()
            break
        case "0 0 1 * *":
            await apiHandler.completeHouseHold()
            break
    }
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request: Request) {
    return new Response('Cron job is executed...', {
      headers: { 'content-type': 'text/plain' },
    })
  }
  
  export default {
    fetch: handleRequest,
    scheduled
  }