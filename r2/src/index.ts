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
	R2_BUCKET_NAME: string
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, application/octet-stream',
			'Access-Control-Max-Age': '86400',
		}
		if (request.method === 'OPTIONS') {
			return new Response(null,
				{ headers: corsHeaders })
		}
		if (request.url.endsWith('/upload') && request.method === 'POST') {
			const isDev = request.headers.get('Environment') === 'DB_DEV' 
			const bucketName = isDev ? env.CASAPARO_DEV : env.CASAPARO
			const bucketUrl = `${env.R2_BUCKET_NAME}${isDev ? 'casaparo-dev' : 'casaparo'}`
			try {
				const body = await request.arrayBuffer()
				const fileName = `image-${Date.now()}.png`
				await bucketName.put(fileName, body)
				return new Response(JSON.stringify({image_url: `${bucketUrl}/${fileName}`}), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
					...corsHeaders
				})
			} catch (e) {
				return new Response(JSON.stringify({ error: e }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' },
					...corsHeaders
				})
			}
		}
		return new Response('Not Found', { status: 404 })
	},
};
