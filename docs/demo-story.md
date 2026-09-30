# Cartiva — Demo Story & Walkthrough

The one sentence this demo proves:

> **A customer action starts in the storefront, travels through the backend into
> Salesforce, is processed by Apex and handled by a CRM agent, and the resulting
> business outcome comes all the way back to the customer-facing application.**

---

## The story

A customer buys a pair of running shoes on Cartiva. A few days later, the package
hasn't arrived. The customer opens the order, taps **Report an Issue**, and describes the
problem. Behind the scenes, a Salesforce Case is created and instantly classified —
Category: Delivery, Priority: High, Team: Logistics, SLA: 8 hours — with zero manual
triage. A Logistics agent sees it already queued and prioritized, investigates, and
resolves it: *"Shipment was delayed by the courier and is scheduled for delivery
tomorrow."* Within 30 seconds, the customer's ticket page shows exactly that.

---

## 1. Start everything

```bash
cd /Users/murtuzasaifee/Desktop/salesforce-apex-app
./run-local.sh
```

Wait for this line before proceeding:

```
Salesforce: connected — tickets will create real Cases in your org.
```

If it instead says **NOT connected**, tickets will still work but stay stuck at
`SYNC_PENDING` (see Troubleshooting below) — the demo loop needs the connection.

Two things are now running:
- Backend: `http://localhost:8080` (Docker)
- Frontend: `http://localhost:5173` (this is what you click through)

---

## 2. Walk the storefront (customer side)

1. Open **http://localhost:5173**
2. Click **Shop Now** or a category → pick **Running Shoes Pro** (or any product)
3. **Add to Cart**
4. Cart icon (top right) → **Checkout**
5. Confirm the address, pick a payment method (mocked — no real charge), **Place Order**
6. You land on the order confirmation — note the order number (e.g. `ORD-10001`)
7. **My Orders** (top nav) → click into that order
8. Click **Report an Issue**
9. Issue Type: **Delivery Issue**
   Subject: `My order has not arrived`
   Description: `The package was supposed to arrive yesterday but I still haven't received it.`
10. **Submit Ticket**

You're now on the ticket detail page. Status starts at `SYNC_PENDING` → flips to
`SUBMITTED` within a second or two (that's the real Salesforce Case being created).
Note the ticket number (e.g. `TCK-10002`).

---

## 3. Find and action the ticket in Salesforce (agent side)

### Where to look

1. Open the org: `sf org open -o case-triage-poc` (or log in directly in a browser)
2. Click the **App Launcher** (the grid/waffle icon, top-left corner)
3. Type **Cases** in the search box → click the **Cases** item
4. You're on the Cases list view. Switch the view (dropdown near "Recently Viewed") to
   **All Open Cases** if you don't see your new one — it may take a second to appear
5. Find the Case by Subject (`My order has not arrived`) or sort by Created Date
   (newest first) — click into it

### What you'll see (already done by Apex, before you touch anything)

The **Triage Result** panel on the Case page shows:
- **Category**: Delivery
- **Priority**: Medium or High (depends on exact wording — "delayed"/"late" → High, generic
  delivery language → Medium)
- **Recommended Team**: Logistics
- **SLA**: 8 or 24 hours, with a computed **SLA Due** timestamp
- **Reason**: which keyword matched and why (e.g. *"Matched keyword 'delayed' → classified
  as Delivery with High priority, routed to Logistics."*)
- **Triage Status**: Triaged

This happened automatically the instant the Case was created — no agent action needed to
get this far.

### Actioning it (what an agent does)

> **Ignore the standard "Status" field** (New/Working/Escalated/Closed — usually edited via
> the pencil icon on the Case's Status field, or a list-view inline edit). That's a
> built-in Salesforce field this app doesn't use. We deliberately built a separate custom
> field instead (`Fulfillment_Status__c`) to avoid Salesforce's Status/IsClosed plumbing —
> see `docs/architecture.md` §2.5. Editing standard Status does nothing for this demo; the
> polling job only watches `Fulfillment_Status__c` and `Resolution__c`.

Everything you need is on the **Triage Result** panel further down the Case page:

1. **(Optional) Override Triage** — if Apex got the category/priority/team wrong, click
   this, adjust the values, type a reason, **Save**. This is recorded as an audit entry
   with source "Manual Override" (queryable on `Case_Triage_Decision__c`).
2. **Fulfillment Status** dropdown — move it to **In Progress** while you investigate.
   Customer-visible: their ticket page will reflect this.
3. **Resolution** textarea — type the outcome, e.g.:
   `Shipment was delayed by the courier and is scheduled for delivery tomorrow.`
4. **Resolve Case** button — sets Fulfillment Status to **Resolved** and saves the
   resolution text in one action.

If the **Triage Result** panel isn't visible at all on the Case page: click the gear icon
(top-right) → **Edit Page** → Lightning App Builder opens → drag the **Triage Result**
component onto the page if it's missing → **Save** → **Activate** → assign it as the org
default for the Case record page. (One-time setup, only needed if this wasn't done yet.)

### Seeing the audit trail

App Launcher → search **Case Triage Decisions** → this custom object has one row per
decision (every automatic triage, every manual override) with Category, Priority, Team,
Reason, Decision Source ("Rule Engine" or "Manual Override"), and a timestamp — the full
history of how this Case's classification evolved.

### Seeing/editing the business rules

App Launcher → search **Case Triage Rules** → this is the keyword → category/priority/
team/SLA table from the architecture doc. Business users can add, edit, or deactivate
rules here without any code change or deployment — Apex reads this table fresh each
transaction.

---

## 4. Watch the resolution flow back (customer side)

Go back to the browser tab with the ticket detail page (`http://localhost:5173/tickets/2`
or wherever you left it). It auto-refreshes every 10 seconds. Within **~30 seconds** of
clicking **Resolve Case** in Salesforce, the page updates to:

```
Status: Resolved
Resolution: Shipment was delayed by the courier and is scheduled for delivery tomorrow.
```

That 30-second window is the backend's `CaseStatusPollingJob` — it polls Salesforce for
Cases modified since its last check and syncs the changes onto the matching local Ticket.

Also check **My Support** (top nav) — shows Open vs. Resolved ticket counts and a table of
all tickets for the demo customer.

---

## 5. Verify from the command line (optional, for a scripted/no-UI demo)

```bash
# Confirm the Salesforce connection
curl -s http://localhost:8080/api/salesforce/status
# {"configured":true,"connected":true}

# Check a ticket's current state
curl -s http://localhost:8080/api/tickets/2 | python3 -m json.tool

# Look at the raw Case fields directly
curl -s http://localhost:8080/api/salesforce/cases/<salesforceCaseId> | python3 -m json.tool
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Ticket stuck at `SYNC_PENDING` | Salesforce not connected | `curl localhost:8080/api/salesforce/status` — if `connected:false`, check `backend/.env` and `docker compose logs backend` in `backend/` |
| `invalid_grant: authentication failure` | Username-password flow disabled at org level (common on orgs created Summer '23+) | Already solved in this project — uses JWT Bearer flow instead. If you see this again, it usually means the Connected App's digital signature or pre-authorization isn't set up (see README.md §"Salesforce credentials") |
| Ticket never leaves `SYNC_PENDING` even though `connected:true` | Check backend logs: `docker compose logs backend \| grep "Case creation failed"` — often a field validation error (e.g. duplicate `External_Ticket_Id__c` from a leftover test Case) | Delete the offending test Case in Salesforce, retry (`POST /api/salesforce/cases/retry`) |
| Case doesn't show a "Triage Result" panel | LWC not added to the Case page layout yet | Edit Page → drag "Triage Result" on → Save → Activate (one-time) |
| Resolution doesn't appear on the frontend after 30s+ | Poll job may be disabled, or Salesforce disconnected mid-demo | `curl localhost:8080/api/salesforce/status`; check `SALESFORCE_POLLING_ENABLED=true` in `backend/.env` |
| No "Closed" option when editing Case Status, or editing Status doesn't resolve the ticket | You're editing the **standard** Status field (New/Working/Escalated/Closed) — this app doesn't use it | Cancel that dialog. Use the **Fulfillment Status** dropdown and **Resolve Case** button on the Triage Result panel instead |

To stop everything: Ctrl-C the running script, then `(cd backend && docker compose down)`.
