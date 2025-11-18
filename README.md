# SparkFloow

一個即時的想法牆應用程式。讓使用者在共享空間中自由創建、編輯和管理想法卡片。

[English](README.en.md)

---

## AI 輔助日誌

1. 技術規範：先設定規範，開發一個 MVP 版本的創意想法牆 (Idea Wall)
   Tech Stack: next.js, react, tyscript, tailwind, supabase, shadcn
   Feature: card crud, grid layout, pagination, toast, tag

2. 架構優先：在寫 Code 前先確認實作邏輯
   幫我用 shadcn 實作 Pagination，功能需包含 PageSize 切換與換頁按鈕。**先不要寫 code** 先跟我說你打算怎麼做，跟我解釋清楚 每一步，等確認好了才繼續。

3. 邏輯抽離：太臃腫的 file, 太長的 code 抽出來處理，違反單一職責原則 (Single Responsibility Principle)
   app/page.ts 太長太肥，把 form & idea 抽出來處理；把 supabase 相關的 function 集中管理，放在 lib 裡，UI 和資料庫實作細節拆開

## Features

- 完整的 CRUD 操作：建立、讀取、更新、刪除想法卡片
- 即時更新：操作後立即刷新顯示最新內容
- 瀑布流佈局：響應式多欄位排版
- 分頁系統：可調整每頁顯示數量（10/20/50），支援 URL 分享特定頁面
- 標籤管理：使用逗號分隔的標籤快速分類想法
- Toast 通知：操作成功或失敗的即時反饋

## Tech Stack

- Next.js 15：使用 App Router 和 React Server Components
- React 19：最新的 Concurrent Features 和 useTransition
- TypeScript：嚴格模式確保類型安全
- Tailwind CSS v4：新一代 CSS 框架，更快的建置速度
- Supabase：PostgreSQL 資料庫 + 自動生成的 REST API
- shadcn/ui：可自訂的 UI 元件庫（基於 Radix UI）

## Architecture Design

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Client Components ("use client")                          │ │
│  │                                                            │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │ │
│  │  │ IdeaForm    │  │  IdeaCard    │  │ PaginationBar    │   │ │
│  │  │ - useState  │  │  - Dialog    │  │ - useRouter      │   │ │
│  │  │ - onSubmit  │  │  - Edit/Del  │  │ - URL params     │   │ │
│  │  └─────────────┘  └──────────────┘  └──────────────────┘   │ │
│  │                                                            │ │
│  │  操作後 → router.refresh() → 觸發伺服器重新 fetch             │ │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Next.js Server (Vercel Serverless/Edge)                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Server Components (SSR)                                  │ │
│  │                                                            │ │
│  │  app/page.tsx                                             │ │
│  │   → 解析 URL params (?page=2&pageSize=20)                 │ │
│  │   → 驗證並修正參數 (page=999 → lastPage)                  │ │
│  │   → await fetchIdeasPaginated(page, pageSize)             │ │
│  │   → 渲染 HTML 並傳送至瀏覽器                               │ │
│  │                                                            │ │
│  │  lib/ideas.ts                                             │ │
│  │   → Step 1: count 總筆數（head: true，不拿資料）           │ │
│  │   → Step 2: 計算 totalPages，normalize page               │ │
│  │   → Step 3: range(from, to) 獲取該頁資料                  │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Supabase (Backend as a Service)                               │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                      │ │
│  │                                                            │ │
│  │  Table: ideas                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ id (SERIAL PK)  │ created_at │ edited_at │ title     │ │ │
│  │  │ content (TEXT)  │ tags (TEXT[])                      │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  Index: id (PK), created_at (DESC) ← 加速排序              │ │
│  │  RLS Policy: 公開讀寫（demo 用途）                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  REST API (自動生成)                                            │
│   → supabase.from('ideas').select()                            │
│   → supabase.from('ideas').insert()                            │
│   → supabase.from('ideas').update()                            │
│   → supabase.from('ideas').delete()                            │
└─────────────────────────────────────────────────────────────────┘
```

分頁策略說明：

- Offset-based pagination：`range(from, to)` = `LIMIT x OFFSET y`
- 兩階段查詢防止越界：先 count 算頁數，再 fetch 資料
- URL 狀態管理：分頁參數存在 URL，可分享、可書籤

## Roadmap

Phase 1 - MVP（已完成）

- [x] 專案建置與 Supabase 整合
- [x] 基本 CRUD 功能
- [x] 分頁系統
- [x] 瀑布流佈局
- [x] Toast 通知

Phase 2 - 進階功能

- [ ] Supabase Realtime：透過 WebSocket 訂閱資料庫變更，實現多人即時協作
- [ ] 搜尋與篩選：內容全文搜尋 + 標籤篩選
- [ ] Optimistic UI：操作後立即更新 UI，失敗時回滾
- [ ] Loading Skeletons：初次載入時的骨架屏，改善感知效能
- [ ] 圖片上傳：整合 Supabase Storage，支援圖片附件
- [ ] 標籤管理：自動完成、顏色標記、使用統計
- [ ] 深色模式切換：加入 UI 切換按鈕（使用 next-themes）
- [ ] Cursor-based Pagination：改善大型資料集的分頁效能

Phase 3 - Scale & Collaboration

- [ ] 多人協作衝突處理
  - 問題：多人同時編輯同一筆資料會相互覆蓋
  - 解法：使用 Supabase Realtime + Optimistic Locking（`edited_at` 版本檢查）或 CRDT
- [ ] 高併發請求處理
  - 問題：大量同時寫入可能導致資料庫效能瓶頸
  - 解法：實作 Rate Limiting（Upstash Redis）+ 請求節流 + Connection Pooling
- [ ] 資料量 Scale Up
  - 問題：萬筆以上資料時 Offset pagination 效能下降
  - 解法：改用 Cursor-based pagination + 資料庫索引優化 + 考慮引入快取層（Redis）
- [ ] 資料庫層級優化
  - 問題：複雜查詢（搜尋 + 標籤篩選）可能變慢
  - 解法：PostgreSQL Full-Text Search + GIN Index on tags + Read Replica 分流讀取

Phase 4 - 品質提升

- [ ] 單元測試：使用 Vitest 測試工具函數與元件
- [ ] E2E 測試：使用 Playwright 測試完整使用者流程
- [ ] 輸入消毒：防止 XSS 攻擊，內容過濾
- [ ] Error Boundaries：捕捉渲染錯誤，顯示友善錯誤頁面
- [ ] 效能監控：Core Web Vitals 追蹤
- [ ] SEO 優化：Open Graph meta tags, 結構化資料

## Project Structure

```
idea-wall/
├── app/
│   ├── layout.tsx              # 根佈局：字型、metadata、Toaster
│   ├── page.tsx                # 首頁（Server Component）：資料獲取與渲染
│   └── globals.css             # Tailwind CSS + 自訂 CSS 變數
├── components/
│   ├── idea-card.tsx           # 想法卡片：顯示、編輯、刪除
│   ├── idea-form.tsx           # 新增表單：展開式表單設計
│   ├── pagination-bar.tsx      # 分頁控制：URL 狀態管理
│   └── ui/                     # shadcn/ui 元件（Button, Card, Dialog, Input 等）
├── lib/
│   ├── ideas.ts                # CRUD API 函數
│   ├── supabaseClient.ts       # Supabase 客戶端初始化
│   ├── types.ts                # TypeScript 類型定義
│   └── utils.ts                # 工具函數（cn 等）
├── public/                     # 靜態資源
├── components.json             # shadcn/ui 配置
├── tsconfig.json               # TypeScript 配置（嚴格模式）
├── package.json                # 專案依賴
└── pnpm-lock.yaml              # 套件版本鎖定
```

---

Built with ❤️ using Next.js 15, React 19, and Supabase
