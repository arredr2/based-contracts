import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const CDP_API_BASE_URL = 'https://api.cdp.coinbase.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

async function handleRequest(
  request: NextRequest,
  paths: string[],
  method: 'GET' | 'POST'
) {
  try {
    const apiPath = paths.join('/');
    const url = `${CDP_API_BASE_URL}/${apiPath}`;

    const headers = {
      'Content-Type': 'application/json',
      'X-CDP-KEY-NAME': process.env.NEXT_PUBLIC_CDP_API_KEY_NAME || '',
      'X-CDP-KEY-PRIVATE': process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY || '',
    };

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (method === 'POST' && request.body) {
      const body = await request.json();
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'CDP API request failed');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('CDP API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process CDP API request' },
      { status: 500 }
    );
  }
}

// Helper function for CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders() });
}
