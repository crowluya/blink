# BestLinks 项目实现说明

## 项目概述

BestLinks 是一个基于 Next.js 15 的外链批量查询工具，集成 CapSolver API 用于处理网站验证，并支持从 Ahrefs 获取反向链接数据。

## 架构设计

### 数据流程

```
用户输入
  ↓
验证 CapSolver API 密钥
  ↓
规范化和验证域名
  ↓
调用外链查询服务
  ↓
CapSolver 处理验证挑战
  ↓
获取 Ahrefs 外链数据
  ↓
解析和格式化数据
  ↓
返回结果到前端
  ↓
表格展示和统计分析
```

## 项目文件说明

### 核心库文件

#### `lib/types.ts`
定义了项目中的所有 TypeScript 类型：
- `CapSolverRequest` - CapSolver API 请求体
- `CapSolverResponse` - CapSolver API 响应体
- `Backlink` - 单条外链数据
- `BacklinksResult` - 查询结果集合

#### `lib/capsolver.ts`
CapSolver 客户端的完整实现：
- `CapSolverClient` 类封装了 API 交互
- 支持创建任务、获取结果、等待完成等功能
- 内置了 API 密钥验证方法

**主要方法**:
```typescript
createTask(taskData)          // 创建验证任务
getTaskResult(taskId)         // 获取任务结果
waitForTaskCompletion(taskId) // 轮询等待任务完成
validateApiKey()              // 验证 API 密钥
```

#### `lib/backlink-service.ts`
外链查询和数据处理服务：
- `queryBacklinksFromAhrefs()` - 查询外链数据
- `formatBacklinksData()` - 格式化数据
- `validateDomain()` - 验证域名格式
- `normalizeDomain()` - 规范化域名

### API 路由

#### `/api/backlinks` (POST)
主要的外链查询接口：
- 接收 `domain` 和 `capsolverApiKey`
- 验证参数和 API 密钥
- 调用查询服务获取外链
- 返回格式化的结果

#### `/api/capsolver-validate` (POST)
CapSolver API 密钥验证接口：
- 接收 API 密钥
- 调用 CapSolver 验证接口
- 返回验证结果

### 前端组件

#### `components/QueryForm.tsx`
查询表单组件，包含：
- CapSolver API 密钥输入框（带显示/隐藏切换）
- API 密钥验证按钮
- 目标域名输入框
- 查询提交按钮
- 加载状态指示

#### `components/ResultsTable.tsx`
结果展示组件，包含：
- 外链数据表格（包含编号、源域名、URL、锚文本、DR 等列）
- 统计信息卡片（总数、Dofollow/Nofollow 比例、平均 DR）
- 交互式功能（可点击访问源链接）

### 页面

#### `app/page.tsx`
主页面，整合了所有功能：
- 页面标题和描述
- 集成查询表单和结果展示
- 处理查询状态管理

## 技术选择说明

### 为什么选择 Next.js 15?

1. **App Router** - 更好的路由组织和数据获取方式
2. **API Routes** - 简化后端开发，与前端无缝集成
3. **Turbopack** - 更快的编译速度
4. **TypeScript 支持** - 内置类型安全
5. **生产就绪** - 内置优化和部署支持

### CapSolver 集成理由

1. **自动化验证** - 处理 Cloudflare Turnstile 等现代验证
2. **API 简单** - 支持任务队列模式，易于集成
3. **成本低廉** - 按次付费，$1.2/1000 次请求
4. **可靠性高** - 成熟的第三方服务

## 如何使用 MCP 工具

虽然当前实现中使用的是模拟数据，但项目支持通过 MCP 工具集成来获取真实数据。以下是如何扩展项目以使用 MCP 工具的示例：

### 1. 扩展 `lib/backlink-service.ts`

```typescript
// 通过 MCP 工具获取 Ahrefs 脚本
export async function getAhrefsScriptViaMCP(): Promise<string> {
  // 调用 MCP 工具获取指定 URL 的脚本
  // 需要实现 MCP 客户端
  return await mcpClient.fetchUrl('https://new.web.cafe/topic/wb3luzjl91');
}

// 从脚本中提取逻辑
export function parseAhrefsLogic(script: string): any {
  // 解析脚本并提取 API 调用逻辑
  // 返回可执行的逻辑
}
```

### 2. 创建 MCP 工具客户端

创建 `lib/mcp-client.ts`:

```typescript
import fetch from 'node-fetch';

export class MCPClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
  }

  async fetchUrl(url: string, query: string): Promise<string> {
    // 调用 MCP 服务器的 fetch 工具
    return await fetch(`${this.baseUrl}/fetch`, {
      method: 'POST',
      body: JSON.stringify({ url, query }),
    }).then(r => r.text());
  }
}
```

### 3. 更新查询逻辑

在 `lib/backlink-service.ts` 中实现真实的查询：

```typescript
export async function queryBacklinksFromAhrefs(
  domain: string,
  capsolverApiKey: string
): Promise<Backlink[]> {
  // 1. 通过 MCP 获取 Ahrefs 脚本逻辑
  const script = await getAhrefsScriptViaMCP();
  const logic = parseAhrefsLogic(script);

  // 2. 使用 CapSolver 处理任何 JavaScript 验证
  const client = new CapSolverClient(capsolverApiKey);

  // 3. 执行 Ahrefs 查询
  const results = await logic.queryAhrefs(domain, client);

  // 4. 返回结果
  return results;
}
```

## 环境搭建

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 生产部署

```bash
# 编译项目
npm run build

# 启动生产服务器
npm start
```

### Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 扩展建议

1. **缓存层** - 添加 Redis 缓存减少 API 调用
2. **数据库** - 使用 PostgreSQL 存储查询历史
3. **用户认证** - 添加 NextAuth.js 支持用户登录
4. **付费功能** - 集成 Stripe 支持订阅
5. **批量查询** - 支持 CSV 上传批量查询多个域名
6. **实时通知** - 使用 WebSocket 推送查询进度
7. **导出功能** - 支持 Excel、CSV、JSON 格式导出

## 调试指南

### 检查 CapSolver 连接

```typescript
const client = new CapSolverClient('your_api_key');
const isValid = await client.validateApiKey();
console.log('CapSolver 连接:', isValid ? '成功' : '失败');
```

### 验证域名处理

```typescript
console.log(normalizeDomain('https://www.example.com/'));
// 输出: example.com

console.log(validateDomain('example.com'));
// 输出: true
```

### 查看 API 响应

在浏览器开发者工具中查看网络面板，或在代码中添加日志：

```typescript
console.log('Query response:', result);
```

## 常见问题

### Q: 为什么查询超时?
A: 可能是 CapSolver 账户余额不足或网络问题。检查 API 密钥是否有效。

### Q: 支持哪些域名格式?
A: 支持所有标准格式：example.com、www.example.com、http://example.com、https://www.example.com

### Q: 如何增加查询超时时间?
A: 在 `lib/capsolver.ts` 中修改 `waitForTaskCompletion` 的 `maxWaitTime` 参数。

### Q: 可以批量查询吗?
A: 当前版本支持单个查询，可以通过修改 API 端点支持批量查询。

## 许可证

MIT License - 自由使用和修改
