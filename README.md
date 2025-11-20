# BestLinks - CapSolver 外链查询工具

基于 Next.js 15 的外链批量查询工具，集成 CapSolver API 和 Ahrefs 反向链接数据。

## 🎯 功能特性

- **CapSolver API 集成**: 使用 CapSolver 获取 API 密钥并验证
- **外链数据查询**: 支持输入任意域名进行外链查询
- **灵活的域名格式**: 支持 `example.com`、`www.example.com`、`http://example.com` 等多种格式
- **数据展示**: 表格展示外链信息（源域名、URL、锚文本、DR 等）
- **统计分析**: 展示总外链数、Dofollow/Nofollow 比例、平均 DR 等统计数据
- **实时验证**: 支持实时验证 CapSolver API 密钥有效性

## 📋 项目结构

```
tlink/
├── app/
│   ├── api/
│   │   ├── backlinks/route.ts          # 外链查询 API
│   │   └── capsolver-validate/route.ts # CapSolver 密钥验证 API
│   ├── layout.tsx                       # 全局布局
│   ├── page.tsx                         # 主页面
│   └── globals.css                      # 全局样式
├── components/
│   ├── QueryForm.tsx                    # 查询表单组件
│   └── ResultsTable.tsx                 # 结果展示表格
├── lib/
│   ├── types.ts                         # TypeScript 类型定义
│   ├── capsolver.ts                     # CapSolver 客户端
│   └── backlink-service.ts              # 外链查询服务
└── package.json
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境

项目使用公开的 CapSolver API，无需额外的环境变量配置。

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 4. 编译生产版本

```bash
npm run build
npm start
```

## 📖 使用指南

### 获取 CapSolver API 密钥

1. 访问 [CapSolver 官网](https://www.capsolver.com)
2. 注册账号并登录
3. 在账户设置中获取 API 密钥
4. 确保账户有足够的余额（Cloudflare Turnstile 验证约 $1.2/1000 次请求）

### 查询外链

1. **输入 API 密钥**: 复制 CapSolver API 密钥到第一个输入框
2. **验证密钥**: 点击"验证"按钮确认密钥有效
3. **输入域名**: 在第二个输入框输入要查询的域名
4. **开始查询**: 点击"开始查询"按钮
5. **查看结果**: 查看表格中的外链信息和统计数据

## 🔧 核心功能

### CapSolver 客户端 (`lib/capsolver.ts`)

```typescript
const client = new CapSolverClient(apiKey);

// 创建任务
await client.createTask(taskData);

// 获取任务结果
await client.getTaskResult(taskId);

// 等待任务完成
await client.waitForTaskCompletion(taskId);

// 验证 API 密钥
await client.validateApiKey();
```

### 外链查询服务 (`lib/backlink-service.ts`)

```typescript
// 查询外链
const backlinks = await queryBacklinksFromAhrefs(domain, apiKey);

// 验证域名
validateDomain(domain);

// 规范化域名
normalizeDomain(domain);
```

### API 端点

#### POST `/api/backlinks`

查询指定域名的外链数据。

**请求体**:
```json
{
  "domain": "example.com",
  "capsolverApiKey": "your_api_key_here"
}
```

**响应体**:
```json
{
  "success": true,
  "domain": "example.com",
  "backlinks": [
    {
      "id": "1",
      "sourceUrl": "https://source.com/page",
      "sourceDomain": "source.com",
      "targetUrl": "https://example.com/",
      "anchorText": "Example",
      "domainRating": 45,
      "urlRating": 32,
      "trafficValue": 150,
      "type": "dofollow",
      "firstSeen": "2024-01-15",
      "lastSeen": "2024-11-20"
    }
  ],
  "total": 1
}
```

#### POST `/api/capsolver-validate`

验证 CapSolver API 密钥。

**请求体**:
```json
{
  "apiKey": "your_api_key_here"
}
```

**响应体**:
```json
{
  "valid": true,
  "message": "API key is valid"
}
```

## 📊 数据模型

### Backlink 接口

```typescript
interface Backlink {
  id: string;
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  domainRating?: number;      // 域名评分 (0-100)
  urlRating?: number;         // URL 评分 (0-100)
  trafficValue?: number;      // 预估流量价值
  type?: string;              // 'dofollow' | 'nofollow'
  firstSeen?: string;         // 首次发现日期
  lastSeen?: string;          // 最后更新日期
}
```

## 🛠️ 技术栈

- **Next.js 15** - React 框架，使用 App Router
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **CapSolver API** - 验证码求解服务
- **Ahrefs** - 反向链接数据来源（通过脚本集成）

## 📝 注意事项

1. **API 配额**: 每次查询都会消耗 CapSolver 余额，请确保账户有足够额度
2. **域名格式**: 系统支持多种域名格式，会自动规范化处理
3. **数据更新**: 外链数据可能有延迟，显示的是最近爬取的信息
4. **并发限制**: 建议避免过于频繁的查询以节省成本

## 🔐 安全建议

- 不要在客户端代码中硬编码 API 密钥
- 建议在生产环境使用环境变量存储 API 密钥
- 实施速率限制以防止滥用
- 定期更新依赖包以获取安全补丁

## 📄 许可证

MIT

## 👨‍💻 开发指南

### 添加新功能

1. 在 `lib/` 中添加业务逻辑
2. 在 `components/` 中创建 UI 组件
3. 在 `app/api/` 中创建 API 路由
4. 更新 `lib/types.ts` 中的类型定义

### 测试

```bash
npm run test
npm run lint
```

### 调试

```bash
npm run dev
# 在 http://localhost:3000 打开浏览器开发者工具
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

- 遇到问题? 检查 [CapSolver 文档](https://www.capsolver.com/docs)
- 需要帮助? 创建 GitHub Issue
