
import { sendNotification } from 'web-push'
import APIHandler from './api_handler'

export interface Env {
	VAPID_PUBLIC_KEY: string
	VAPID_PRIVATE_KEY: string
	WORKER_RS_BACKEND_API_HOST: string
	WORKER_RS: Fetcher
	MAIL_TO_EMAIL_ADDRESS: string
	ENVIRONMENT: string
	CORS_FRONTEND_HOST: string
}

export interface WebPushSubscription {
	id?: number
	endpoint: string,
	p256h_key: string | null,
	auth_key: string | null,
	version: number
}

export interface BroadcastPayload {
	title: string
	body: string
}

export default {
	async fetch(request: Request, env: Env, _: ExecutionContext): Promise<Response> {
		const api_handler = new APIHandler(env)

		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Max-Age': '86400'
		}

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: headers
			})
		}
		
		if (request.method === 'POST' && new URL(request.url).pathname === '/subscribe') {
			const webPushSubscription: WebPushSubscription = await request.json()
			const result = await api_handler.subscribe(webPushSubscription)

			if (result.error !== null) return new Response(JSON.stringify({data: null, error: result.error}), { status: 500, headers: headers })
			return new Response(JSON.stringify({data: result.data, error: null}), { status: 200, headers: headers })

		} else if (request.method === 'POST' && new URL(request.url).pathname === '/unsubscribe') {
			const webPushSubscription: WebPushSubscription = await request.json()
			const result = await api_handler.unsubscribe(webPushSubscription)

			if (result.error !== null) return new Response(JSON.stringify({data: null, error: result.error}), { status: 500, headers: headers })
				return new Response(JSON.stringify({data: result.data, error: null}), { status: 200, headers: headers })

		} else if (request.method === 'POST' && new URL(request.url).pathname === '/broadcast') {
			const payload: BroadcastPayload = await request.json()
			const subscriptions = await api_handler.getSubscriptions()
			
			if (subscriptions.error !== null) return new Response('internal server error', { status: 500, headers: headers })
			await Promise.all(subscriptions.data!.map(async (s) => {
				try {
					await sendNotification(
						{
							endpoint: s.endpoint,
							keys: {
								p256dh: s.p256h_key || '',
								auth: s.auth_key || ''
							}
						},
						JSON.stringify(payload),
						{
							vapidDetails: {
								subject: `mailto:${env.MAIL_TO_EMAIL_ADDRESS}`,
								publicKey: env.VAPID_PUBLIC_KEY,
								privateKey: env.VAPID_PRIVATE_KEY
							}
						}
					)
				} catch (e) {
					return new Response(JSON.stringify({data: null, error: e}), { status: 500, headers: headers})
				}
			}))
		}
		return new Response('not found', { status: 404 })
	},
}
