'use client';

import { useState } from 'react';
import QueryForm from '@/components/QueryForm';
import ResultsTable from '@/components/ResultsTable';
import { BacklinksResult } from '@/lib/types';

export default function Home() {
  const [result, setResult] = useState<BacklinksResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async (domain: string, apiKey: string): Promise<BacklinksResult> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, capsolverApiKey: apiKey }),
      });

      const data: BacklinksResult = await response.json();
      setResult(data);
      return data;
    } catch (error) {
      console.error('Query failed:', error);
      alert('查询失败，请重试');
      return {
        success: false,
        domain,
        backlinks: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="flex min-h-screen w-full flex-col items-center justify-start py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            BestLinks 网页版
          </h1>
          <p className="text-lg text-gray-600">
            使用 Ahrefs 反向链接批量获取工具
          </p>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-4xl">
          {/* Query Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">查询外链</h2>
            <QueryForm onSubmit={handleQuery} isLoading={isLoading} />
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              {result.success ? (
                <ResultsTable
                  backlinks={result.backlinks}
                  domain={result.domain}
                  isLoading={isLoading}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-red-600 text-lg">{result.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600 text-sm">
          <p>
            每次查询都会消耗 CapSolver 余额。请确保账户有足够额度。{' '}
            <a
              href="https://www.capsolver.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Cloudflare Turnstile 价格: $1.2/1000 requests
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
