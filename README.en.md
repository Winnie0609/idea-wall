A real-time idea wall application that allows users to freely create, edit, and manage idea cards in a shared space.

# AI-Assisted Development Log

1. Technical Specifications: Established specifications first, developing an MVP version of Idea Wall
   - Tech Stack: Next.js, React, TypeScript, Tailwind CSS, Supabase, shadcn/ui
   - Features: Card CRUD, Grid Layout, Pagination, Toast, Tag

2. Architecture First: Confirm implementation logic before writing code
   - Implemented Pagination with shadcn/ui, including PageSize selector and navigation buttons. 
   - Discussed and confirmed the approach step-by-step before implementation.

3. Logic Separation: Extracted bloated files and lengthy code, adhering to Single Responsibility Principle (SRP)
   - Refactored app/page.ts by extracting form & idea components; 
   - centralized Supabase functions in lib/, separating UI from database implementation details.

## Features

- Full CRUD Operations: Create, read, update, and delete idea cards
- Real-time Updates: Instant refresh after operations to display latest content
- Masonry Layout: Responsive multi-column layout
- Pagination System: Adjustable page size (10/20/50), shareable URLs for specific pages
- Tag Management: Quick categorization with comma-separated tags
- Toast Notifications: Immediate feedback for successful or failed operations

## Tech Stack

- Next.js 15: App Router with React Server Components
- React 19: Latest Concurrent Features and useTransition
- TypeScript: Strict mode for type safety
- Tailwind CSS v4: Next-generation CSS framework with faster build times
- Supabase: PostgreSQL database + auto-generated REST API
- shadcn/ui: Customizable UI component library (based on Radix UI)

## Architecture Design

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Client Components ("use client")                         │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│  │  │ IdeaForm    │  │  IdeaCard    │  │ PaginationBar    │  │  │
│  │  │ - useState  │  │  - Dialog    │  │ - useRouter      │  │  │
│  │  │ - onSubmit  │  │  - Edit/Del  │  │ - URL params     │  │  │
│  │  └─────────────┘  └──────────────┘  └──────────────────┘  │  │
│  │                                                           │  │
│  │  After action → router.refresh() → Trigger server refetch │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Next.js Server (Vercel Serverless/Edge)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Server Components (SSR)                                  │  │
│  │                                                           │  │
│  │  app/page.tsx                                             │  │
│  │   → Parse URL params (?page=2&pageSize=20)                │  │
│  │   → Validate & normalize params (page=999 → lastPage)     │  │
│  │   → await fetchIdeasPaginated(page, pageSize)             │  │
│  │   → Render HTML and send to browser                       │  │
│  │                                                           │  │
│  │  lib/ideas.ts                                             │  │
│  │   → Step 1: count total items (head: true, no data)       │  │
│  │   → Step 2: calculate totalPages, normalize page          │  │
│  │   → Step 3: range(from, to) fetch page data               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Supabase (Backend as a Service)                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                      │  │
│  │                                                           │  │
│  │  Table: ideas                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ id (SERIAL PK)  │ created_at │ edited_at │ title     │ │  │
│  │  │ content (TEXT)  │ tags (TEXT[])                      │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  Index: id (PK), created_at (DESC) ← Speed up sorting     │  │
│  │  RLS Policy: Public read/write (for demo purposes)        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  REST API (Auto-generated)                                      │
│   → supabase.from('ideas').select()                             │
│   → supabase.from('ideas').insert()                             │
│   → supabase.from('ideas').update()                             │
│   → supabase.from('ideas').delete()                             │
└─────────────────────────────────────────────────────────────────┘
```

Pagination Strategy:

- Offset-based pagination: `range(from, to)` = `LIMIT x OFFSET y`
- Two-phase query prevents out-of-bounds: first count, then fetch
- URL state management: pagination params in URL, shareable & bookmarkable

## Roadmap

Phase 1 - MVP (Completed)

- [x] Project setup and Supabase integration
- [x] Basic CRUD functionality
- [x] Pagination system
- [x] Masonry layout
- [x] Toast notifications

Phase 2 - Advanced Features

- [ ] Supabase Realtime: WebSocket subscription for database changes, enabling real-time collaboration
- [ ] Search & Filter: Full-text search + tag filtering
- [ ] Optimistic UI: Immediate UI updates with rollback on failure
- [ ] Loading Skeletons: Skeleton screens for initial load, improving perceived performance
- [ ] Image Upload: Integrate Supabase Storage for image attachments
- [ ] Tag Management: Auto-complete, color coding, usage statistics
- [ ] Dark Mode Toggle: Add UI toggle button (using next-themes)
- [ ] Cursor-based Pagination: Improve pagination performance for large datasets

Phase 3 - Scale & Collaboration

- [ ] Multi-user Conflict Resolution
  - Problem: Concurrent edits on the same record overwrite each other
  - Solution: Supabase Realtime + Optimistic Locking (`edited_at` version check) or CRDT
- [ ] High Concurrency Request Handling
  - Problem: Large volume of simultaneous writes causing database performance bottleneck
  - Solution: Implement Rate Limiting (Upstash Redis) + Request throttling + Connection Pooling
- [ ] Data Volume Scale Up
  - Problem: Offset pagination performance degrades with 10,000+ records
  - Solution: Switch to Cursor-based pagination + database index optimization + introduce cache layer (Redis)
- [ ] Database-level Optimization
  - Problem: Complex queries (search + tag filtering) may slow down
  - Solution: PostgreSQL Full-Text Search + GIN Index on tags + Read Replica for read distribution

Phase 4 - Quality Enhancement

- [ ] Unit Testing: Test utility functions and components with Vitest
- [ ] E2E Testing: Test complete user flows with Playwright
- [ ] Input Sanitization: Prevent XSS attacks, content filtering
- [ ] Error Boundaries: Catch rendering errors, display friendly error pages
- [ ] Performance Monitoring: Core Web Vitals tracking
- [ ] SEO Optimization: Open Graph meta tags, structured data

## Project Structure

```
idea-wall/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, Toaster
│   ├── page.tsx                # Home page (Server Component): data fetching & rendering
│   └── globals.css             # Tailwind CSS + custom CSS variables
├── components/
│   ├── idea-card.tsx           # Idea card: display, edit, delete
│   ├── idea-form.tsx           # Create form: expandable form design
│   ├── pagination-bar.tsx      # Pagination controls: URL state management
│   └── ui/                     # shadcn/ui components (Button, Card, Dialog, Input, etc.)
├── lib/
│   ├── ideas.ts                # CRUD API functions
│   ├── supabaseClient.ts       # Supabase client initialization
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # Utility functions (cn, etc.)
├── public/                     # Static assets
├── components.json             # shadcn/ui configuration
├── tsconfig.json               # TypeScript configuration (strict mode)
├── package.json                # Project dependencies
└── pnpm-lock.yaml              # Package version lock
```
---

Built with ❤️ using Next.js 15, React 19, and Supabase
