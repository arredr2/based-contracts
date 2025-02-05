import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

// Helper function to get the path from the request URL
function getPathFromURL(url: string): string {
  const parsedUrl = new URL(url);
  const path = parsedUrl.pathname.replace('/api/cdp/', '');
  return path;
}

export async function GET(request: NextRequest) {
  try {
    const path = getPathFromURL(request.url);
    const response = await proxyRequest(request, path);
    return response;
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const path = getPathFromURL(request.url);
    const response = await proxyRequest(request, path);
    return response;
  } catch (error) {
    return handleError(error);
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CDP-KEY-NAME, X-CDP-KEY-PRIVATE',
    },
  });
}

async function proxyRequest(request: NextRequest, path: string) {
  const body = request.method === 'GET' ? undefined : await request.json();
  
  const response = await fetch(`https://api.cdp.coinbase.com/${path}`, {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      'X-CDP-KEY-NAME': process.env.NEXT_PUBLIC_CDP_API_KEY_NAME || '',
      'X-CDP-KEY-PRIVATE': process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY || '',
      // Forward other necessary headers
      'Origin': request.headers.get('origin') || '',
      'Referer': request.headers.get('referer') || '',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  
  return new NextResponse(JSON.stringify(data), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CDP-KEY-NAME, X-CDP-KEY-PRIVATE',
    },
  });
}

function handleError(error: unknown) {
  console.error('CDP API Error:', error);
  return new NextResponse(
    JSON.stringify({ 
      error: 'Failed to fetch from CDP API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CDP-KEY-NAME, X-CDP-KEY-PRIVATE',
      },
    }
  );
}
