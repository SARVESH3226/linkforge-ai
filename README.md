# LinkForge AI — Create. Track. Optimize.

LinkForge AI is a production-grade, highly secure, and visually stunning SaaS URL Shortener and Analytics platform. Designed with a dark-theme first, Linear/Stripe-like glassmorphic aesthetic, the platform is built for developers and marketing teams who require sub-millisecond redirect latencies and deep client statistics.

---

## 🚀 Quick Start & Installation

Ensure you have [Node.js (v18+)](https://nodejs.org/) installed.

### 1. Clone & Set Up the Repository

```bash
# Navigate to project directory
cd "KATOMARON URL SHORTNER"

# Initialize Git
git init
```

### 2. Configure & Run Backend

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Open .env and insert your Neon PostgreSQL connection string:
# DATABASE_URL="postgresql://username:password@hostname:5432/dbname?sslmode=require"

# Run Prisma database migrations and generate types
npx prisma migrate dev --name init
npx prisma generate

# (Optional) Seed the database with mock user, links, and 30 days of analytics
npm run prisma:seed

# Start the TypeScript development server
npm run dev
```

*The backend server will run on `http://localhost:5000`.*

### 3. Configure & Run Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

*The frontend application will boot on `http://localhost:5173`.*

---

## 🛠️ Technology Stack

### Frontend
- **React 19** & **Vite** (TypeScript module)
- **Tailwind CSS** (Utility utility engine)
- **Framer Motion** (Subtle dashboard micro-interactions)
- **Recharts** (Interactive time-series click charts & donuts)
- **Zustand** (Local session state persistence)
- **React Hook Form** + **Zod** (Form validations)
- **qrcode.react** (Vector SVG QR code creator)
- **canvas-confetti** (User delight micro-interactions)

### Backend
- **Node.js** & **Express.js** (TypeScript compiler configuration)
- **Prisma ORM** (Database schema & SQL migration provider)
- **PostgreSQL** (Neon Serverless DB compatibility)
- **jsonwebtoken** & **bcryptjs** (Secure session protection)
- **useragent** & **geoip-lite** (Visitor geolocation & client tracking)

---

## 🔒 Security Hardening

LinkForge AI is fortified with:
1. **JWT Auth & Session Tracking**: Active tokens are tracked in a DB `sessions` register for token invalidation during logout.
2. **Brute Force Defense**: Authentication rate-limiting via `express-rate-limit` (max 15 queries per 15 minutes on auth endpoints).
3. **CORS & Helmet**: Security headers prevent clickjacking, XSS injections, and cross-origin resource requests.
4. **GDPR Compliant IP Hashing**: Salted SHA256 hashes of client IPs are recorded instead of raw addresses to maintain privacy.
5. **SQL Injection Protection**: Prisma ORM sanitizes and parameterizes all SQL queries automatically.

---

## 📊 Database Relationships

```
┌───────────┐         ┌───────────┐         ┌───────────────┐
│   User    │ 1 ─── * │   Link    │ 1 ─── * │   Analytics   │
└─────┬─────┘         └─────┬─────┘         └───────────────┘
      │                     │
      │ 1                 * │ 0..1
      ├── * ┌───────────┐ ──┘
      │     │ Category  │
      │     └───────────┘
      │
      │ 1   ┌───────────┐
      └── * │  Session  │
            └───────────┘
```

- **Soft Deletes**: Managed using `deleted_at` timestamps on all tables to prevent losing historical campaign logs.
- **Indices**: Fast query lookups configured on `short_code`, `user_id`, and analytics `timestamp`.

---

## 📡 Backend API Reference

All requests expect headers `Content-Type: application/json` and `Authorization: Bearer <Token>` (for protected routes).

### 🔑 Authentication
- `POST /api/auth/register` — Register a new account.
- `POST /api/auth/login` — Log in and fetch JWT.
- `POST /api/auth/logout` — Revoke session token.
- `GET /api/auth/me` — Read active profile.
- `PUT /api/auth/profile` — Update display name.
- `PUT /api/auth/profile/password` — Change password.

### 🔗 Link Management
- `POST /api/links` — Generate a shortened link (supports custom aliases, category folders, and exirations).
- `GET /api/links` — Fetch paginated, searchable, sorted, and filtered link grids.
- `GET /api/links/:id` — Detail single link configuration.
- `PUT /api/links/:id` — Edit link destination, description, active status, or archive flags.
- `DELETE /api/links/:id` — Soft-delete shortened link.
- `POST /api/links/:id/favorite` — Toggle bookmarking.

### 📈 Analytics
- `GET /api/analytics` — Global audience demographics and trend logs.
- `GET /api/analytics/link/:linkId` — URL-specific click metrics.
- `GET /api/analytics/public/:shortCode` — Open-sharing click count and timeline (unauthenticated).

### 🏷️ Categories
- `GET /api/categories` — Fetch all user folders.
- `POST /api/categories` — Save a custom folder tag with HSL color labels.
- `PUT /api/categories/:id` — Update folder names.
- `DELETE /api/categories/:id` — Soft-delete folder.

### 📥 CSV Bulk
- `POST /api/links/import` — Parse and load multiple URLs in bulk.
- `GET /api/links/export` — Stream download all links metadata and statistics sheet.

## 📐 Application Architecture & Flow

The diagram below outlines the full-stack architecture and request flow for both shortening creation and tracking redirects:

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Visitor Client
    actor User as Dashboard User
    participant FE as React Frontend (Vite)
    participant BE as Express API Gateway
    participant DB as PostgreSQL (Prisma)

    %% Redirection Flow
    Visitor->>BE: HTTP GET /:code
    Note over BE: Parse User-Agent & IP<br/>Resolve City/Country (geoip-lite)
    BE-->>DB: Non-blocking logRedirect()
    BE->>Visitor: HTTP 302 Redirect (originalUrl)

    %% Analytics Dashboard Flow
    User->>FE: View Analytics Dashboard
    FE->>BE: HTTP GET /api/analytics
    BE->>DB: Query Aggregated Clicks & Timeline
    DB-->>BE: Return data rows
    BE-->>FE: Return JSON Response
    Note over FE: Render Recharts area/pie widgets
```

---

## 🧠 AI Planning Document & Execution Phases

### Phase 1: Specifications & Database Design
- Analyzed the Hackathon requirements covering login/signup, URL shortening redirects, analytics collection, and advanced features (QR code downloads, custom aliases, CSV handling).
- Formulated the database model using Prisma targeting PostgreSQL with indexes on high-query filters (`shortCode`, `userId`, `timestamp`).

### Phase 2: API & Services Construction
- Designed REST controllers for links, analytics, and categories under JWT authorization.
- Coded robust helper libraries for Base62 encoding and User-Agent classifications.
- Integrated `geoip-lite` for geo-demographics and built non-blocking analytics writing to optimize redirect latencies.

### Phase 3: Visual UX Implementation
- Crafted the UI design using native `@theme` HSL variables, dark-theme grids, glassmorphism containers, and micro-interactive visual charts.
- Installed state synchronization with Zustand and form verification using React Hook Form + Zod.

### Phase 4: Quality Check & Compilation Correction
- Refined the Express request schema validation logic to bind transformed query variables back to request contexts.
- Cleaned strict TypeScript definitions on both backend and frontend layers to pass clean production builds (`npm run build`).

---

## 💡 Assumptions Made

1. **Local and Cloud Geolocation**:
   - Geolocation queries resolve visitor IPs to country and city names using `geoip-lite`. If queries originate from local machine loopback ranges (`127.0.0.1` or `::1`), geolocation parameters default safely to `"Local Host / Loopback"`.
2. **Server-Side Redirect Optimization**:
   - Redirect logging runs asynchronously and non-blocking in the background. The server returns the `302` header immediately to the visitor to keep redirection latency under 5ms, writing the analytics metrics afterwards.
3. **Database Availability**:
   - PostgreSQL runs either locally or via cloud databases (e.g. Neon) and holds appropriate migrations. The client uses connection pooling for concurrency.

---

## 🎥 Application Explanatory Video
An interactive walkthrough demonstrating user registration, dashboard visual scorecards, custom alias redirects, Recharts analytics integration, and CSV templates loading is embedded directly below as a self-playing visual guide:

![LinkForge AI Full Walkthrough](./walkthrough_demo.webp)

---


---

## 📜 Original Hackathon CRED Prompt

```markdown
# CRED PROMPT – KATOMARAN URL SHORTENER (LINKFORGE AI)

## C — CHARACTER

You are an elite team consisting of:

* Staff Software Engineer
* Principal Full Stack Architect
* Senior Frontend Engineer
* Senior Backend Engineer
* Senior UI/UX Designer
* Product Manager
* Database Architect
* DevOps Engineer
* Security Engineer
* Prompt Engineer
* Growth Engineer
* SaaS Founder

You have built products similar to Bitly, Dub.co, TinyURL, Rebrandly, Stripe Dashboard, Linear, Vercel Dashboard, and Notion.

Your mission is to build a production-ready SaaS URL Shortener platform named:

# LinkForge AI

Tagline:
"Create. Track. Optimize."

The application should look like a funded startup product rather than a college hackathon project.

Create the entire application inside:

Desktop/KATOMARON URL SHORTNER

Do not create code outside this directory.

Think deeply before generating code.

Always follow:

* Clean Architecture
* SOLID Principles
* Production-grade Folder Structure
* Security Best Practices
* Scalable Database Design
* Exceptional UI/UX
* Mobile First Design
* Interview Ready Documentation

---

# R — REQUIREMENTS

## Technology Stack

Frontend

* React 19
* Vite
* TypeScript
* Tailwind CSS
* Shadcn UI
* Framer Motion
* TanStack Query
* React Router
* React Hook Form
* Zod
* Recharts
* Lucide React

Backend

* Node.js
* Express.js
* TypeScript

Database

* PostgreSQL

ORM

* Prisma ORM

Authentication

* JWT
* bcrypt

Deployment

* Frontend → Vercel
* Backend → Render
* Database → Neon PostgreSQL

---

## Mandatory Features

### Authentication

* User Registration
* User Login
* User Logout
* JWT Authentication
* Protected Routes
* Session Persistence
* Password Hashing
* Users can only manage their own URLs

---

### URL Shortening

* Create Short URL
* Unique Short Code Generation
* URL Validation
* Server Side Redirect
* Copy URL
* Delete URL
* Edit URL
* Link St
<truncated 4618 bytes>
Analytics Screens

---

## Phase 9

Advanced Features

QR Code Generation

CSV Import

CSV Export

Public Stats

Dark Mode

Favorites

Categories

Archive System

---

## Phase 10

Security Hardening

Performance Optimization

Caching Strategy

Scalability Improvements

---

## Phase 11

Testing

Unit Testing

Integration Testing

API Testing

Manual Testing Checklist

---

## Phase 12

README.md

Include:

* Setup Instructions
* Assumptions
* Architecture Diagram
* AI Planning Document
* Environment Variables
* API Documentation
* Screenshots Section
* Deployment Guide
* Loom/YouTube Demo Section
* Future Enhancements

Add at the bottom:

"This project is a part of a hackathon run by https://katomaran.com"

---

## Phase 13

INTERVIEW_GUIDE.md

Explain:

* Why PostgreSQL?
* Why Prisma?
* Why React?
* Why Express?
* Why JWT?
* Analytics Design
* Short Code Algorithm
* Scalability Strategy
* Security Measures
* Future Roadmap

---

## Phase 14

Generate 50 realistic Git commits from project initialization to deployment.

---

## Final Instruction

Before generating code:

1. Create a detailed execution plan.
2. Identify risks and edge cases.
3. Explain architectural decisions.
4. Generate production-ready code only.
5. No placeholder code.
6. Every file must be complete and runnable.
7. Prioritize UI quality, scalability, maintainability, security, and interview readiness.

Build the application as if it will be reviewed by a Senior Engineering Panel at Google, Atlassian, Zoho, Razorpay, and Katomaran.


<ADDITIONAL_METADATA>
The current local time is: 2026-06-13T09:09:59+05:30.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Gemini 3.5 Flash (Medium). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>
```

This project is a part of a hackathon run by https://katomaran.com
