import webpush from 'web-push';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APIClient } from '@/app/utils/api_client';
import { BroadcastRequest } from '@/app/utils/interfaces';

export const dynamic = 'force-dynamic'

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400',
  }

const client = new APIClient()

export async function POST(request: NextRequest) {

  try {
    const requestBody: BroadcastRequest = await request.json()
    if (!requestBody) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
      const result = await Promise.allSettled(requestBody.subscriptions!.map(async (s) => {
        webpush.setVapidDetails(
          `mailto:${process.env.NEXT_PUBLIC_MAIL_TO_EMAIL_ADDRESS}`,
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
        )
        const sendResult = await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: {
              p256dh: s.p256h_key,
              auth: s.auth_key
            }
          },
          JSON.stringify(requestBody.payload),
          {
            contentEncoding: 'aes128gcm'
          }
        )
        return { body: sendResult.body, statusCode: sendResult.statusCode }
      }))
  
      return NextResponse.json({ data: result, error: null }, { 
        status: 200,
        headers 
      })
    } catch (error) {
      console.error('Error sending notification:', error)
      return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 })
    }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: headers
  })
}