
import { sendNotification, PushSubscription } from 'web-push'
import APIHandler from './api_handler'

export interface Env {
	VAPID_PUBLIC_KEY: string
	VAPID_PRIVATE_KEY: string
	WORKER_RS_BACKEND_API_HOST: string
	MAIL_TO_EMAIL_ADDRESS: string
	ENVIRONMENT: string
	CORS_FRONTEND_HOST: string
}

export interface WebPushSubscription {
	id?: number
	user_id?: string,
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
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const api_handler = new APIHandler(env)

		if (request.method === 'OPTIONS') {
			const allow_origin_list = [env.CORS_FRONTEND_HOST]
			if (env.ENVIRONMENT === 'dev') allow_origin_list.push('http://localhost:3000')
			return new Response(null, {
				status: 200,
				headers: {
					'Access-Control-Allow-Origin': allow_origin_list.join(','),
					'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age': '86400'
				}
			})
		}
		
		if (request.method === 'POST' && new URL(request.url).pathname === '/subscribe') {
			const subscription: PushSubscription = await request.json()
			const webPushSubscription = {
				endpoint: subscription.endpoint,
				p256h_key: subscription.keys.p256dh,
				auth_key: subscription.keys.auth,
				version: 0
			}
			const result = await api_handler.subscribe(webPushSubscription)
			if (result.error !== null) return new Response('internal server error', { status: 500 })
			return new Response('ok', { status: 200 })

		} else if (request.method === 'POST' && new URL(request.url).pathname === '/unsubscribe') {
			const subscription: PushSubscription = await request.json()
			const webPushSubscription = {
				endpoint: subscription.endpoint,
				p256h_key: subscription.keys.p256dh,
				auth_key: subscription.keys.auth,
				version: 0
			}
			const result = await api_handler.unsubscribe(webPushSubscription)
			if (result.error !== null) return new Response('internal server error', { status: 500 })
				return new Response('ok', { status: 200 })

		} else if (request.method === 'POST' && new URL(request.url).pathname === '/broadcast') {
			const payload: BroadcastPayload = await request.json()
			const subscriptions = await api_handler.getSubscriptions()
			if (subscriptions.error !== null) return new Response('internal server error', { status: 500 })
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
					return new Response('internal server error', { status: 500})
				}
			}))
		}
		return new Response('not found', { status: 404 })
	},
}
