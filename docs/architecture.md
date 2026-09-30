# Cartiva — Architecture

Two views of the same system: what it does for the business, and how it's built.
Reference: `ShopAssist_Ecommerce_Salesforce_Apex_POC_Requirements.md`.

---

## Part 1 — Business Perspective

### 1.1 The problem this solves

A customer buys something. Something goes wrong with the order. Today, in most small
e-commerce setups, that complaint lands in a generic inbox or a spreadsheet — no
classification, no priority, no SLA, no accountability, no visibility for the customer.

Cartiva demonstrates the alternative: the complaint becomes a structured, prioritized,
tracked **Case** in a real CRM (Salesforce) within seconds of the customer submitting it,
with zero manual triage effort from a human — and the customer can watch it move from
"Submitted" to "Resolved" without ever calling anyone.

### 1.2 Who's involved

| Actor | What they do | What they get |
|---|---|---|
| **Customer** | Browses, buys, and (if something's wrong) reports an issue against a specific order | A storefront that feels like Amazon/Shopify, and a ticket they can track to resolution |
| **Support Agent** | Works Cases inside Salesforce | Every Case arrives pre-classified — category, priority, team, SLA — with the reasoning attached, so triage time drops to zero |
| **Business/Ops** | Owns the rules (which keywords map to which category/priority/team/SLA) | Rules live in data (`Case_Triage_Rule__c`), not code — can be tuned without an engineering release |

### 1.3 The business journey

```text
Customer buys running shoes
        │
        ▼
Package doesn't arrive on time
        │
        ▼
Customer opens the order → "Report an Issue" → picks "Delivery Issue" → describes the problem
        │
        ▼
Ticket TCK-10023 created instantly (customer sees it immediately, no waiting)
        │
        ▼
Behind the scenes: a Salesforce Case is created and automatically triaged
        │
        ├── Category   = Delivery
        ├── Priority   = High           (business rule: "delayed" → High)
        ├── Team       = Logistics
        └── SLA        = 8 hours        (the team has 8 hours to act, by policy)
        │
        ▼
A Logistics agent sees the Case in their queue — already classified, already prioritized
        │
        ▼
Agent investigates, changes status to "In Progress", eventually resolves:
        "Shipment was delayed by the courier and is scheduled for delivery tomorrow."
        │
        ▼
Within 30 seconds, the customer's ticket page shows: Resolved, with that exact message
```

No human ever manually read the description to figure out what team should own it, how
urgent it was, or what SLA applied. That decision is instant, consistent, and auditable.

### 1.4 The business rules (what drives classification)

These are the actual levers the business controls — stored as data
(`Case_Triage_Rule__c` records), not hardcoded logic:

| Category | Example trigger phrase | Default Priority | Owning Team | SLA |
|---|---|---|---|---|
| Delivery | "package", "shipment", "arrived" | Medium | Logistics | 24h |
| Delivery | "delayed", "late" | High | Logistics | 8h |
| Product Issue | "damaged", "broken", "defective" | High | Product Support | 8h |
| Product Issue | "wrong product", "missing item" | Medium | Product Support | 24h |
| Payment | "fraud", "unauthorized" | **Critical** | Payments | 2h |
| Payment | "payment failed" | High | Payments | 4h |
| Payment | "payment", "charged", "card" | Medium | Payments | 24h |
| Return | "return", "send back" | Medium | Returns | 24h |
| Refund | "refund", "money back" | Medium | Finance | 24h |
| Cancellation | "cancel", "cancellation" | Medium | Order Management | 24h |
| *(no match)* | anything else | Low | General Support | 48h |

When two rules match the same description, the **more severe one wins** (Critical beats
High beats Medium beats Low) — e.g. "my payment failed" matches both "payment" (Medium)
and "payment failed" (High); the customer gets the High-priority, faster-SLA outcome.

An agent can always override any of these fields — the override is itself recorded as an
audit entry (`Case_Triage_Decision__c`, source = "Manual Override"), so there's a permanent
record of what the rule engine decided versus what a human changed and why.

### 1.5 What "done" looks like (success criteria)

The closed loop, per the requirement doc's §46:

```text
Customer places order → reports a problem → ticket exists immediately
   → Salesforce Case auto-classified (category/priority/team/SLA, zero human effort)
   → agent resolves it in Salesforce
   → resolution appears on the customer's ticket page within 30 seconds
```

Everything in between — the Spring Boot backend, the Salesforce integration, the Apex
rule engine — exists to make that one sentence true.

---

## Part 2 — Technical Perspective

### 2.1 System overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER (Browser)                          │
└──────────────────────────────┬────────────────────────────────────┘
                                │ HTTP
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│              REACT STOREFRONT  (frontend/, Vite, :5173)             │
│  Home · Products · Cart · Checkout · My Orders · Tickets · Support  │
│  React Router · Context (cart) · fetch-based API client             │
└──────────────────────────────┬────────────────────────────────────┘
                                │ REST (/api/**, proxied to :8080 in dev)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│           SPRING BOOT BACKEND  (backend/, Docker, :8080)            │
│                                                                       │
│  controller/  →  service/  →  repository/  →  H2 (file-based)       │
│                       │                                              │
│                       ▼                                              │
│                 salesforce/ package                                  │
│         SalesforceClient · SalesforceCaseService · SalesforceMapper │
│                       │                                              │
│                 sync/ package                                        │
│      CaseStatusPollingJob (30s)  ·  TicketSyncRetryJob (60s)         │
└──────────────────────────────┬────────────────────────────────────┘
                                │ Salesforce REST API (OAuth2 JWT Bearer)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SALESFORCE ORG (case-triage-poc)                │
│                                                                       │
│  Standard: Account, Contact, Case                                    │
│  Custom:   Case_Triage_Decision__c (audit) · Case_Triage_Rule__c     │
│            (config-as-data rules)                                    │
│                                                                       │
│  CaseTrigger → CaseTriggerHandler → CaseTriageService                │
│       ├── CaseCategoryService   (keyword match + severity tie-break) │
│       ├── CasePriorityService   (severity ranking)                   │
│       ├── CaseAssignmentService (team lookup)                        │
│       └── CaseSLAService        (SLA hours + due-date calc)          │
│                                                                       │
│  CaseTriageOverrideController · CaseResolutionController             │
│  LWC: caseTriageDashboard · caseTriageDetail                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Why three tiers, and why each technology

| Tier | Technology | Why |
|---|---|---|
| Frontend | React + Vite + React Router | Fast dev loop, no build-tool ceremony for a POC; Vite's dev proxy sidesteps CORS entirely |
| Backend | Spring Boot 3 (Java 21) | Doc's stated stack; clean layering (controller/service/repository) maps directly to the doc's §20 structure |
| Backend DB | H2 (file-based) | Zero external dependency for local dev — no Postgres container needed, still persists across restarts via a mounted volume |
| CRM | Salesforce (Apex) | System of record for the Case lifecycle; doc's explicit requirement; reused from the original Case-Triage POC almost unchanged |
| Backend↔Salesforce | REST API, OAuth2 **JWT Bearer** flow | The doc originally called for OAuth; username-password flow turned out to be blocked at the org level (Setup → OAuth and OpenID Connect Settings → "Allow OAuth Username-Password Flows" is off by default in orgs created Summer '23+, and not always admin-togglable). JWT Bearer is the correct pattern for unattended server-to-server integration anyway — no password in flight, immune to MFA policy, a signed assertion instead |

### 2.3 Backend package structure (why it's segregated this way)

```text
com.cartiva.backend
├── model/        JPA entities — Customer, Product, Order, OrderItem, Ticket (+ enums)
├── repository/   Spring Data JPA interfaces — one per entity, no business logic
├── dto/          Request/response records — controllers never leak entities over the wire
├── service/      Business orchestration — CustomerService, ProductService, OrderService,
│                 TicketService, SalesforceService (backend→Salesforce direction only)
├── controller/   REST endpoints — thin, delegate to service/ immediately
├── salesforce/   Salesforce-only concerns, zero repository access:
│                 SalesforceClient    (JWT signing, token cache, raw REST calls)
│                 SalesforceCaseService (Case/Contact CRUD, SOQL)
│                 SalesforceMapper    (field-level Ticket↔Case translation)
├── sync/         Scheduled jobs — CaseStatusPollingJob (Salesforce→backend),
│                 TicketSyncRetryJob (backend→Salesforce retry for failed sends)
├── config/       SalesforceProperties, SchedulingConfig, DataSeeder (demo data)
└── exception/    ResourceNotFoundException + a single @RestControllerAdvice
```

The `salesforce/` package never touches a `Repository` — it only knows how to talk to
Salesforce. `service/SalesforceService` is the seam: it has repository access (to persist
a newly-linked Contact Id) *and* calls into `salesforce/`, so `TicketService` never needs
to know Salesforce exists at all.

### 2.4 End-to-end sequence (the actual code path)

```text
Customer                Frontend         Backend                Salesforce
   │                       │                │                        │
   │  Report an Issue      │                │                        │
   ├──────────────────────►│                │                        │
   │                       │ POST /api/tickets                       │
   │                       ├───────────────►│                        │
   │                       │                │ TicketService.createTicket()
   │                       │                │  1. save Ticket (SYNC_PENDING)
   │                       │                │  2. SalesforceService.createCaseForTicket()
   │                       │                │       ├─ ensureContact()  ──────────────►│
   │                       │                │       └─ createCase()     ──────────────►│
   │                       │                │                        │  CaseTrigger (before insert)
   │                       │                │                        │   → CaseTriageService
   │                       │                │                        │      → Category/Priority/Team/SLA set
   │                       │                │                        │  CaseTrigger (after insert)
   │                       │                │                        │   → Case_Triage_Decision__c (audit)
   │                       │                │ ◄────── Case Id ────────┤
   │                       │                │  3. Ticket.salesforceCaseId = Id, status=SUBMITTED
   │                       │ ◄─ 201 Created │                        │
   │  ◄────────────────────┤                │                        │
   │  sees "Submitted"     │                │                        │
   │                       │                │                        │
   │                       │                │         ... agent resolves the Case in Salesforce ...
   │                       │                │                        │
   │                       │                │  CaseStatusPollingJob (every 30s)
   │                       │                │  findCasesModifiedSince(lastPoll)  ─────►│
   │                       │                │ ◄──── changed Cases ────┤
   │                       │                │  SalesforceMapper.applyCaseToTicket()   │
   │                       │                │  Ticket.status = RESOLVED, resolution = "..."
   │                       │  (10s poll)    │                        │
   │                       ├───────────────►│ GET /api/tickets/{id}  │
   │                       │◄───────────────┤ status: RESOLVED        │
   │  ◄────────────────────┤                │                        │
   │  sees resolution      │                │                        │
```

### 2.5 Data model

**Backend (H2, flat foreign keys — no JPA object graphs, matches the doc's §21 model exactly):**

```text
Customer(id, firstName, lastName, email, phone, salesforceContactId, createdAt)
Product(id, name, description, category, price, imageUrl, inventory)
Order(id, customerId, orderNumber, status, totalAmount, shippingAddress, createdAt)
OrderItem(id, orderId, productId, quantity, unitPrice)
Ticket(id, ticketNumber, customerId, orderId, subject, description, issueType,
       category, priority, status, salesforceCaseId, resolution, createdAt, updatedAt)
```

**Salesforce:**

```text
Case (standard object)
  + External_Ticket_Id__c, External_Order_Id__c, Order_Amount__c     ← from backend
  + Triage_Category__c, Triage_Priority__c, Recommended_Team__c,
    SLA_Hours__c, SLA_Due_Date__c, Triage_Status__c, Triage_Reason__c,
    Triage_Override__c                                                ← rule engine output
  + Fulfillment_Status__c, Resolution__c                              ← agent-driven, synced to backend

Case_Triage_Decision__c   — one row per decision (rule engine OR manual override), audit trail
Case_Triage_Rule__c       — the business rules table (§1.4 above), editable without a deploy
```

**Field mapping (backend ⇄ Salesforce):**

| Backend | Salesforce | Direction |
|---|---|---|
| Ticket.ticketNumber | Case.External_Ticket_Id__c | → |
| Order.orderNumber | Case.External_Order_Id__c | → |
| Order.totalAmount | Case.Order_Amount__c | → |
| Ticket.subject / description | Case.Subject / Description | → |
| Case Id | Ticket.salesforceCaseId | → (stored once, at creation) |
| Case.Fulfillment_Status__c | Ticket.status | ← (polling) |
| Case.Triage_Category__c / Triage_Priority__c | Ticket.category / priority | ← (polling) |
| Case.Resolution__c | Ticket.resolution | ← (polling) |

### 2.6 Apex layer (reused from the original Case-Triage POC, extended)

```text
CaseTrigger  (before insert, after insert — thin, no business logic)
     │
     ▼
CaseTriggerHandler
     ├── beforeInsert()  → CaseTriageService.triageCases(List<Case>)   [bulk-safe]
     │                        for each Case:
     │                          text = Subject + Description
     │                          rule = CaseCategoryService.resolveRule(text)   ← 1 SOQL, cached per-transaction
     │                          category/priority/team/sla = derived from rule
     │                          on any exception → Triage_Status__c = 'Failed' (never blocks the insert)
     └── afterInsert()   → one bulk insert of Case_Triage_Decision__c rows (audit)
```

Bulk-safety is structural, not incidental: `CaseCategoryService` loads all
`Case_Triage_Rule__c` rows once per transaction (static cache), regardless of whether
1 or 200 Cases are being inserted — no SOQL or DML inside any loop.

### 2.7 Authentication deep dive (JWT Bearer flow)

```text
Backend                                          Salesforce
   │                                                  │
   │  1. Build JWT:                                   │
   │     iss = Connected App Consumer Key             │
   │     sub = Salesforce username                    │
   │     aud = https://login.salesforce.com           │
   │     exp = now + 3 minutes                        │
   │     signed with RS256 using backend/certs/server.key
   │                                                  │
   │  2. POST /services/oauth2/token                  │
   │     grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
   │     assertion=<signed JWT>              ────────►│
   │                                                  │  Salesforce verifies the JWT signature
   │                                                  │  against the .crt uploaded to the
   │                                                  │  Connected App, checks the user is
   │                                                  │  pre-authorized (Profile/PermSet on
   │                                                  │  the Connected App's "Manage" page)
   │  ◄──────── access_token + instance_url ──────────┤
   │                                                  │
   │  3. All subsequent REST calls use                │
   │     Authorization: Bearer <access_token>         │
   │     against <instance_url> directly              │
```

Token is cached in-process (`SalesforceClient`, `volatile` field) and only refreshed on a
401 or an explicit connection test — not re-authenticated per request.

### 2.8 Deployment topology (local)

```text
┌───────────────────────────────┐   ┌──────────────────────────────┐
│  Docker container: backend     │   │  Host process: npm run dev    │
│  ── built via multi-stage      │   │  Vite dev server, :5173       │
│     Dockerfile (Maven+JDK      │   │  proxies /api → :8080          │
│     build stage → JRE runtime) │   └──────────────────────────────┘
│  ── H2 file DB, volume-mounted │
│     at ./backend/data          │              Real internet
│  ── private key volume-mounted │                    │
│     at ./backend/certs (ro)    │                    ▼
│  ── port 8080                  │──── HTTPS ──►  Salesforce org
└───────────────────────────────┘               (case-triage-poc,
                                                  Developer Edition)
```

No JDK/Maven needed on the host — the Docker build stage brings its own. The frontend
runs natively via Node for fast hot-reload during development.

### 2.9 Security notes

- Salesforce credentials (Consumer Key, private key path) live in `backend/.env`
  (gitignored) — never in source, never sent to the frontend.
- `backend/certs/server.key` (private key) is gitignored; only `server.crt` (public) is
  ever shared with Salesforce.
- Apex controllers (`CaseTriageOverrideController`, `CaseResolutionController`,
  `CaseTriageDashboardController`) all run `with sharing`, check `isUpdateable()`/
  `isCreateable()` before DML, and use `WITH SECURITY_ENFORCED` on every SOQL query —
  field-level security and sharing rules are never bypassed.
- The frontend never talks to Salesforce directly — only to the Spring Boot backend,
  which is the sole holder of Salesforce credentials (doc §37 requirement).
