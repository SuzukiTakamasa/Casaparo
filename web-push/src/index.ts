
import { sendNotification, WebPushError } from 'web-push'
import APIHandler from './api_handler'

export interface Env {
	VAPID_PUBLIC_KEY: string
	VAPID_PRIVATE_KEY: string
	WORKER_RS_BACKEND_API_HOST: string
	MAIL_TO_EMAIL_ADDRESS: string
}

export interface WebPushSubscription {
	id?: number
	subscription_id: string,
	endpoint: string,
	p256h_key: string,
	auth_key: string,
	metadata: string,
	is_active: boolean,
	updated_at: string,
	version: number
}

export interface BroadcastPayload {
	title: string
	body: string
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const api_handler = new APIHandler(env)
		
		if (request.method === 'POST' && new URL(request.url).pathname === '/subscribe') {
			const subscription: WebPushSubscription = await request.json()
			const result = await api_handler.subscribe(subscription)
			if (result.error !== null) return new Response('internal server error', { status: 500 })
			return new Response('ok', { status: 200 })

		} else if (request.method === 'POST' && new URL(request.url).pathname === '/unsubscribe') {
			const subscription: WebPushSubscription = await request.json()
			const result = await api_handler.unsubscribe(subscription)
			if (result.error !== null) return new Response('internal server error', { status: 500 })
				return new Response('ok', { status: 200 })

		} else if (request.method === 'POST' && new URL(request.url).pathname === '/broadcast') {
			const payload = await request.json()
			const subscriptions = await api_handler.getSubscriptions()
			if (subscriptions.error !== null) return new Response('internal server error', { status: 500 })
			await Promise.all(subscriptions.data!.map(async (s) => {
				try {
					await sendNotification(
						{
							endpoint: s.endpoint,
							keys: {
								p256dh: s.p256h_key,
								auth: s.auth_key
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
