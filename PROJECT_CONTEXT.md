# AutoDMs — Technical Architecture & System Reference

> **Document Version:** 1.0.0 (V1 Launch Reference)  
> **Last Updated:** August 24, 2026  
> **Target Audience:** AI Engineering Assistants (Gemini Spark / Antigravity), Backend Engineers, System Architects.

---

## 1. Project Overview & Core Mission

### Product Name & Description
**AutoDMs** (formerly *InstaFlow*) is a high-reliability, cloud-native Instagram comment-to-DM, story mention reward, and inbound direct message automation SaaS platform. It enables e-commerce brands, creators, influencers, and digital agencies to convert public Instagram engagement (comments, reels, story mentions) into qualified leads, website traffic, and direct WhatsApp sales within seconds.

### Target Audience
1. **E-commerce Brands & Local Businesses:** Delivering automated pricing catalogs, discount codes, and routing buyers to WhatsApp orders.
2. **Creators & Coaches:** Delivering automated lead magnets, PDF downloads, and training links upon comment spikes.
3. **Marketing Agencies:** Managing high-volume automated campaigns for multiple client Instagram Business profiles.

### Core Capabilities & Features
- **Meta Graph API Compliance:** Operates strictly on official Meta Graph API v24.0 webhooks and endpoints without web scraping or headless browser automation.
- **Smart Text Normalization:** Multi-keyword matching engine with emoji stripping, accent removal, punctuation cleaning, and substring/exact detection.
- **Randomized Jitter Pacing (Anti-Spam):** Human-like randomized delay injection (500ms – 2,000ms) prior to dispatching public replies and private DMs to safeguard accounts against Meta rate-limit blocks.
- **Atomic Deduplication:** Unique placeholder constraint in database execution logs preventing duplicate processing of rapid concurrent webhook deliveries.
- **Interactive Generic Template Buttons:** Formats DMs as interactive Meta cards with primary/secondary Web URL redirection buttons.
- **Story Mention Rewards:** Automatically captures story tag notifications and rewards users with coupon codes or resource links.
- **Inbound DM & Postback Handlers:** Processes direct keyword inquiries in inbox threads and handles quick-reply button clicks.
- **2-Step Lead Capture Engine:** Regex-based email and phone number extractor inside DM conversations with instant reward delivery upon lead registration.
- **Leads Management & Instant CSV Export:** Client-side searchable lead database with 1-click browser CSV downloads.
- **Full-Page ManyChat-Style Wizard Builder:** 4-step interactive automation builder with live synchronized iOS iPhone mockup preview.
- **SaaS Monthly Usage Metering:** Dynamic tier management (Free Starter: 150 DMs, Creator Pro: 3,000 DMs, Business: 15,000 DMs) with automatic 30-day quota reset cycles.
- **60-Day Token Auto-Refresh Lifecycle:** Proactive token refresh engine that extends long-lived Meta Page Access Tokens when within 20 days of expiration.

---

## 2. Tech Stack & Infrastructure

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 15.5.23 (App Router) | React Server Components (RSC) + Server Actions + Client Components |
| **Language** | TypeScript 6.0.3 | Strict type-checking, node types |
| **Frontend / Styling** | Tailwind CSS 3.4.19 + Framer Motion 13.1.1 | Custom solid dark `#0B0F17` / `#111827` + Mint Green `#00DF81` design system |
| **Icons** | Lucide React 1.33.0 | Minimalist UI icons |
| **Database** | PostgreSQL (Supabase) | Hosted in AWS `eu-west-1` via connection pooler (`DATABASE_URL` + `DIRECT_URL`) |
| **ORM / Query Engine** | Prisma Client 6.19.3 | Type-safe query builder, automated schema migrations via `prisma db push` |
| **Authentication** | NextAuth.js 4.24.15 | Credentials provider with bcryptjs password hashing |
| **Security & Encryption** | Node.js `crypto` (AES-256-CBC) | Two-way encryption for Meta Access Tokens; HMAC-SHA256 signature verification |
| **External API** | Meta Graph API v24.0 | Instagram Business & Facebook Pages Webhook integrations |
| **Serverless Runtime** | Vercel Serverless Functions | Node.js Serverless runtime (Region: `iad1` Washington, D.C.) |
| **Hosting & CI/CD** | Vercel Production Pipeline | Connected to GitHub (`yassinecodez/AutoDMs`), automated production builds |

---

## 3. Directory Structure & Key Files

### Concise Directory Tree
```
├── prisma/
│   └── schema.prisma                  # Prisma data models & database configuration
├── public/                            # Static media and favicon assets
├── scripts/
│   └── simulate-comment.ts            # Local test script for simulating Meta webhook payloads
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/     # NextAuth credentials authentication endpoint
│   │   │   │   ├── facebook/          # Meta Facebook OAuth initiate & callback routes
│   │   │   │   └── instagram/         # Meta Instagram OAuth initiate & callback routes
│   │   │   ├── diagnostic/            # Meta webhook subscription & account health check API
│   │   │   ├── instagram/
│   │   │   │   ├── media/             # Fetches profile feed media thumbnails
│   │   │   │   └── subscribe/         # Re-subscribes Meta page to webhook apps
│   │   │   └── webhook/
│   │   │       └── instagram/         # Meta real-time webhook intake POST/GET endpoint
│   │   ├── dashboard/
│   │   │   ├── accounts/              # Meta profile connection manager (OAuth + Manual Token)
│   │   │   ├── automations/
│   │   │   │   ├── builder/           # Full-page 4-step wizard builder
│   │   │   │   ├── new/               # Redirect wrapper to builder
│   │   │   │   └── page.tsx           # Active automation rules manager list
│   │   │   ├── leads/                 # Captured leads viewer & CSV exporter
│   │   │   ├── logs/                  # Audit trail and execution logs viewer
│   │   │   ├── settings/              # SaaS usage meter & subscription tier pricing page
│   │   │   ├── layout.tsx             # Authenticated dashboard shell & sidebar provider
│   │   │   └── page.tsx               # 65/35 Overview dashboard metrics & recent actions
│   │   ├── globals.css                # Global styles, Tailwind base directives
│   │   ├── layout.tsx                 # Root layout & NextAuth session provider wrapper
│   │   ├── login/                     # Authentication login and auto-registration screen
│   │   └── page.tsx                   # Public marketing landing page (MAD/USD pricing, FAQs)
│   ├── components/
│   │   ├── AutomationBuilderClient.tsx# Client wizard builder with live simulated iPhone mockup
│   │   ├── AutomationsManager.tsx     # Active rules grid, toggle switches, and rules editor
│   │   ├── ConnectFacebookButton.tsx  # OAuth redirect button for Meta Graph API
│   │   ├── FaqAccordion.tsx           # Interactive landing page support accordion
│   │   ├── LeadsTable.tsx             # Searchable leads table with client CSV export
│   │   ├── ManualConnectForm.tsx      # Fallback manual token connection modal
│   │   ├── PricingSection.tsx         # Landing page pricing switcher (MAD / USD)
│   │   ├── Providers.tsx              # NextAuth SessionProvider wrapper
│   │   ├── RefreshTokenButton.tsx     # Manual Meta token refresh trigger
│   │   ├── SidebarNav.tsx             # Dashboard sidebar navigation with active mint indicator
│   │   ├── SignOutButton.tsx          # NextAuth sign-out trigger
│   │   ├── SyncWebhookButton.tsx      # Manual webhook re-subscription trigger
│   │   └── UpgradeButton.tsx          # Client-side subscription tier upgrade action button
│   └── lib/
│       ├── auth.ts                    # NextAuth configuration and credentials validation
│       ├── crypto.ts                  # AES-256-CBC encrypt/decrypt utilities for tokens
│       ├── db.ts                      # PrismaClient singleton instance
│       ├── meta.ts                    # Meta Graph API SDK (token exchange, page subscription, messages)
│       ├── plans.ts                   # Strategic subscription tiers definitions (Free, Pro, Business)
│       ├── tokenRefresh.ts            # 60-day token lifecycle and auto-refresh helper
│       ├── utils.ts                   # Tailwind merge / clsx helper
│       └── whatsapp.ts                # WhatsApp Direct URL generator helper
├── .env                               # Local environment variables
└── package.json                       # Dependencies, scripts, and package metadata
```

### Primary File Responsibilities Table

| File Path | Layer | Responsibility |
|---|---|---|
| `src/app/api/webhook/instagram/route.ts` | Backend API | Verifies HMAC-SHA256 signatures, deduplicates events atomically, normalizes keyword matches, respects SaaS limits, and dispatches DMs / comment replies. |
| `src/app/api/diagnostic/route.ts` | Diagnostics | Tests DB accounts, verifies token decryption, inspects Meta `/me` endpoints, and force-activates webhook subscriptions. |
| `src/app/dashboard/automations/actions.ts` | Server Action | Validates FormData and persists automation rules (trigger keywords, Generic Template buttons, lead capture flags) in database. |
| `src/app/dashboard/settings/actions.ts` | Server Action | Handles tier upgrades (`upgradePlanAction`), updates `User.planType` and `User.dmsLimit`, and revalidates dashboard cache. |
| `src/lib/meta.ts` | Meta API SDK | Exchanges short-lived tokens for long-lived Page tokens, queries Instagram Business accounts, and wraps Meta Graph API endpoints. |
| `src/lib/tokenRefresh.ts` | Token Engine | Checks if Meta tokens are expiring within 20 days and invokes `graph.instagram.com/refresh_access_token` to extend validity. |
| `src/lib/crypto.ts` | Encryption | Encrypts Page Access Tokens with AES-256-CBC and IV prepending before database persistence. |
| `src/components/AutomationBuilderClient.tsx` | Frontend UI | Orchestrates 4-step wizard inputs with Framer Motion slide transitions and renders interactive dark-mode iPhone DM/Comment/Post previews. |
| `src/app/dashboard/page.tsx` | Dashboard UI | Renders 4 flat metrics cards, recent execution logs table, and account health / quota meter sidebar card in a 65%/35% layout. |

---

## 4. Data Models & Database Schema

The database is powered by PostgreSQL (via Supabase) and managed using Prisma ORM (`prisma/schema.prisma`).

```
┌──────────────┐         ┌───────────────┐
│     User     │───1:N───┤   IgAccount   │
└──────────────┘         └───────────────┘
       │                         │
      1:N                       1:N
       │                         │
┌──────────────┐         ┌───────────────┐
│  Automation  │───1:N───┤     Lead      │
└──────────────┘         └───────────────┘
       │
      1:N
       │
┌──────────────┐
│ ExecutionLog │
└──────────────┘
```

### 1. `User` Model
Represents the authenticated platform user / creator.
- `id` (String, UUID, Primary Key): Unique identifier.
- `email` (String, Unique): Login email.
- `password` (String): Hashed password (bcrypt).
- `name` (String, Optional): User display name.
- `planType` (String, Default: `"FREE"`): Subscription tier (`"FREE"`, `"PRO"`, `"BUSINESS"`).
- `dmsLimit` (Int, Default: `150`): Monthly allowed DM deliveries.
- `dmsCountThisMonth` (Int, Default: `0`): Current month's DM delivery count.
- `usageResetAt` (DateTime, Default: `now()`): Timestamp of the last 30-day quota reset.
- `createdAt` / `updatedAt` (DateTime): Timestamps.
- **Relations:** `accounts` (`IgAccount[]`), `automations` (`Automation[]`).

### 2. `IgAccount` Model
Represents a linked Meta Facebook Page & Instagram Business Profile.
- `id` (String, UUID, Primary Key): Unique record identifier.
- `userId` (String, Foreign Key -> `User.id`, Cascade Delete): Owner user reference.
- `instagramAccountId` (String, Unique): Meta Instagram Business Account ID.
- `pageId` (String, Unique): Meta Facebook Page ID.
- `pageName` (String): Facebook Page / Profile handle.
- `accessToken` (String): AES-256-CBC encrypted Page Access Token.
- `tokenExpiresAt` (DateTime, Optional): Expiration timestamp for long-lived tokens.
- `createdAt` / `updatedAt` (DateTime): Timestamps.
- **Relations:** `user` (`User`), `leads` (`Lead[]`).

### 3. `Automation` Model
Represents an active comment-to-DM or story automation rule.
- `id` (String, UUID, Primary Key): Rule identifier.
- `userId` (String, Foreign Key -> `User.id`, Cascade Delete): Creator reference.
- `name` (String): Human-readable rule title.
- `triggerType` (String): Trigger mode (`"ALL"`, `"KEYWORD"`, `"EXACT"`).
- `triggerKeyword` (String, Optional): Comma-separated target keywords.
- `replyDmMessage` (String): Private DM template text (supports `{{username}}`).
- `replyCommentOptions` (String[]): Array of randomized public comment acknowledgments.
- `triggerScope` (String, Default: `"ALL_POSTS"`): Targeting scope (`"ALL_POSTS"`, `"SPECIFIC_POSTS"`).
- `targetMediaIds` (String[], Default: `[]`): Array of targeted Instagram Media IDs.
- `triggerSource` (String, Default: `"COMMENTS"`): Trigger source (`"COMMENTS"`, `"STORY_MENTIONS"`, `"DIRECT_MESSAGES"`, `"ALL"`).
- `enableLeadCapture` (Boolean, Default: `false`): Enables 2-step contact capture.
- `leadConfirmationDm` (String, Optional): Delivery message sent after email/phone registration.
- `buttonTitle` (String, Optional): Primary Generic Template button title (Max 20 chars).
- `buttonUrl` (String, Optional): Primary Generic Template destination URL.
- `secondaryButtonTitle` (String, Optional): Secondary button title.
- `secondaryButtonUrl` (String, Optional): Secondary button destination URL.
- `active` (Boolean, Default: `true`): Rule activation status.
- `createdAt` / `updatedAt` (DateTime): Timestamps.
- **Relations:** `user` (`User`), `logs` (`ExecutionLog[]`), `leads` (`Lead[]`).

### 4. `ExecutionLog` Model
Audit trail for every inbound webhook transaction.
- `id` (String, UUID, Primary Key): Record ID.
- `automationId` (String, Optional, Foreign Key -> `Automation.id`, SetNull): Matched rule ID.
- `commentId` (String, Unique): Unique Meta Comment ID, Message MID, or Postback ID for atomic deduplication.
- `commentText` (String): Raw incoming text or caption.
- `commenterUsername` (String): Resolved Instagram username or sender ID.
- `triggerSource` (String, Default: `"COMMENT"`): `"COMMENT"`, `"STORY_MENTION"`, `"DIRECT_MESSAGE"`.
- `dmStatus` (String): `"PROCESSING"`, `"SUCCESS"`, `"FAILED"`, `"SKIPPED"`, `"LEAD_CAPTURED"`, `"TEST_EVENT"`.
- `dmError` (String, Optional): Error details if dispatch failed.
- `commentStatus` (String, Default: `"SKIPPED"`): `"PROCESSING"`, `"SUCCESS"`, `"FAILED"`, `"SKIPPED"`.
- `commentError` (String, Optional): Error details for public reply.
- `timestamp` (DateTime, Default: `now()`): Event arrival time.

### 5. `Lead` Model
Stores contact information collected through direct message interactions.
- `id` (String, UUID, Primary Key): Lead record ID.
- `igAccountId` (String, Foreign Key -> `IgAccount.id`, Cascade Delete): Profile reference.
- `automationId` (String, Optional, Foreign Key -> `Automation.id`, SetNull): Originating rule.
- `instagramId` (String): Meta sender Instagram scoped ID.
- `username` (String, Optional): Resolved Instagram handle.
- `email` (String, Optional): Extracted email address.
- `phone` (String, Optional): Extracted phone number.
- `createdAt` / `updatedAt` (DateTime): Timestamps.
- **Constraints:** `@@unique([igAccountId, instagramId])` ensures 1 lead record per Instagram user per business account.

---

## 5. Critical Workflows & Business Logic

### A. Meta OAuth & Page Connection Flow
```
User clicks "Connect with Facebook" ──> /api/auth/facebook/url
  │
  ▼
Meta OAuth Dialog (scopes: pages_show_list, instagram_basic, instagram_manage_comments, instagram_manage_messages, pages_manage_metadata)
  │
  ▼
Redirect to /api/auth/facebook/callback?code=...
  │
  ├─ 1. Exchange short-lived code for User Access Token
  ├─ 2. MetaApi.getLongLivedUserAccessToken() -> 60-day User Token
  ├─ 3. MetaApi.getUserPages() -> Fetch managed Pages and permanent Page Access Tokens
  ├─ 4. MetaApi.getInstagramBusinessAccount() -> Resolve linked Instagram Business Account ID
  ├─ 5. MetaApi.subscribePageToWebhook() -> Subscribe Page to app webhook fields
  ├─ 6. encrypt(pageAccessToken) -> Store in IgAccount table
  │
  ▼
Redirect user to /dashboard/accounts?status=success
```

### B. Inbound Webhook Pipeline (`src/app/api/webhook/instagram/route.ts`)
```
Inbound HTTP POST from Meta
  │
  ├─ 1. Signature Verification
  │     Extract X-Hub-Signature-256 header.
  │     HMAC-SHA256(rawBody, INSTAGRAM_APP_SECRET) === signatureHash.
  │
  ├─ 2. Event Routing
  │     ├── changes (Comments on Posts/Reels)
  │     └── messaging (Direct Messages, Story Mentions, Button Postbacks)
  │
  ├─ 3. Atomic Deduplication
  │     Attempt ExecutionLog.create({ commentId: eventId, dmStatus: "PROCESSING" }).
  │     If unique constraint fails, abort immediately (prevents duplicate sends).
  │
  ├─ 4. Account Resolution & Token Decryption
  │     Match IgAccount by instagramAccountId / pageId.
  │     Decrypt Page Access Token using AES-256-CBC.
  │
  ├─ 5. SaaS Quota Meter Check
  │     If (user.dmsCountThisMonth >= user.dmsLimit):
  │         ExecutionLog.update({ dmStatus: "FAILED", dmError: "Quota exceeded" })
  │         Abort dispatch.
  │
  ├─ 6. Lead Capture Interceptor (Direct Messages only)
  │     If incoming message matches Email (/.../) or Phone (/(?:\+?\d...)/):
  │         Upsert Lead in database.
  │         Dispatch leadConfirmationDm.
  │         ExecutionLog.update({ dmStatus: "LEAD_CAPTURED" }).
  │         Increment user.dmsCountThisMonth.
  │         Continue (skip keyword matching).
  │
  ├─ 7. Normalization & Rule Matching
  │     normalizeText() -> strip accents, emojis, punctuation, trim whitespace.
  │     Match against active Automation rules (Scope: ALL_POSTS vs SPECIFIC_POSTS, Type: EXACT vs KEYWORD vs ALL).
  │
  ├─ 8. Anti-Spam Pacing & Dispatch
  │     await sleep(random(500, 2000)ms).
  │     If buttonTitle & buttonUrl configured:
  │         Format Meta Generic Template attachment with buttons.
  │     Else:
  │         Format standard text message.
  │     POST https://graph.instagram.com/v24.0/me/messages
  │
  ├─ 9. Public Comment Reply (if applicable)
  │     Pick randomized variation from replyCommentOptions[].
  │     POST https://graph.instagram.com/v24.0/{commentId}/replies
  │
  └─ 10. Audit Log & Counter Finalization
        ExecutionLog.update({ dmStatus: "SUCCESS", commentStatus: "SUCCESS" }).
        Increment user.dmsCountThisMonth by 1.
```

### C. SaaS Usage Quota & Reset Engine
- Usage limits are defined in `src/lib/plans.ts`:
  - **FREE:** 150 DMs / month, 1 Account.
  - **PRO:** 3,000 DMs / month, 1 Account ($5 / 50 DH).
  - **BUSINESS:** 15,000 DMs / month, 3 Accounts ($15 / 150 DH).
- When `checkUsageAllowed(userId)` is called:
  - Checks if `Date.now() - user.usageResetAt > 30 days`.
  - If expired: Resets `dmsCountThisMonth = 0` and sets `usageResetAt = new Date()`.
  - Evaluates `dmsCountThisMonth < dmsLimit`.

---

## 6. Production Deployment Status & Known Configurations

### Current Live Deployment
- **Production URL:** [https://autodms-project.vercel.app](https://autodms-project.vercel.app)
- **Deployment Platform:** Vercel (Edge Network + Serverless Functions)
- **GitHub Repository:** [https://github.com/yassinecodez/AutoDMs](https://github.com/yassinecodez/AutoDMs)
- **Branch:** `main`

### Environment Variables Checklist

| Variable Name | Purpose | Example / Format |
|---|---|---|
| `DATABASE_URL` | Supabase PostgreSQL Connection Pooler | `postgresql://postgres.[ref]:[pass]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase Direct PostgreSQL Connection | `postgresql://postgres.[ref]:[pass]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres` |
| `NEXTAUTH_SECRET` | NextAuth JWT signing key | 32+ character random string |
| `NEXTAUTH_URL` | Platform root URL | `https://autodms-project.vercel.app` |
| `ENCRYPTION_KEY` | AES-256-CBC token encryption key | Exactly 32 characters (`abcdefghijklmnopqrstuvwxyz012345`) |
| `META_APP_ID` / `INSTAGRAM_APP_ID` | Meta Developer App ID | `1041048208692049` |
| `META_APP_SECRET` / `INSTAGRAM_APP_SECRET` | Meta Developer App Secret | `41fed97dd8c8940e7b929984d3f16a5f` |
| `META_WEBHOOK_VERIFY_TOKEN` | Webhook verification handshake token | `autodms_secret_token_2026` |
| `META_API_VERSION` | Graph API version | `v24.0` |

### Architectural Decisions & Resolved Issues
1. **Serverless Direct Execution vs Local Redis:**
   - Previous versions used a local Redis/BullMQ background worker loop inside `src/instrumentation.ts`, causing server startup connection timeouts on Vercel.
   - The platform was refactored to **Direct Serverless Execution** inside Next.js Route Handlers with atomic database locks (`ExecutionLog.create()`), ensuring 100% serverless compatibility without external queue dependencies.
2. **Session Guarding:**
   - All server-rendered dashboard pages enforce strict session validation (`getServerSession(authOptions)`) with immediate redirect to `/login` if unauthenticated.
3. **Webhook Intake Fallbacks:**
   - Supports Meta Developer Dashboard test events (`entry.id === "0"`) by falling back to the first registered database account for live diagnostic debugging.

---

## 7. Redesign Objectives & Upcoming Roadmap

### Priority 1: Automated Payment Gateway & Tier Checkouts
- **Goal:** Integrate Moroccan (e.g., CMI, PayZone) and Global (Stripe, LemonSqueezy, Paddle) payment checkouts for automated upgrades to Creator Pro ($5 / 50 DH) and Business ($15 / 150 DH).
- **Files to touch:** `src/app/api/webhooks/stripe/`, `src/app/dashboard/settings/`.

### Priority 2: Multi-Account Selector in Automation Builder
- **Goal:** Allow Business/Agency tier users to select which connected Instagram account an automation rule belongs to (currently defaults to user-level rules).
- **Files to touch:** `src/components/AutomationBuilderClient.tsx`, `src/app/dashboard/automations/actions.ts`.

### Priority 3: AI Auto-Responder Engine (Gemini / GPT Integration)
- **Goal:** Optional AI-powered fallback when a commenter asks a complex question that doesn't match predefined keywords (e.g., "What sizes do you have in stock?").
- **Files to touch:** `src/app/api/webhook/instagram/route.ts`, `src/lib/aiResponder.ts`.

### Priority 4: Live Feed Media Carousel in Builder
- **Goal:** Improve Instagram Media fetcher (`/api/instagram/media`) with pagination and real-time reel thumbnail previews in Step 1 of the wizard.

---

## 8. Collaboration Guidelines for AI Assistant

When working on this repository, any external AI assistant (Gemini Spark, Antigravity, Claude, etc.) must adhere to the following rules:

1. **Strict Design System (Flat High-Contrast, Zero Gradients):**
   - **Background:** `#0B0F17`
   - **Cards & Containers:** Solid `#111827` with `#1F2937` 1px borders (`rounded-xl` or `rounded-2xl`).
   - **Primary Action Accent:** Solid Mint Green `#00DF81` (hover: `#00C770`, text: `#000000` on green buttons).
   - **Typography:** Sentence-case headlines (no ALL-CAPS titles). Primary text `#F9FAFB`, secondary `#9CA3AF`.
   - **No Violet/Purple:** All legacy violet styling has been replaced. Do not introduce purple gradients or neon glowing shadows.
2. **Database Integrity & Schema Changes:**
   - Never write raw SQL migrations manually. Always update `prisma/schema.prisma` and synchronize using `npx prisma db push`.
   - Always preserve backwards compatibility on existing `ExecutionLog`, `Automation`, and `IgAccount` columns.
3. **Meta API & Token Security:**
   - Never store raw Page Access Tokens in plain text. Always wrap tokens with `encrypt()` from `@/lib/crypto`.
   - Always decrypt tokens with `decrypt()` before making Meta Graph API calls.
   - Always retain the HMAC-SHA256 signature verification in webhook endpoints.
4. **Code Quality & Type Safety:**
   - Write strict TypeScript with explicit interfaces.
   - Avoid `any` types wherever possible.
   - Run `npm run build` locally before pushing to verify zero compile or lint errors.
5. **Deployment Protocol:**
   - Commit changes with semantic commit messages (e.g. `feat: ...`, `fix: ...`, `ui: ...`).
   - Push to remote `main` branch on GitHub (`https://github.com/yassinecodez/AutoDMs.git`).
   - Trigger Vercel production deployment via `npx vercel --prod --yes`.
