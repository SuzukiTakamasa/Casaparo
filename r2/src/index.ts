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
	CASAPARO?: R2Bucket
	CASAPARO_DEV?: R2Bucket
	R2_WORKER_HOST: string
}

interface DeleteRequestBody {
	file_name: string
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Max-Age': '86400',
		} as const

		if (request.method === 'OPTIONS') {
			return new Response(null,
				{ headers: corsHeaders })
		}

		const bucketName = env.CASAPARO_DEV ? env.CASAPARO_DEV : env.CASAPARO
		if (!bucketName) return new Response('Bucket not found', { status: 500 })

		if (request.url.endsWith('/upload') && request.method === 'POST') {
			try {
				const body = await request.arrayBuffer()
				const fileName = `image-${Date.now()}.png`
				await bucketName.put(fileName, body)
				return new Response(JSON.stringify({image_url: `${env.R2_WORKER_HOST}/${fileName}`}), {
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					},
				})
			} catch (e) {
				return new Response(JSON.stringify({ error: e }), {
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					},
				})
			}
		} else if (request.url.endsWith('/delete') && request.method === 'POST') {
			try {
				const body = await request.json()
 				const { file_name } = body as DeleteRequestBody
				await bucketName.delete(file_name)
				return new Response(JSON.stringify({image_url: `${env.R2_WORKER_HOST}/${file_name}`}), {
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					},
				})
			} catch (e) {
				return new Response(JSON.stringify({ error: e }), {
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					},
				})
			}
		} else {
			const objKey = new URL(request.url).pathname.slice(1)
			const imageObj = await bucketName.get(objKey)
			if (!imageObj) {
				return new Response(`Not found: ${imageObj}; key name: ${objKey}`, { status: 404 })
			}
			const imageBody = await imageObj.arrayBuffer()
			return new Response(imageBody, {
				headers: {
					'Content-Type': imageObj.httpMetadata?.contentType || 'image/png',
					'Cache-Control': 'public, max-age=86400'
				}
			})
		}
	},
};
