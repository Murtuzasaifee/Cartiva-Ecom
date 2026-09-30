# Cartiva — E-commerce Order & Customer Service Platform

Three-tier POC: a React storefront → Spring Boot backend → Salesforce/Apex CRM. A customer
buys something, reports a problem, an Apex rule engine triages the resulting Case, a support
agent resolves it in Salesforce, and the resolution flows back to the customer. Built per
`ShopAssist_Ecommerce_Salesforce_Apex_POC_Requirements.md`.

This started as a standalone Salesforce Case-triage POC (`Case_Triage_Auto_Assignment_Salesforce_Apex_POC.md`)
and was extended in place — the rule engine, trigger, and controller patterns below are reused,
not rebuilt.

## Layout

```
force-app/    Salesforce DX project (Apex, LWC, custom objects/fields, metadata)
backend/      Spring Boot REST API + Salesforce integration (Dockerized)
frontend/     React storefront (Vite)
scripts/      Anonymous Apex data-seeding scripts
run-local.sh  Starts backend (Docker) + frontend (npm dev) together
```

## Part 1 — Salesforce

- **Data model**: `Case` gets 13 custom fields (triage result fields from the original POC, plus
  `External_Ticket_Id__c`, `External_Order_Id__c`, `Order_Amount__c`, `Resolution__c`,
  `Fulfillment_Status__c` for this e-commerce extension). `Case_Triage_Decision__c` is the audit
  trail. `Case_Triage_Rule__c` holds 30 keyword → category/priority/team/SLA rules.
- **Apex**: `CaseTrigger` → `CaseTriggerHandler` → `CaseTriageService`, backed by
  `CaseCategoryService`, `CasePriorityService`, `CaseAssignmentService`, `CaseSLAService`.
  Bulk-safe (no SOQL/DML in loops), per-record error isolation. `CaseTriageOverrideController`
  (manual override) and `CaseResolutionController` (fulfillment status + resolution) are the
  two mutation entry points, both CRUD/FLS-checked.
- **LWC**: `caseTriageDashboard` (stats + recent cases) and `caseTriageDetail` (Case record page —
  triage result, customer/order context, override modal, resolution form).
- **Tests**: 19 tests across `CaseTriageServiceTest`, `CaseTriggerHandlerTest`,
  `CaseTriageControllerTest`, `CaseResolutionControllerTest` — covers every scenario in the
  requirement doc's §38 Apex Testing section (Delivery, Payment/High, Return, Refund, 200-record
  bulk, override).
- **Permission set**: `Case_Triage_User`.

Categories: Delivery, Product Issue, Payment, Return, Refund, Cancellation, General.
Teams: Logistics, Product Support, Payments, Returns, Finance, Order Management, General Support.

### Deploy

```bash
sf project deploy start -o case-triage-poc
sf org assign permset -n Case_Triage_User -o case-triage-poc
sf apex run --file scripts/apex/seedTriageRules.apex -o case-triage-poc
sf apex run test -o case-triage-poc -c -r human
```

Add `caseTriageDetail` to the Case record page and `caseTriageDashboard` to an App/Home page
via Lightning App Builder (one-time, in-browser — not scriptable).

## Part 2 — Backend (Spring Boot)

Packages: `model` (JPA entities) / `repository` / `service` / `controller` / `salesforce`
(OAuth client, Case CRUD, field mapping) / `dto` / `config` / `sync` (polling + retry jobs).
H2 file-based DB (`backend/data/`), seeded on first boot with sample products, a sample
customer ("Peter Baines"), and sample order/ticket history.

Runs in Docker — no local JDK/Maven needed.

### Salesforce credentials (JWT Bearer flow)

Uses the OAuth JWT Bearer flow, not username-password — many orgs (this one included) have
"Allow OAuth Username-Password Flows" disabled by default (Setup → OAuth and OpenID Connect
Settings), and it's not always admin-togglable. JWT Bearer works regardless of that setting and
isn't affected by MFA.

1. Generate a cert/key pair (already done for you if `backend/certs/server.key` exists):
   ```bash
   mkdir -p backend/certs
   openssl req -x509 -sha256 -nodes -days 3650 -newkey rsa:2048 \
     -keyout backend/certs/server.key -out backend/certs/server.crt \
     -subj "/CN=Cartiva Backend/O=Cartiva POC"
   ```
   `server.key` never leaves your machine (gitignored). `server.crt` is the public half you upload.

2. Setup → App Manager → your Connected App → dropdown → **Edit**:
   - Check **Use digital signatures** → **Choose File** → upload `backend/certs/server.crt`.
   - Permitted Users: **All users may self-authorize**.
   - Save.

3. `backend/.env`:
   ```
   SALESFORCE_CLIENT_ID=<Consumer Key from the Connected App>
   SALESFORCE_USERNAME=<your Salesforce username>
   SALESFORCE_JWT_PRIVATE_KEY_PATH=/app/certs/server.key   # path inside the container
   ```
   No password or security token needed — the signed JWT *is* the credential.

Without valid credentials, the backend still runs fully — tickets are created locally and stay
`SYNC_PENDING` (retried automatically once fixed), matching the doc's §36 error-handling
requirement. Check `curl localhost:8080/api/salesforce/status` any time to see
`{"configured": bool, "connected": bool}`.

### APIs

```
GET/POST /api/products, /api/products/{id}
POST     /api/orders            GET /api/orders/{id}
POST     /api/tickets           GET /api/tickets/{id}
GET      /api/customers/{id}, /api/customers/{id}/orders, /api/customers/{id}/tickets
GET      /api/salesforce/cases/{id}   POST /api/salesforce/cases/retry
```

## Part 3 — Frontend (React)

Vite + React Router, plain CSS, `fetch`-based API client, React Context for cart state.
No login — a single seeded account (id `1`, editable via the Profile page) is used for all
customer-scoped calls (`frontend/src/constants.js`).

Pages: Home, Product Listing, Product Detail, Cart, Checkout, Order Confirmation, My Orders,
Order Detail, Create Ticket, Ticket Detail, My Support, Profile.

## Run everything locally

```bash
./run-local.sh
```

Starts the backend in Docker (`localhost:8080`) and the frontend dev server
(`localhost:5173`, proxies `/api` to the backend — no CORS config needed). The Salesforce/Apex
layer is the real org, already deployed — this script doesn't touch it.

Stop the backend: `(cd backend && docker compose down)`.

## Try the end-to-end flow

1. Frontend: browse to Running Shoes Pro → Add to Cart → Checkout → Place Order.
2. My Orders → open the order → Report an Issue → pick "Delivery Issue" → describe
   "My package has not arrived."
3. Ticket is created locally and (if Salesforce credentials are set) as a Case in
   `case-triage-poc`, auto-triaged to Category=Delivery, Priority=Medium, Team=Logistics, SLA=24h.
4. In Salesforce, open the Case, use the extended `caseTriageDetail` component to change
   Fulfillment Status and enter a Resolution, then Resolve.
5. Within 30s the backend's polling job picks up the change; the ticket's status page
   (auto-refreshing every 10s) shows the resolution.
