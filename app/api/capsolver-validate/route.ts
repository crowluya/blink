import { NextRequest, NextResponse } from 'next/server';
import { CapSolverClient } from '@/lib/capsolver';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 400 }
      );
    }

    const client = new CapSolverClient(apiKey);
    const isValid = await client.validateApiKey();

    if (isValid) {
      return NextResponse.json({
        valid: true,
        message: 'API key is valid',
      });
    } else {
      return NextResponse.json(
        {
          valid: false,
          message: 'Invalid API key',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('CapSolver validation error:', error);

    return NextResponse.json(
      {
        valid: false,
        error:
          error instanceof Error ? error.message : 'Validation failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
