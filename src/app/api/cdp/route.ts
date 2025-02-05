import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new NextResponse(JSON.stringify({ message: 'GET not supported' }), {
    status: 405,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://api.cdp.coinbase.com/v1/wallets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CDP-KEY-NAME': process.env.NEXT_PUBLIC_CDP_API_KEY_NAME || '',
        'X-CDP-KEY-PRIVATE': process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('CDP API Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch from CDP API' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
