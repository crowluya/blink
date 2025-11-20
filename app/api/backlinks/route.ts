import { NextRequest, NextResponse } from 'next/server';
import {
  queryBacklinksFromAhrefs,
  validateDomain,
  normalizeDomain,
} from '@/lib/backlink-service';
import { BacklinksResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, capsolverApiKey } = body;

    // 验证必要参数
    if (!domain || !capsolverApiKey) {
      return NextResponse.json(
        { error: 'Missing required parameters: domain and capsolverApiKey' },
        { status: 400 }
      );
    }

    // 规范化和验证域名
    const normalizedDomain = normalizeDomain(domain);
    if (!validateDomain(normalizedDomain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // 查询外链
    const backlinks = await queryBacklinksFromAhrefs(
      normalizedDomain,
      capsolverApiKey
    );

    const result: BacklinksResult = {
      success: true,
      domain: normalizedDomain,
      backlinks,
      total: backlinks.length,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Backlinks API error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        backlinks: [],
        total: 0,
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
