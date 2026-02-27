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
