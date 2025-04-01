
import { sendNotification, PushSubscription, RequestOptions } from 'web-push'
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
	p256h_key: string,
	auth_key: string,
	version: number
}

export interface BroadcastPayload {
	title: string
	body: string
}

export default {
	async fetch(request: Request, env: Env, _: ExecutionContext): Promise<Response> {

		const origin = new URL(request.url).origin
		const api_handler = new APIHandler(env, origin)

		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Max-Age': '86400'
		}

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: headers
			})
		}
		
		if (request.method === 'POST' && request.url.endsWith('/broadcast')) {
			const payload: BroadcastPayload = await request.json()
			const subscriptions = await api_handler.getSubscriptions()
			
			if (subscriptions.error !== null) return new Response('internal server error', { status: 500, headers: headers })
			const [...result] = await Promise.all(subscriptions.data!.map(async (s) => {
				try {
					await sendNotification(
						{
							endpoint: s.endpoint,
							keys: {
								p256dh: s.p256h_key,
								auth: s.auth_key
							}
						} as PushSubscription,
						JSON.stringify(payload),
						{
							vapidDetails: {
								subject: `mailto:${env.MAIL_TO_EMAIL_ADDRESS}`,
								publicKey: env.VAPID_PUBLIC_KEY,
								privateKey: env.VAPID_PRIVATE_KEY
							}
						} as RequestOptions
					)
				} catch (e) {
					return new Response(JSON.stringify({data: null, error: e}), { status: 500, headers: headers})
				}
			}))
			return new Response(JSON.stringify({data: JSON.stringify(result), error: null}), { status: 200, headers: headers})
		}
		return new Response('not found', { status: 404 })
	},
}
