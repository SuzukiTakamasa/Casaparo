/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	CASAPARO: R2Bucket
	CASAPARO_DEV: R2Bucket
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.url.endsWith('/upload') && request.method === 'POST') {
			const dbEnv = request.headers.get('Environment') === 'DB_DEV' ? env.CASAPARO_DEV : env.CASAPARO
			try {
				const body = await request.arrayBuffer()
				const fileName = `image-${Date.now()}.png`
				await dbEnv.put(fileName, body)
				return new Response(JSON.stringify('Upload success'), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			} catch (e) {
				return new Response(JSON.stringify({ error: e }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				})
			}
		}
		return new Response('Not Found', { status: 404 })
	},
};
