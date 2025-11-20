'use client';

import { useState } from 'react';
import { BacklinksResult } from '@/lib/types';

interface QueryFormProps {
  onSubmit: (domain: string, apiKey: string) => Promise<BacklinksResult>;
  isLoading?: boolean;
}

export default function QueryForm({
  onSubmit,
  isLoading = false,
}: QueryFormProps) {
  const [domain, setDomain] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');

  const handleValidateApiKey = async () => {
    if (!apiKey) return;

    try {
      const response = await fetch('/api/capsolver-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (data.valid) {
        setApiKeyError('');
      } else {
        setApiKeyError('Invalid API key');
      }
    } catch (error) {
      setApiKeyError('Failed to validate API key');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!domain || !apiKey) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await onSubmit(domain, apiKey);
    } catch (error) {
      console.error('Query error:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* CapSolver API Key Input */}
      <div>
        <label
          htmlFor="apiKey"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          CapSolver API 密钥
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              id="apiKey"
              type={showPassword ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setApiKeyError('');
              }}
              placeholder="输入或粘贴 CapSolver API 密钥"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                apiKeyError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? '隐藏' : '显示'}
            </button>
          </div>
          <button
            type="button"
            onClick={handleValidateApiKey}
            disabled={!apiKey || isLoading}
            className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 transition"
          >
            验证
          </button>
        </div>
        {apiKeyError && <p className="mt-1 text-sm text-red-500">{apiKeyError}</p>}
        <p className="mt-1 text-xs text-gray-500">
          <a
            href="https://www.capsolver.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            注册CapSolver账号获取API密钥
          </a>
        </p>
      </div>

      {/* Domain Input */}
      <div>
        <label
          htmlFor="domain"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          目标域名
        </label>
        <input
          id="domain"
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="例如：example.com、www.example.com、http://example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          支持多种格式：example.com、www.example.com、http://example.com 等，系统会自动处理为标准格式
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!domain || !apiKey || isLoading}
        className="w-full px-6 py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            查询中...
          </>
        ) : (
          '开始查询'
        )}
      </button>
    </form>
  );
}
