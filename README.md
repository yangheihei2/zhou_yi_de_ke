# Proof Assistant（Vite + React + Vercel）

这是一个数学证明助手应用，前端使用 React + Vite，后端使用 Vercel Serverless Functions，支持 **Gemini** 和 **DeepSeek** 两套模型。

## 你需要做的事（部署到 Vercel）

1. 把仓库推送到 GitHub。
2. 在 Vercel 导入该仓库。
3. 在 Vercel 环境变量中至少配置：
   - `GEMINI_API_KEY`
   - `DEEPSEEK_API_KEY`（如果你要在页面选择 DeepSeek）
4. 点击 Deploy。
5. 部署后打开页面：先选模型，再点击 `Generate Proof`。

---


## 本次交互改动（按你的需求）

- 默认初始问题已替换为你给的“阈值控制/分位数”风格问题。
- 右侧 `Formatted` 视图改为 **Compiled**，并通过 MathJax 做前端公式渲染（接近“编译后”效果）。
- 左侧最下方新增 `Possible Proof Ideas & Candidate Theorems` 框，会基于检索结果里最高分文献给出可能思路和可优先调用的定理关键词。

## 模型与 API 架构

### 前端模型选择

现在界面里可直接选择模型：
- `Gemini 2.5 Flash`
- `DeepSeek Chat`
- `DeepSeek Reasoner`

前端会把 `theorem + assumptions + model` 发给对应 API。

### 后端 API 列表

- `POST /api/generate-proof`
  - 用于 Gemini。
  - 默认模型：`gemini-2.5-flash`。
- `POST /api/generate-proof-deepseek`
  - 用于 DeepSeek。
  - 支持模型：`deepseek-chat`、`deepseek-reasoner`。

### 为什么这样设计

- **安全**：API Key 只在服务端读取，不进入浏览器 bundle。
- **可扩展**：后面你要加更多模型，按同样方式加 API 或路由分发即可。
- **更好排障**：Gemini / DeepSeek 错误来源分离，更容易定位问题。

---

## 本地开发

### 1) 安装依赖

```bash
npm install
```

### 2) 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
GEMINI_API_KEY=your_real_gemini_key
DEEPSEEK_API_KEY=your_real_deepseek_key
```

> 若只测试 Gemini，可只配 `GEMINI_API_KEY`；但在 UI 选 DeepSeek 时必须有 `DEEPSEEK_API_KEY`。

### 3) 启动开发

```bash
npm run dev
```

默认地址：`http://localhost:3000`

---

## 构建检查

```bash
npm run lint
npm run build
```

---

## 常见问题

### 1) `Server env GEMINI_API_KEY is not configured.`

Gemini key 未配置（本地或 Vercel）。

### 2) `Server env DEEPSEEK_API_KEY is not configured.`

你选择了 DeepSeek 模型，但服务端没有 `DEEPSEEK_API_KEY`。

### 3) `Gemini request failed` 或 `DeepSeek request failed`

可能原因：
- key 无效 / 过期
- 配额不足
- 服务临时波动

建议先本地验证 key，再检查 Vercel 中是否配置在正确环境（Production / Preview / Development）。

---

## 项目结构

```text
.
├─ api/
│  ├─ generate-proof.ts              # Gemini API
│  └─ generate-proof-deepseek.ts     # DeepSeek API
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ .env.example
├─ vercel.json
└─ package.json
```
