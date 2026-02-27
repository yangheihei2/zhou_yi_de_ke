# Proof Assistant（Vite + React + Vercel）

这是一个数学证明助手前端应用，使用 React + Vite 构建，调用 Gemini 生成证明内容。

## 你这次需要做的事情（部署到 Vercel）

1. 把代码推送到 GitHub。
2. 在 Vercel 导入该仓库。
3. 在 Vercel 项目设置里配置环境变量：
   - `GEMINI_API_KEY` = 你的 Gemini API Key
4. 触发 Deploy。
5. 部署后打开页面，点击 `Generate Proof` 验证接口是否正常。

> 这个版本已经把 Gemini 调用迁移到 `/api/generate-proof` 服务端函数，避免把 key 直接暴露在浏览器端。

---

## 模型说明（重点）

当前后端使用的是 **Gemini 2.5 Flash**（在 `api/generate-proof.ts` 中定义）。

### 1) 这个模型在本项目里做什么

在你点击 `Generate Proof` 后，前端会把：
- `theorem`（定理陈述）
- `assumptions`（已知条件）

发到服务端 `/api/generate-proof`。服务端把这两部分拼成 prompt，交给 Gemini 生成一段 LaTeX 风格证明文本，再返回给前端展示。

### 2) 为什么选择 Gemini 2.5 Flash

对于这个场景（交互式写作 + 证明草稿生成），Flash 模型通常有这几个优势：
- **响应速度快**：前端交互体验更好。
- **成本更友好**：适合反复调试 prompt。
- **质量足够**：用于数学证明草稿、结构化文本生成通常够用。

如果后续你追求更强推理深度，可以改成更高能力模型（代价是延迟和成本可能上升）。

### 3) 这个模型的输入/输出格式

- 输入：纯文本 prompt（包含 theorem + assumptions + 输出格式要求）。
- 输出：字符串文本（这里约定是 LaTeX 风格内容，含 Theorem/Proof 结构）。

### 4) 你要注意的边界

- **模型并不保证 100% 数学正确**，尤其是复杂定理。
- 输出可能“看起来很正规”但存在逻辑漏洞，建议人工校验关键步骤。
- 当 key/配额/网络异常时，会返回 `Gemini request failed`。

### 5) 如何换模型（可选）

现在模型名写在后端文件 `api/generate-proof.ts`：

```ts
const model = 'gemini-2.5-flash';
```

你可以直接替换成你想用的模型版本并重新部署。

### 6) 安全性为什么更好

Gemini API 调用已经在服务端完成，浏览器只请求你自己的 `/api/generate-proof`，不会直接携带 `GEMINI_API_KEY`，因此比前端直连更安全。

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

然后编辑 `.env.local`：

```env
GEMINI_API_KEY=your_real_key
```

### 3) 启动开发环境

```bash
npm run dev
```

默认端口：`3000`。

---

## 构建检查

```bash
npm run lint
npm run build
```

---

## Vercel 部署说明

### 方式 A：在网页里点选（推荐）

- 打开 [https://vercel.com/new](https://vercel.com/new)
- 选择你的 GitHub 仓库
- Framework Preset 选择 `Vite`（本项目已在 `vercel.json` 声明）
- Environment Variables 添加：
  - `GEMINI_API_KEY`
- 点击 Deploy

### 方式 B：Vercel CLI

```bash
npm i -g vercel
vercel
```

首次部署跟随提示绑定项目；然后到 Vercel Dashboard 补充 `GEMINI_API_KEY` 后重新部署。

---

## 常见问题排查

### 1) 页面报错：`Server env GEMINI_API_KEY is not configured.`

说明 Vercel（或本地）没有配置 `GEMINI_API_KEY`。

### 2) 点击生成后提示 `Gemini request failed`

可能是：
- key 无效或过期
- 账号配额不足
- 网络/区域问题

建议先在本地确认 `.env.local` 生效，再看 Vercel 项目环境变量是否配置在正确环境（Production / Preview / Development）。

### 3) 为什么不直接在前端读取 key？

因为前端变量会打包进浏览器代码，存在泄露风险。现在改为通过 Vercel Serverless Function 调用 Gemini，安全性更好。

---

## 项目结构

```text
.
├─ api/
│  └─ generate-proof.ts      # Vercel Serverless Function，负责调用 Gemini
├─ src/
│  ├─ App.tsx                # 前端页面与交互
│  ├─ main.tsx
│  └─ index.css
├─ .env.example
├─ vercel.json
└─ package.json
```
