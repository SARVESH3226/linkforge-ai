# LinkForge AI — Technical Interview Guide

This guide details the architectural decisions, structural patterns, and core algorithms implemented in LinkForge AI.

---

## 🏗️ 1. Technology Decisions (The "Why")

### Why PostgreSQL?
- **Relational Integrity**: Shortlinks, user accounts, sessions, categories, and analytics are highly relational. Having native foreign key constraints ensures cascading integrity (e.g., when a user deletes their profile, active sessions and links clean up automatically).
- **Index Tuning**: PostgreSQL supports B-Tree indices on key columns like `short_code` and composite indices like `[userId, linkId]`, which speeds up lookup operations.
- **ACID Compliance**: Ensures that redirections and analytical logs are written reliably without database inconsistencies.

### Why Prisma?
- **Type Safety**: Automatically generates TypeScript types based on our `schema.prisma`. Any database structure changes trigger compiler checks, catching schema mismatch bugs before runtime.
- **Migrations System**: Simplifies tracking schema alterations using timestamped SQL change sheets.
- **Query Optimization**: Generates optimized queries under the hood, and batches requests (preventing classic N+1 query execution problems).

### Why React 19 & Vite?
- **Speed & HMR**: Vite leverages native ES Modules to compile page edits in milliseconds during development.
- **Component Model**: Encourages reusable structures (e.g., dashboard metric panels, input validations).
- **Virtual DOM**: Essential for fast updates when charts (built with Recharts) are re-rendered during search filter actions.

### Why Express.js?
- **Lightweight Framework**: Does not force opinionated directory logic. It enables clean SOLID separation between Controllers, Repositories, Services, and Middlewares.
- **Middleware Chain**: Allows inserting Zod validators, token check hooks, and rate limiters sequentially before hitting controllers.

### Why JWT (JSON Web Tokens)?
- **Stateless Authorization**: Saves the database from querying session records on every simple API request. The backend verifies signature keys locally in memory, keeping response rates under 15ms.
- **Revocation Safety**: Combined with a DB-backed `Session` table. In case of logout or security revocation, the session state is deleted, causing the stateless token verification block to deny entry.

---

## 🧮 2. Key Algorithms & System Designs

### Short Code Algorithm
LinkForge AI uses a cryptographically secure **Base62 random selection algorithm**:
1. Characters subset: `a-z`, `A-Z`, and `0-9` (exactly 62 character options).
2. For each new link, the server uses `crypto.randomBytes(6)` to obtain high-entropy numbers.
3. It maps each random byte index to our 62-character list, compiling a 6-character code (e.g., `Ab7X9K`).
4. **Collision Resolution**: Since random generations can theoretically collide, the service checks uniqueness against the database. If a clash is found, it retries up to 5 times.
   - *Entropy Space*: $62^6 \approx 56.8 \text{ billion}$ unique link configurations, minimizing collision probability to near-zero.

### Non-Blocking Analytics Logging
If a visitor clicks `https://linkforge.ai/goog`, the server must redirect them instantly (sub-millisecond latency) while recording visitor devices, countries, browsers, and timestamps.
- **Design**: The redirection router fetches the link configuration, issues the HTTP `302/307` redirect headers immediately, and calls the `AnalyticsService.logRedirect(...)` in a **non-blocking background task** (by not using `await`). The browser processes the redirect in parallel while the server executes the DB write in the background.

---

## 📈 3. Scalability & Security Strategy

### Scaling Database Traffic
1. **Read/Write Split**: Short URL lookups constitute 95% of traffic (heavy read), while analytics writes constitute the remaining 5%. Placing database read replicas behind a connection pooler (like PgBouncer) maintains low read latencies.
2. **IP Privacy (GDPR)**: Instead of storing visitor raw IP addresses, the platform creates an MD5/SHA256 hash using a server-side environment secret salt. This guarantees visitor anonymity while maintaining unique visitor counts.
3. **Caching (Future)**: Introduce a Redis caching gateway between Express and PostgreSQL. If a short code is checked, Express queries Redis first (1-2ms lookup). Only on cache misses does it access PostgreSQL.

### Security Hardening
- **Rate Limit Gates**: Defends endpoints against script attacks by capping connections per client IP.
- **Bcrypt Salts**: Hashes password strings using a work factor of 10, protecting credentials in case of database leaks.
- **Zod Sanitizers**: Rejects request payloads containing excessive lengths or unformatted fields.

---

## 🗺️ 4. Future Product Roadmap
1. **Custom Domains**: Allow enterprise users to connect custom CNAME domains (e.g., `links.mybrand.com`) to mask shorten codes.
2. **Team Workspaces**: Support shared dashboards where team members can collaborate, view analytics, and export CSV summaries.
3. **Webhook Notifications**: Trigger webhooks on click redirects to integrate LinkForge AI directly with Slack, Discord, or CRM panels.
