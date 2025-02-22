/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import webpush from 'web-push'

interface Env {
	VAPID_PUBLIC_KEY: string
	VAPID_PROVATE_KEY: string
	BACKEND_HOST_NAME: string
}

interface WebPushSubscription {
	id?: number
	user_id: string,
	endpoint: string,
	p256h_key: string,
	auth_key: string,
	metadata: string,
	is_active: boolean,
	updated_at: string,
	version: number
}

interface BroadcastPayload {
	title: string
	body: string
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method === 'POST' && new URL(request.url).pathname === '/subscribe') {
			const subscription = await request.json()
		} else if (request.method === 'POST' && new URL(request.url).pathname === '/unsubscribe') {
			const subscription = await request.json()
		} else if (request.method === 'POST' && new URL(request.url).pathname === '/broadcast') {
			const payload = await request.json()
		}
		return new Response('not found', { status: 404})
	},
}
