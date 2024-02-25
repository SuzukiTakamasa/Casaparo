import { app, scheduled } from './webhook_handler'
import { Env } from "./api_handler"

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
      if (request.url.endsWith('/reply_message')) {
        return app.fetch(request)
      } else if (request.method === 'POST' && request.headers.has('x-cron-job-trigger')) {
        return await scheduled(request, env, ctx)
      } else {
        throw new Error('Unexpected request was received')
      }
    }
  };
  