export interface Article {
  id: string;
  title: string;
  date: string;
  readTime: string;
  content: string;
}

export const ARTICLES: Article[] = [
  {
    id: 'api-payload-reduction',
    title: 'Cutting Dashboard Load Times by 95% — Moving Aggregation Where It Belongs',
    date: 'Oct 2024',
    readTime: '7 min',
    content: `
## The Business Challenge

Imagine a procurement manager overseeing a hotel renovation — 400 furniture specifications, dozens of purchase orders, vendor bids arriving daily, and a hard deadline before the hotel opens. Their project metrics dashboard is the command center. Except it takes 5+ seconds to load.

On an enterprise procurement platform I helped build, the metrics dashboard was receiving approximately **1.4 MB of raw data** on every page load. The Angular frontend was responsible for performing all the aggregations — computing budget summaries, PO totals, invoice balances, and specification costs — entirely in the browser.

## Why This Is Technically Hard

The naive instinct is to "just optimize the query." But the real problem was architectural. The API was designed as a thin pass-through: it fetched raw entity lists (specifications, purchase orders, invoices) and handed them to the frontend. The frontend then ran expensive \`reduce()\` and \`filter()\` operations across thousands of records on every render.

The consequences were compounding:
- **Slow initial page loads** — users waited 5+ seconds before seeing any data
- **Browser main-thread blocking** — the aggregation work caused visible stutter and froze the UI
- **Wasted bandwidth** — users on poor connections (hotel construction sites, warehouses) suffered the most
- **Stale data** — because loading was so expensive, the app avoided re-fetching, so numbers would drift from reality

## What We Built

We attacked the problem from two directions:

### Server-Side Aggregation
I replaced the basic ORM calls with optimized SQL queries that computed the final metric numbers directly in PostgreSQL:

- \`SUM\` and \`COUNT\` for base financial metrics (budgeted amounts, paid totals)
- \`CASE\` expressions for conditional aggregations (e.g., "total value of specs where PO status is 'Approved'")
- \`GROUP BY\` to consolidate records by project, vendor, and budget area
- \`ARRAY_AGG\` for collecting related entity IDs without separate round-trips

Instead of transferring thousands of rows for the frontend to crunch, the database computed the exact numbers and returned a single JSON object.

### On-Demand Data Loading
On the frontend, I dismantled the bulk-loading pattern that had become the default. Instead of loading the entire specification tree, expediting headers, journal entries, and budget areas on project open, each component now fetches its own data when the user navigates to it.

I built dedicated Angular services for on-demand fetching — journal entries loaded only when the user opens the bidding panel, expediting headers fetched only when the timeline view is active, budget areas pulled only when the budget tab is selected.

## The Result

- **1.4 MB → 10 KB**: A ~99% reduction in initial dashboard payload
- **50–90% faster responses**: Metrics dashboards now render in under 200ms
- **Zero browser blocking**: The main thread stays free for user interaction
- **Fresher data**: Because fetching is cheap, we can re-fetch on every navigation without penalty

For the procurement team, this meant they could pull up real-time budget summaries during live client meetings — fast enough that the data was ready before they finished their sentence.

## What This Means for Your Project

If your users are staring at loading spinners, the problem is rarely the database — it's usually the architecture around it. Moving computation to where it belongs (the database for aggregation, the server for transformation) and fetching data on-demand instead of in bulk can turn a sluggish application into one that feels instant. The key insight: **transfer information, not raw data**.
    `
  },
  {
    id: 'real-time-collaboration',
    title: 'Engineering Real-Time Collaboration for a Multi-Stakeholder Procurement Platform',
    date: 'Aug 2024',
    readTime: '10 min',
    content: `
## The Business Challenge

On an enterprise procurement platform serving the hospitality industry, multiple stakeholders — procurement managers, designers, vendors — work on the same project simultaneously. When a manager updates a purchase order while a colleague is reviewing the same specification in another tab, they need to know:

- Who else is viewing this project right now?
- What entity is each person looking at?
- What changed while I was offline?

Without real-time collaboration, teams were constantly refreshing the page, overwriting each other's work, and making decisions based on stale data. For a platform managing multi-million dollar hotel renovations, this wasn't just inconvenient — it was operationally dangerous.

## Why This Is Technically Hard

A single-server Socket.IO implementation is straightforward. The hard problems emerge at scale:

**Multi-instance communication**: If User A connects to Instance 1 and User B connects to Instance 2, they can't communicate natively. In a horizontally scaled deployment behind a load balancer, this is the default scenario.

**Presence reliability**: WebSocket connections can drop silently. A user closes their laptop lid, loses Wi-Fi on a construction site, or their browser crashes — the server may never receive a clean disconnect event. These "half-open connections" create ghost users that pollute presence indicators.

**Offline resilience**: If a user goes offline for 10 minutes and comes back, they need to see everything that changed — not a stale snapshot from 10 minutes ago.

**Race conditions**: When a user rapidly switches between projects, joins and leaves overlap. Without sequential operation guarantees, database state can become inconsistent with socket room state.

## What We Built

I designed and built a dedicated real-time microservice as a standalone NestJS application — fully separate from the main API service. Here's the architecture:

### Room-Based Communication
Users are dynamically assigned to Socket.IO rooms named after their active project (e.g., \`project:142\`). When a procurement manager updates a specification in Project 142, only users viewing that project receive the event. A vendor reviewing bids on Project 87 is never spammed with irrelevant traffic.

### Custom Heartbeat Monitoring
I built a custom Ping/Pong service instead of relying solely on Socket.IO's built-in heartbeat. The server sends a ping every 5 seconds. If a client doesn't respond within 3 seconds, it counts as a missed pong. After 3 consecutive misses, the server forcefully disconnects the socket and marks the user offline in all their rooms.

This catches the cases Socket.IO's built-in detection misses — like a user losing Wi-Fi without closing the tab.

### Sequential Operation Chains
When a user joins a room, multiple database operations happen: check existing membership, clear previous room if switching projects, create new membership, emit events. If two join events arrive in rapid succession (e.g., user double-clicks), they could interleave and corrupt state.

I solved this with a per-user operation chain pattern — each user's operations execute sequentially through a promise chain, preventing race conditions without a global mutex that would bottleneck all users.

### Entity Focus Tracking
Beyond basic presence ("User X is online"), we track what specific entity each user is focused on. When a procurement manager selects Specification 234, every other user in that project room sees a real-time indicator — preventing two people from editing the same record simultaneously.

### Offline Message Reconstruction
When a user disconnects (intentionally or due to network issues), we record a \`lastSeenAt\` timestamp. If other users make changes while they're offline, those changes are queued in the database. When the user reconnects, a data reconstruction service replays all missed events chronologically — they see everything they missed without a full page refresh.

### WebSocket Authentication
Every socket connection is authenticated at the handshake level. The custom adapter verifies JWT tokens using the same multi-strategy verification chain as the main API — no unauthenticated user can join a room or receive entity events.

## The Result

- **Sub-100ms event delivery** across all connected users in a project room
- **Zero ghost users** — the heartbeat system reliably detects and cleans up stale connections within 15–20 seconds
- **Seamless offline recovery** — users returning from disconnection receive missed events without manual refresh
- **Horizontally scalable** — the architecture supports adding nodes without any user-facing impact

## What This Means for Your Project

Real-time collaboration is fundamentally a **distributed state management problem**, not a WebSocket problem. The transport layer is the easy part. The hard parts — reliable presence, offline resilience, race condition prevention, and authenticated access — are where most implementations fail. If your platform has multiple users working on shared data, investing in these foundations early will save you months of debugging stale-state bugs in production.
    `
  },
  {
    id: 'audit-pipeline',
    title: 'Building a Real-Time Audit Pipeline: From Database Triggers to BigQuery',
    date: 'Mar 2025',
    readTime: '9 min',
    content: `
## The Business Challenge

On an enterprise procurement platform, every change matters. When a bid line is modified, an invoice amount is adjusted, or a specification is updated, stakeholders need to know **who changed what, when, and what the previous value was**. This isn't just a nice-to-have — in hospitality procurement involving millions of dollars across dozens of vendors, an auditable change history is a contractual and operational requirement.

The existing system had no centralized audit trail. Changes were scattered across application logs, and reconstructing "what happened to this purchase order last Tuesday" required a developer to manually dig through server logs. For a platform processing hundreds of specification changes daily across multiple active projects, this was unsustainable.

## Why This Is Technically Hard

Building an audit system sounds simple: just log every write. But at enterprise scale, several problems make it genuinely complex:

**Performance impact**: Logging every database write synchronously adds latency to every user action. If the audit system is slow or fails, it drags down the entire application.

**Transaction context**: When a procurement manager updates a specification, the database sees a SQL \`UPDATE\` — it doesn't inherently know which *user* triggered it. Connecting a database-level change to a specific user requires threading context through every layer of the stack.

**Data sensitivity**: Audit logs must capture meaningful before/after values without leaking sensitive fields (passwords, tokens, internal IDs) into a data warehouse.

**Reliability at scale**: With multiple microservices writing to the same database, audit events can arrive out of order, fail silently, or create duplicate entries. The pipeline must handle all of these gracefully.

## What We Built

I designed and implemented a multi-stage event pipeline that captures changes at the database level and streams them into Google BigQuery for long-term analysis.

### Stage 1: PostgreSQL Triggers via pg_notify

Instead of relying on application-level logging (which can be bypassed), I wrote database migrations that install PostgreSQL triggers on critical tables — specifications, bid lines, invoices, and purchase orders. When a row is inserted, updated, or deleted, the trigger fires a \`pg_notify\` event containing the table name, operation type, and affected row ID.

This approach captures changes regardless of which microservice made them — whether it's the main API, the aggregator service, or even a manual database migration.

### Stage 2: Kafka Event Stream

A dedicated database monitor service listens for \`pg_notify\` events and publishes them to Apache Kafka topics. Kafka serves as the durable event backbone — if downstream consumers are temporarily unavailable, events are retained and replayed when they come back online.

I also integrated a **dead letter queue** for events that fail processing after multiple retries. Instead of losing failed events or blocking the pipeline, they're routed to a separate topic for manual investigation — ensuring zero data loss even during system failures.

### Stage 3: User Activity Processor

Inside the aggregation microservice, a Kafka consumer processes user activity events one-by-one. For each event, it:

1. Resolves the user who triggered the change (using transaction-level context set via Sequelize hooks and async local storage)
2. Fetches the before/after state of the affected entity
3. Strips sensitive fields from the payload
4. Handles soft-deleted entities gracefully (entities marked inactive, not physically removed)

### Stage 4: BigQuery Data Warehouse

Processed audit records are batch-loaded into Google BigQuery using a custom client service and batch loader. I built the BigQuery schema definitions, configured cron schedules for batch uploads, managed credential injection across environments, and set cleanup thresholds for processed records.

The result is a queryable data warehouse where stakeholders can run SQL queries like: *"Show me every change to specifications on Project 142 in the last 30 days, grouped by user."*

## The Result

- **Complete audit coverage** — every meaningful entity change is captured, regardless of which service triggers it
- **Zero application-layer performance impact** — triggers fire asynchronously via pg_notify, not in the request path
- **Fault-tolerant pipeline** — Kafka guarantees at-least-once delivery; dead letter queues catch failures
- **Queryable history** — BigQuery enables ad-hoc analysis that previously required a developer to manually search server logs

## What This Means for Your Project

If your platform handles sensitive data or financial transactions, audit logging isn't optional — it's infrastructure. The key architectural decision is **where** to capture changes. Application-level logging is fragile (it can be bypassed, forgotten, or inconsistent across services). Database-level triggers with an event-driven pipeline ensure nothing slips through the cracks, while keeping your application code clean and your write path fast.
    `
  },
  {
    id: 'securing-websockets',
    title: 'Securing WebSocket Connections in a Multi-Portal Enterprise Platform',
    date: 'Sep 2024',
    readTime: '7 min',
    content: `
## The Business Challenge

An enterprise procurement platform I worked on serves five distinct user types: internal procurement managers, hotel owner clients, interior designers, equipment vendors, and shipping coordinators. Each accesses the platform through different portals with different permission levels.

When we introduced real-time collaboration via WebSockets, a new security surface opened up. HTTP APIs have well-established patterns for authentication and authorization — middleware chains, JWT verification, role-based guards. But WebSocket connections are persistent, stateful, and fundamentally different from request-response HTTP. Applying the same security model required deliberate architectural decisions.

## Why This Is Technically Hard

WebSocket security differs from HTTP security in several critical ways:

**Authentication happens once**: An HTTP request includes credentials on every call. A WebSocket authenticates at the handshake and then stays open indefinitely. If a token expires mid-session, the connection doesn't automatically close — it silently becomes unauthorized.

**No middleware chain**: Express/NestJS middleware runs per-request. WebSocket events don't pass through the same middleware stack. Authentication must be implemented separately at the gateway level.

**Broadcast amplification**: A single malicious or buggy connection that joins the wrong room could receive data about projects, specifications, and financial details it shouldn't have access to. The blast radius of a security gap in WebSockets is much larger than a single API endpoint.

**Multiple auth strategies**: The platform uses JWT tokens for browser sessions, Redis-backed tokens for automated portal access and password resets, and internal service tokens for inter-service communication. The WebSocket layer needs to support all of these.

## What We Built

### Handshake-Level Authentication

I implemented a custom Socket.IO adapter that intercepts every connection attempt before it reaches the gateway. The adapter extracts the token from \`socket.handshake.auth\` and runs it through a multi-strategy verification chain:

1. **JWT verification** — Standard browser session tokens, verified against the signing secret
2. **Redis token verification** — Short-lived, purpose-scoped tokens (e.g., password reset flows) stored in Redis with native TTL expiration
3. **Internal service tokens** — Used for inter-service communication, verified against environment-scoped secrets

If all strategies fail, the connection is rejected before the socket is registered — no events are emitted, no rooms are joinable.

### Authenticated User Context

On successful verification, the decoded user identity is attached to \`socket.data.user\`. Every subsequent event handler (\`JOIN_ROOM\`, \`LEAVE_ROOM\`, \`CLIENT_FOCUS_ENTITY\`) reads the user ID from this authenticated context — never from the client payload.

This prevents a class of attacks where a malicious client sends forged user IDs in event payloads. The server always trusts the handshake-verified identity over anything the client sends.

### Room-Scoped Authorization

Users can only join rooms for projects they're authorized to access. The room join handler validates the user's membership before allowing the socket to subscribe to a room's events. This ensures that even if a valid user tries to listen to a project they don't belong to, the server rejects the request.

### Graceful Session Invalidation

When a user explicitly logs out, the client emits a \`CLIENT_LOGOUT\` event. The server marks the socket with an \`isLoggedOut\` flag before disconnecting — ensuring the disconnect handler doesn't broadcast misleading "user went offline" events. The distinction matters: logging out and losing your internet connection are different events that other users should interpret differently.

## The Result

- **Zero unauthenticated connections** — every socket is verified before it can receive any data
- **Identity cannot be spoofed** — user context comes from the verified token, never from client payloads
- **Clean session lifecycle** — logout vs. disconnect are handled as distinct events with different broadcast behavior
- **Multi-strategy auth** — browser sessions, portal tokens, and service-to-service calls all work through the same verification chain

## What This Means for Your Project

If you're adding real-time features to a platform with multiple user types or portals, don't treat WebSocket security as an afterthought. HTTP security patterns don't transfer directly — you need handshake-level verification, server-side identity management, and room-scoped authorization. The cost of getting this wrong is silent data leakage across user boundaries, and you may not discover it until a client reports seeing data they shouldn't.
    `
  },
  {
    id: 'enterprise-engineering',
    title: 'What Working on a 30-Module Monorepo Taught Me About Building Software That Lasts',
    date: 'May 2024',
    readTime: '6 min',
    content: `
## The Starting Point

When I joined a team building an enterprise procurement platform for the hospitality industry, I expected a single codebase with a frontend and a backend. What I found was a monorepo containing over 30 modules — a main API service, a second API service, a real-time socket microservice, a financial aggregation engine, a Kafka event pipeline, a database monitoring service, shared ORM and commons libraries, and separate portals for administrators, clients, vendors, and designers.

The platform manages the entire lifecycle of hotel renovation projects — from furniture specifications and vendor bids to purchase orders, invoices, and check printing. Hundreds of specifications per project, dozens of active projects at any time, and a small team of highly-skilled users who depend on the system being fast, accurate, and always available.

Working on a system of this complexity fundamentally changed how I think about writing software.

## Shared Libraries Over Copy-Paste

The monorepo has shared libraries — a commons package for types, constants, and entity definitions, a shared ORM layer for database models and model services, and common NestJS utilities used across every microservice. When I needed to add a new entity type (e.g., user activity logs), I didn't add it in one service. I defined the entity in the commons library, created the Sequelize model in the shared ORM, registered it in the entity constants, wrote the database migration, and then consumed it from the aggregator service.

This felt slow at first. But the alternative — defining the same type in three services independently — creates drift. Types diverge, field names become inconsistent, and bugs become invisible until they hit production. The shared library approach means a single source of truth. When you change it, every consumer updates together.

## Consistency Over Cleverness

The codebase follows strict patterns: every model has a model service, every service has a repository, validation results follow a shared interface, response builders construct payloads consistently. My early instinct was to write "better" or "simpler" code that deviated from these patterns. I learned quickly that in a multi-developer, multi-service codebase, **predictability is more valuable than elegance**.

When another developer opens a file I wrote, they should immediately know where to find the validation logic, where the database calls happen, and how errors are handled — because it follows the same pattern as every other module. Boring, readable code is a superpower in enterprise systems.

## Measure Before Optimizing

The API payload reduction work I did only happened because we profiled the network tab and saw a 1.4 MB response. The heartbeat system in the socket service only exists because we observed ghost users in production — connections that appeared online but were actually dead. The on-demand data loading refactor only happened because we measured which data was being fetched but never displayed.

Every meaningful optimization started with measurement, not intuition. The instinct to "make it faster" without data leads to premature optimization of the wrong thing. Profiling first ensures you're solving the actual bottleneck.

## Communication Is the Hardest Engineering Skill

The hardest part of working on this platform wasn't writing code — it was understanding the domain. Procurement workflows have nuanced rules: a specification can only appear on one purchase order, invoices generate submittals that get sent to clients for funding, vendors bid on groups of specifications, and the entire pipeline has dependencies that determine whether a hotel opens on time.

Translating these business rules into technical decisions — which tables to join, what events to broadcast, how to handle edge cases when a vendor updates a bid after the PO is generated — required constant communication with domain experts. The engineers who wrote the best code were the ones who understood the business deeply enough to anticipate requirements before they were articulated.

## Shipping Beats Perfection

A perfect feature sitting in a branch delivers zero value. I learned to ship iteratively — get the core functionality into production, observe how it behaves under real usage, then refine. The heartbeat system started with conservative 10-second intervals, then we tuned it to 5 seconds after observing that the original setting was too slow to detect disconnections during live user sessions. The audit pipeline started without a dead letter queue, and I added it after we observed that certain edge cases (soft-deleted entities, transaction context missing) caused silent failures.

## What This Means for Your Project

These principles shape how I approach every engagement:
- **Build for the team that maintains it**, not just the user who requests it
- **Measure before optimizing** — intuition about performance bottlenecks is usually wrong
- **Invest in shared foundations** — types, models, and patterns that are consistent across your codebase prevent entire categories of bugs
- **Ship and iterate** — production is the only environment that tells you the truth
    `
  }
];
