import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { formatEther } from 'viem';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' }, 
      { status: 400 }
    );
  }

  try {
    // Create a public client for Base Sepolia
    const client = createPublicClient({
      chain: base,
      transport: http(process.env.BASE_SEPOLIA_RPC_URL)
    });

    // Fetch balance
    const balanceWei = await client.getBalance({ 
      address: address as `0x${string}` 
    });

    return NextResponse.json({
      balance: formatEther(balanceWei),
      raw: balanceWei.toString()
    });
  } catch (error) {
    console.error('Balance retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve balance' }, 
      { status: 500 }
    );
  }
}
