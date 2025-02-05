import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, projectDetails, clientAddress } = body;

    // Generate unique invitation ID
    const inviteId = crypto.randomBytes(16).toString('hex');
    
    // Create base64 encoded project context
    const context = Buffer.from(JSON.stringify({
      projectDetails,
      clientAddress,
      timestamp: Date.now()
    })).toString('base64');

    // Get base URL for the environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Generate invite link with context
    const inviteLink = `${baseUrl}/onboard/${inviteId}?context=${context}`;

    // In a production environment, you would:
    // 1. Store the invitation in a database
    // 2. Set up proper expiration
    // 3. Handle invitation status updates

    return NextResponse.json(
      { 
        id: inviteId, 
        inviteLink 
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Invitation creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
