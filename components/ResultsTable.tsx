'use client';

import { Backlink } from '@/lib/types';

interface ResultsTableProps {
  backlinks: Backlink[];
  domain: string;
  isLoading?: boolean;
}

export default function ResultsTable({
  backlinks,
  domain,
  isLoading = false,
}: ResultsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">正在加载数据...</p>
        </div>
      </div>
    );
  }

  if (backlinks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">暂无数据，请先执行查询</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {domain} 的外链数据
        </h2>
        <p className="text-gray-600">
          共找到 <span className="font-semibold text-blue-600">{backlinks.length}</span> 条外链
        </p>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                #
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                源域名
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                源URL
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                锚文本
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                DR
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                类型
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                首次/最后
              </th>
            </tr>
          </thead>
          <tbody>
            {backlinks.map((link, index) => (
              <tr
                key={link.id}
                className={`border-b border-gray-100 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-blue-50 transition`}
              >
                <td className="px-4 py-3 text-gray-700 font-medium">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`https://${link.sourceDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {link.sourceDomain}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={link.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate max-w-xs"
                    title={link.sourceUrl}
                  >
                    {link.sourceUrl.split('/').pop() || link.sourceUrl}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {link.anchorText ? (
                    <span
                      className="inline-block bg-gray-100 px-2 py-1 rounded text-xs"
                      title={link.anchorText}
                    >
                      {link.anchorText.length > 30
                        ? link.anchorText.substring(0, 30) + '...'
                        : link.anchorText}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">无锚文本</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-semibold">
                  {link.domainRating ? (
                    <span
                      className={`inline-block px-2 py-1 rounded text-white text-xs font-bold ${
                        link.domainRating >= 50
                          ? 'bg-green-500'
                          : link.domainRating >= 30
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                    >
                      {link.domainRating}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      link.type === 'dofollow'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {link.type || 'unknown'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs text-gray-600">
                  <div>{link.firstSeen}</div>
                  <div className="text-gray-400">{link.lastSeen}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 统计信息 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">总外链数</p>
          <p className="text-2xl font-bold text-blue-600">{backlinks.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Dofollow</p>
          <p className="text-2xl font-bold text-green-600">
            {backlinks.filter((l) => l.type === 'dofollow').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Nofollow</p>
          <p className="text-2xl font-bold text-red-600">
            {backlinks.filter((l) => l.type === 'nofollow').length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">平均DR</p>
          <p className="text-2xl font-bold text-purple-600">
            {backlinks.length > 0
              ? Math.round(
                  backlinks.reduce((sum, l) => sum + (l.domainRating || 0), 0) /
                    backlinks.length
                )
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
