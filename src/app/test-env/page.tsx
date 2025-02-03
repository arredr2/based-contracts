'use client';

export default function TestEnv() {
  return (
    <div>
      <h1>Environment Variables Test</h1>
      <pre>
        CDP_API_KEY_NAME: {process.env.NEXT_PUBLIC_CDP_API_KEY_NAME || 'not set'}
        <br />
        CDP_API_PRIVATE_KEY: {process.env.NEXT_PUBLIC_CDP_API_PRIVATE_KEY ? 'set' : 'not set'}
      </pre>
    </div>
  );
}
