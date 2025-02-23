
import webpush from 'web-push'
import APIHandler from './api_handler'

export interface Env {
	VAPID_PUBLIC_KEY: string
	VAPID_PROVATE_KEY: string
	WORKER_RS_BACKEND_API_HOST: string
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
			const subscription = await request.json()
		} else if (request.method === 'POST' && new URL(request.url).pathname === '/unsubscribe') {
			const subscription = await request.json()
		} else if (request.method === 'POST' && new URL(request.url).pathname === '/broadcast') {
			const payload = await request.json()
		}
		return new Response('not found', { status: 404 })
	},
}
