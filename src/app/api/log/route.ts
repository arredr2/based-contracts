// src/app/api/log/route.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json();

    // In production, you would send this to your logging service
    // Example with different logging services:
    
    if (process.env.DATADOG_API_KEY) {
      // Send to Datadog
      await fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': process.env.DATADOG_API_KEY
        },
        body: JSON.stringify(logEntry)
      });
    }

    if (process.env.NEWRELIC_LICENSE_KEY) {
      // Send to New Relic
      await fetch('https://log-api.newrelic.com/log/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': process.env.NEWRELIC_LICENSE_KEY
        },
        body: JSON.stringify(logEntry)
      });
    }

    // Always log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Log entry:', logEntry);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logging error:', error);
    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 }
    );
  }
}
