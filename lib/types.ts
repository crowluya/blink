// CapSolver 相关类型
export interface CapSolverRequest {
  clientKey: string;
  task: {
    type: string;
    websiteURL: string;
    websiteKey: string;
    [key: string]: any;
  };
}

export interface CapSolverResponse {
  errorId: number;
  errorCode: string;
  errorDescription: string;
  taskId: number;
  status: string;
}

export interface CapSolverResult {
  errorId: number;
  errorCode: string;
  errorDescription: string;
  solution?: {
    gRecaptchaResponse?: string;
    [key: string]: any;
  };
  status: string;
}

// 外链数据类型
export interface Backlink {
  id: string;
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  domainRating?: number;
  urlRating?: number;
  trafficValue?: number;
  type?: string;
  firstSeen?: string;
  lastSeen?: string;
}

export interface BacklinksQuery {
  domain: string;
  capsolverApiKey: string;
  limit?: number;
}

export interface BacklinksResult {
  success: boolean;
  domain: string;
  backlinks: Backlink[];
  total: number;
  error?: string;
}

// MCP 工具相关
export interface MCPToolResponse {
  success: boolean;
  data?: any;
  error?: string;
}
