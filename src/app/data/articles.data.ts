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
    title: 'How We Reduced an API Response from 1.4 MB to 10 KB',
    date: 'Oct 2024',
    readTime: '6 min',
    content: `
## Context
The project metrics dashboard was the nerve center of our application, but it had a severe performance bottleneck. The frontend was receiving approximately 1.4 MB of raw data on initial load.

## The Problem
Our Angular application was burdened with performing heavy aggregations, grouping, and metric calculations on the client side. 

The consequences were immediate and noticeable:
- Extremely slow initial page loads
- High memory usage causing the browser to stutter
- Unnecessary network traffic slowing down users on poor connections

## Investigation
I profiled the payload using Chrome DevTools and identified that we were sending raw entity lists just to compute summaries. We realized that the frontend only needed the final metric numbers, not the entire dataset.

## Solution
We moved the calculations entirely into PostgreSQL. I replaced the basic ORM calls with highly optimized, raw SQL queries utilizing:
- \`SUM\` and \`COUNT\` for base metrics
- \`CASE\` for conditional aggregations
- \`GROUP BY\` to consolidate records

Instead of transferring thousands of rows, the database computed the exact numbers and returned a single JSON object.

## Results
- **1.4 MB → 10 KB**: A ~95% reduction in payload size.
- **50–90% faster responses**: The API became lightning fast.

## Lessons Learned
1. **Transfer information, not raw data**: The network is the most expensive layer.
2. **Databases are optimized for aggregation**: Let PostgreSQL do what it does best.
3. **Measure before optimizing**: We only knew where to look because we profiled the payload first.
    `
  },
  {
    id: 'real-time-collaboration',
    title: 'Designing Real-Time Collaboration with NestJS, Socket.IO and Redis',
    date: 'Aug 2024',
    readTime: '8 min',
    content: `
## Problem
Users on our platform needed to collaborate seamlessly. This meant instantly seeing activity updates, presence indicators, and entity selections without ever refreshing the page.

## Challenges
While a single-server Socket.IO implementation is straightforward, it completely falls apart in a multi-instance deployment. If User A connects to Instance 1, and User B connects to Instance 2, they cannot communicate natively.

## Architecture
To solve this, I designed a scalable real-time microservice:
1. **Angular Client**: Connects via WebSockets.
2. **Socket.IO Gateway**: Handles connections and auth.
3. **Redis Pub/Sub**: Bridges communication across all Node instances.
4. **Project Rooms**: Scoped event broadcasting.

## Room Design
I utilized Socket.IO's "rooms" feature, dynamically assigning users to a room named after their active project ID. This ensured that a user updating Project A wouldn't spam events to users viewing Project B.

## Presence Tracking
When users connect, they emit a "join" event. We track their socket ID and user ID in a centralized Redis store. When they disconnect (or miss a heartbeat), Redis removes them, and a "user_left" event is broadcasted.

## Scaling
By introducing the \`@socket.io/redis-adapter\`, every event emitted by an instance is published to Redis, which then broadcasts it to all other instances. This allows us to scale horizontally to infinite nodes.

## Lessons
Building real-time systems is fundamentally more about **distributed state management** than it is about websockets.
    `
  },
  {
    id: 'presence-tracking',
    title: 'Building Presence Tracking for Collaborative Applications',
    date: 'Jul 2024',
    readTime: '7 min',
    content: `
## Problems
Building a real-time collaborative app introduces a deceptively hard problem: Presence.
How do you reliably know:
- Who is online right now?
- Who just left abruptly (e.g., closing the laptop lid)?
- Who is actively viewing a specific project?

## Solution

### Socket Rooms
We scope presence to specific "Rooms". Instead of knowing if a user is just "online", we know if they are "viewing Project 123". This is done by having the client join a room upon component initialization.

### Heartbeats
WebSockets can drop without firing a disconnect event (half-open connections). We implemented a Ping/Pong heartbeat strategy. If a client doesn't respond to a Ping within 10 seconds, the server forcefully closes the socket and updates their status.

### LastSeenAt
Every time a user interacts, we update a \`LastSeenAt\` timestamp in Redis. This provides a fallback mechanism to clean up "ghost" sessions via a CRON job.

### Reconnection Handling
When a user regains internet, Socket.IO automatically reconnects. The server detects this, restores their session from Redis, and broadcasts a "user_rejoined" event so the UI can remove their "offline" indicator.
    `
  },
  {
    id: 'jwt-auth-system',
    title: 'Designing a JWT Authentication System That Can Scale',
    date: 'Jun 2024',
    readTime: '10 min',
    content: `
## Requirements
We needed an authentication architecture that supported secure access for both web and mobile clients, utilizing OTP (One Time Password) login.

## Architecture Flow
1. **Client** requests an OTP.
2. **NestJS API** generates an OTP, stores it in Redis, and sends an SMS/Email.
3. **Client** submits the OTP.
4. **API** verifies it against Redis and issues a short-lived **JWT Access Token** and a long-lived **Refresh Token**.

## Why OTP lives in Redis
Storing OTPs in PostgreSQL is an anti-pattern. We chose Redis because:
1. **Native TTL (Time to Live)**: OTPs expire automatically without cron jobs.
2. **Fast Lookup**: Sub-millisecond verification.
3. **No Database Pollution**: OTPs are ephemeral; they shouldn't bloat the primary datastore.

## Refresh Token Rotation
We implemented Refresh Token Rotation for strict security. Every time a refresh token is used, a new one is issued.
- **Token Family**: Refresh tokens are linked to a specific device session.
- **Reuse Detection**: If an old refresh token is reused, we assume the token was compromised. The system immediately revokes the *entire* token family, forcing the user to log in again.

## Lessons
Authentication is a living system, not just a login page. Designing for security means designing for the worst-case scenario (compromised tokens).
    `
  },
  {
    id: 'enterprise-intern',
    title: 'What Building Enterprise Software Taught Me After Joining as an Intern',
    date: 'May 2024',
    readTime: '5 min',
    content: `
## First Day
When I started my journey, I thought software development was just writing algorithms and building pristine, greenfield projects like the ones in tutorials.

## Reality
I quickly learned that enterprise software is an entirely different beast. It involves:
- Navigating and refactoring legacy code.
- Managing strict performance concerns at scale.
- Ensuring rock-solid data consistency.
- Handling unpredictable user expectations.

## Biggest Lessons

### 1. Code is read far more than it is written.
Writing clever, unreadable code is a liability. Writing boring, clear, and well-documented code is a superpower.

### 2. Performance matters.
An unoptimized query that takes 200ms on a dev machine might take 5 seconds under production load. Always think about scale.

### 3. Communication matters.
The hardest part of engineering isn't writing code; it's understanding the business requirements and communicating technical trade-offs to non-technical stakeholders.

### 4. Shipping beats perfection.
A perfect feature sitting in a branch delivers zero value. Deliver iteratively, gather feedback, and improve.

## Conclusion
My engineering mindset shifted from "how can I build this?" to "how can I build this so it's maintainable, scalable, and valuable?" This transition is what separates junior coders from true engineers.
    `
  }
];
