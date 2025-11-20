import { Backlink, BacklinksResult } from './types';
import { CapSolverClient } from './capsolver';

/**
 * 模拟从 Ahrefs 获取外链数据
 * 在实际使用中，这应该调用真实的 Ahrefs API 或通过 CapSolver 获取
 */
export async function queryBacklinksFromAhrefs(
  domain: string,
  capsolverApiKey: string
): Promise<Backlink[]> {
  // 这是一个模拟实现
  // 实际使用中需要：
  // 1. 使用 CapSolver 解决 Ahrefs 网站的人机验证
  // 2. 调用 Ahrefs API 或爬取 Ahrefs 数据
  // 3. 解析并返回外链数据

  const client = new CapSolverClient(capsolverApiKey);

  // 验证 API 密钥
  const isValid = await client.validateApiKey();
  if (!isValid) {
    throw new Error('Invalid CapSolver API key');
  }

  // 模拟外链数据
  const mockBacklinks: Backlink[] = [
    {
      id: '1',
      sourceUrl: 'https://example.com/page1',
      sourceDomain: 'example.com',
      targetUrl: `https://${domain}/`,
      anchorText: 'Best Resource',
      domainRating: 45,
      urlRating: 32,
      trafficValue: 150,
      type: 'dofollow',
      firstSeen: '2024-01-15',
      lastSeen: '2024-11-20',
    },
    {
      id: '2',
      sourceUrl: 'https://blog.example.org/article',
      sourceDomain: 'blog.example.org',
      targetUrl: `https://${domain}/`,
      anchorText: `Learn more about ${domain}`,
      domainRating: 52,
      urlRating: 38,
      trafficValue: 280,
      type: 'dofollow',
      firstSeen: '2024-02-20',
      lastSeen: '2024-11-20',
    },
    {
      id: '3',
      sourceUrl: 'https://resource.site/directory',
      sourceDomain: 'resource.site',
      targetUrl: `https://${domain}/`,
      anchorText: domain,
      domainRating: 38,
      urlRating: 25,
      trafficValue: 95,
      type: 'nofollow',
      firstSeen: '2024-03-10',
      lastSeen: '2024-11-20',
    },
  ];

  // 根据域名过滤（实际使用中会调用真实 API）
  return mockBacklinks;
}

/**
 * 解析和格式化外链数据
 */
export function formatBacklinksData(backlinks: Backlink[]): string {
  let result = '';
  result += '外链数据汇总\n';
  result += '='.repeat(50) + '\n\n';
  result += `总外链数: ${backlinks.length}\n\n`;

  backlinks.forEach((link, index) => {
    result += `${index + 1}. ${link.sourceDomain}\n`;
    result += `   来源: ${link.sourceUrl}\n`;
    result += `   锚文本: ${link.anchorText || '(无锚文本)'}\n`;
    result += `   域名评分: ${link.domainRating || 'N/A'}\n`;
    result += `   链接类型: ${link.type || 'unknown'}\n`;
    result += `   首次见于: ${link.firstSeen}\n`;
    result += `   最后见于: ${link.lastSeen}\n\n`;
  });

  return result;
}

/**
 * 验证域名格式
 */
export function validateDomain(domain: string): boolean {
  // 简单的域名格式验证
  const domainRegex =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  return domainRegex.test(domain);
}

/**
 * 规范化域名
 */
export function normalizeDomain(domain: string): string {
  // 移除协议和路径
  let normalized = domain
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .split('/')[0];

  // 转换为小写
  normalized = normalized.toLowerCase();

  return normalized;
}
