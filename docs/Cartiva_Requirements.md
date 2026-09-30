# ShopAssist — E-commerce Order & Customer Service Platform
## Detailed Proof-of-Concept Requirement Document

**Version:** 1.0  
**Purpose:** End-to-End Proof of Concept  
**Technology:** React, Spring Boot, Salesforce, Apex  
**AI:** Not included in Phase 1

---

## 1. Executive Summary

ShopAssist is a lightweight e-commerce application that delivers a complete end-to-end customer service journey.

The customer-facing application should have the familiarity of an Amazon/Shopify-style storefront, while Salesforce acts as the CRM and customer-service platform behind the scenes.

The core flow is:

```text
Customer
   ↓
React E-commerce Frontend
   ↓ REST
Spring Boot Backend
   ↓ Salesforce REST API
Salesforce CRM
   ↓
Apex Processing
   ├── Case Classification
   ├── Priority
   ├── Team Assignment
   └── SLA
   ↓
Salesforce Support Agent
   ↓
Salesforce Case Resolution
   ↓
Spring Boot Backend
   ↓
React Frontend
   ↓
Customer
```

The objective is not to build a production e-commerce platform. The objective is to show how a modern customer-facing application can integrate with Salesforce and use Apex for CRM-side business processing.

---

## 2. POC Goals

The POC should deliver:

1. Customer-facing e-commerce UI
2. Product browsing
3. Product details
4. Shopping cart
5. Simplified checkout
6. Customer account/order history
7. Order creation
8. Customer support ticket creation
9. Spring Boot REST APIs
10. Backend persistence
11. Salesforce CRM integration
12. Salesforce Case creation
13. Apex-based Case processing
14. Rule-based Case classification
15. Priority determination
16. Support-team assignment
17. SLA calculation
18. Salesforce agent processing
19. Status synchronization back to the backend
20. Ticket status visible to the customer

---

## 3. Non-Goals

Phase 1 will not include:

- Real payment gateway integration
- Real shipping provider integration
- Real inventory management
- AI / LLM integration
- Machine learning
- Production-scale infrastructure
- Complex order fulfillment
- Multi-country tax calculation
- Real email/SMS notifications
- Advanced recommendation engines

External integrations may be mocked.

---

# 4. Target Customer Story

A customer visits ShopAssist and purchases a pair of running shoes.

Later, the customer discovers that the package has not arrived.

The customer opens the order and selects:

> "I have not received my order."

The application creates a support ticket.

The backend sends the ticket to Salesforce.

Salesforce creates a Case.

Apex processes the Case:

```text
Category: Delivery
Priority: High
Team: Logistics
SLA: 8 hours
```

A support agent sees the Case in Salesforce and starts processing it.

The agent resolves the Case:

```text
Resolution:
Shipment was delayed by the courier and is scheduled
for delivery tomorrow.
```

The status flows back to the backend.

The customer sees:

```text
Ticket #TCK-10023

Status: Resolved

Resolution:
Shipment was delayed by the courier and is scheduled
for delivery tomorrow.
```

This is the primary customer journey.

---

# 5. Overall Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER EXPERIENCE                      │
│                                                             │
│  React E-commerce Application                               │
│                                                             │
│  Home → Products → Product → Cart → Checkout               │
│                         │                                   │
│                         ▼                                   │
│                    My Orders                                │
│                         │                                   │
│                         ▼                                   │
│                     Support                                │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│                                                             │
│                     Spring Boot                             │
│                                                             │
│  Customer Service                                           │
│  Product Service                                            │
│  Order Service                                              │
│  Ticket Service                                             │
│  Salesforce Integration Service                             │
│                                                             │
│  Database                                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │ Salesforce REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       SALESFORCE                             │
│                                                             │
│  Accounts                                                   │
│  Contacts                                                   │
│  Cases                                                      │
│  Case Comments                                              │
│  Case Triage Decision                                       │
│                                                             │
│                 Apex Processing                             │
│                      │                                      │
│       ┌──────────────┼──────────────┐                       │
│       ▼              ▼              ▼                       │
│   Category        Priority       Assignment                 │
│       │              │              │                       │
│       └──────────────┼──────────────┘                       │
│                      ▼                                      │
│                     SLA                                     │
│                                                             │
│                 Support Agent UI                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ Status / Resolution
                          ▼
                    Spring Boot
                          │
                          ▼
                    React Frontend
                          │
                          ▼
                      Customer
```

---

# 6. Technology Stack

| Component | Technology |
|---|---|
| Customer Frontend | React |
| UI | React + CSS / component library |
| Backend | Java Spring Boot |
| API | REST |
| Database | PostgreSQL or H2 |
| CRM | Salesforce |
| CRM Business Logic | Apex |
| CRM UI | Salesforce Lightning |
| Salesforce Integration | Salesforce REST API |
| Configuration | Salesforce Custom Metadata |
| AI | Not included |
| Messaging | Not required for MVP |

---

# 7. Component Responsibilities

## 7.1 Customer Frontend

Responsible for:

- Product browsing
- Product details
- Cart
- Checkout
- Customer account
- Order history
- Ticket creation
- Ticket tracking

Technology:

```text
React
```

## 7.2 Backend

Responsible for:

- REST APIs
- Customer management
- Product management
- Order management
- Ticket management
- Database persistence
- Salesforce integration
- Synchronizing Salesforce status

Technology:

```text
Spring Boot
```

## 7.3 Database

Stores application-side data:

```text
Customer
Product
Order
OrderItem
Ticket
```

Salesforce is the CRM system of record for the Case lifecycle.

## 7.4 Salesforce

Salesforce manages:

- Accounts
- Contacts
- Support Cases
- Case status
- Assignment
- Agent interaction
- Resolution
- Case history

## 7.5 Apex

Apex performs CRM-side processing:

- Process newly created Cases
- Determine Case category
- Determine priority
- Determine support team
- Calculate SLA
- Create triage audit records
- Support manual overrides
- Maintain business rules

---

# 8. Customer Frontend — UI Direction

The customer application should look like a lightweight, modern e-commerce site inspired by the familiarity of Amazon/Shopify, but with its own ShopAssist branding.

Suggested header:

```text
┌─────────────────────────────────────────────────────────────┐
│ ShopAssist    Search products...       Orders  Help  👤 🛒 │
├─────────────────────────────────────────────────────────────┤
│ Home | Electronics | Fashion | Home | Sports | Deals        │
└─────────────────────────────────────────────────────────────┘
```

Design principles:

- Clean white/neutral background
- Strong product imagery
- Simple navigation
- Clear call-to-action buttons
- Responsive layout
- Consistent status badges
- Minimal visual clutter
- Modern card-based product layout

---

# 9. Frontend Screen — Home Page

```text
┌─────────────────────────────────────────────────────────────┐
│ ShopAssist        Search products       Orders   🛒  👤     │
├─────────────────────────────────────────────────────────────┤
│ Home | Electronics | Fashion | Home | Sports | Deals        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│        EVERYTHING YOU NEED.                                 │
│        SIMPLE. FAST. EASY.                                  │
│                                                             │
│              [ Shop Now ]                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     Featured Products                        │
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐    │
│  │ Product │   │ Product │   │ Product │   │ Product │    │
│  │ Image   │   │ Image   │   │ Image   │   │ Image   │    │
│  │ AED 99  │   │ AED 149 │   │ AED 79  │   │ AED 199 │    │
│  │ [View]  │   │ [View]  │   │ [View]  │   │ [View]  │    │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘    │
└─────────────────────────────────────────────────────────────┘
```

Requirements:

- Header
- Search
- Category navigation
- Hero section
- Featured products
- Product cards
- Cart indicator
- Customer account menu

---

# 10. Product Listing

Example:

```text
┌─────────────────────────────────────────────────────────────┐
│ Running Shoes                                               │
├─────────────────────────────────────────────────────────────┤
│ Filters                  Products                           │
│                                                             │
│ Brand                    ┌────────┐ ┌────────┐ ┌────────┐ │
│ □ Nike                   │ Image  │ │ Image  │ │ Image  │ │
│ □ Adidas                 │        │ │        │ │        │ │
│ □ Puma                   │ AED120 │ │ AED140 │ │ AED95  │ │
│                         │ [View] │ │ [View] │ │ [View] │ │
│ Price                    └────────┘ └────────┘ └────────┘ │
│ ○ < AED100                                                 │
│ ○ AED100–200                                                │
│ ○ > AED200                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

# 11. Product Details

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────┐       Running Shoes Pro                │
│  │                 │                                        │
│  │  Product Image  │       AED 299                          │
│  │                 │       ★★★★★                            │
│  │                 │       Available                         │
│  └─────────────────┘                                        │
│                            Size: [9]                         │
│                            [ Add to Cart ]                   │
│                                                             │
│                            Product Details                   │
│                            Lightweight running shoe...       │
└─────────────────────────────────────────────────────────────┘
```

---

# 12. Cart

```text
┌─────────────────────────────────────────────────────────────┐
│                         Your Cart                           │
├─────────────────────────────────────────────────────────────┤
│ Running Shoes Pro                 AED 299                   │
│ Quantity: [-] 1 [+]                                        │
│                                                             │
│ Wireless Headphones               AED 199                   │
│ Quantity: [-] 1 [+]                                        │
├─────────────────────────────────────────────────────────────┤
│ Subtotal                            AED 498                 │
│ Delivery                            AED 20                  │
│ Total                               AED 518                 │
│                                                             │
│                         [ Checkout ]                         │
└─────────────────────────────────────────────────────────────┘
```

---

# 13. Checkout

Keep checkout simple for the POC.

```text
┌─────────────────────────────────────────────────────────────┐
│ Checkout                                                    │
├─────────────────────────────────────────────────────────────┤
│ Delivery Address                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 123 Example Street                                      │ │
│ │ Dubai, UAE                                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Payment                                                     │
│ ○ Credit Card                                               │
│ ○ Cash on Delivery                                          │
│                                                             │
│ Order Total: AED 518                                       │
│                                                             │
│                    [ Place Order ]                          │
└─────────────────────────────────────────────────────────────┘
```

Payment is mocked.

---

# 14. Order Confirmation

```text
┌─────────────────────────────────────────────────────────────┐
│                   ✓ Order Confirmed                        │
├─────────────────────────────────────────────────────────────┤
│ Order #ORD-10045                                           │
│                                                             │
│ Thank you for your order!                                  │
│                                                             │
│ Estimated Delivery: 02 Oct 2026                            │
│                                                             │
│ [ View Order ]       [ Continue Shopping ]                 │
└─────────────────────────────────────────────────────────────┘
```

---

# 15. My Orders

```text
┌─────────────────────────────────────────────────────────────┐
│ My Orders                                                   │
├─────────────────────────────────────────────────────────────┤
│ Order #ORD-10045                                           │
│ 28 Sep 2026     AED 518     ● Delivered                    │
│ [ View Order ]                                              │
├─────────────────────────────────────────────────────────────┤
│ Order #ORD-10031                                           │
│ 20 Sep 2026     AED 299     ● In Transit                   │
│ [ View Order ]                                              │
└─────────────────────────────────────────────────────────────┘
```

---

# 16. Order Details

```text
┌─────────────────────────────────────────────────────────────┐
│ Order #ORD-10045                                           │
├─────────────────────────────────────────────────────────────┤
│ Running Shoes Pro                       AED 299             │
│ Wireless Headphones                     AED 199             │
│                                                             │
│ Order Status                                               │
│ ✓ Ordered → ✓ Packed → ✓ Shipped → ● Delivered             │
│                                                             │
│ Need help with this order?                                │
│ [ Report an Issue ]    [ Request Return ]                  │
└─────────────────────────────────────────────────────────────┘
```

The customer should not have to manually enter the Order ID when creating a support ticket.

---

# 17. Create Support Ticket

```text
┌─────────────────────────────────────────────────────────────┐
│ Report an Issue                                            │
├─────────────────────────────────────────────────────────────┤
│ Order: #ORD-10045                                          │
│                                                             │
│ Issue Type                                                  │
│ [ Select an issue ▼ ]                                      │
│                                                             │
│ Subject                                                     │
│ [ My order has not arrived                               ]  │
│                                                             │
│ Description                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ The order was supposed to arrive yesterday but I        │ │
│ │ have not received it yet.                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                         [ Submit Ticket ]                   │
└─────────────────────────────────────────────────────────────┘
```

Issue types:

```text
Delivery Issue
Product Issue
Payment Issue
Return Request
Refund Request
Cancellation
Other
```

---

# 18. Ticket Creation Flow

```text
React
  │
  │ POST /api/tickets
  ▼
Spring Boot
  │
  ├── Validate Customer
  ├── Validate Order
  ├── Store Ticket
  │
  ▼
Salesforce Integration Service
  │
  │ Create Case
  ▼
Salesforce
```

---

# 19. Backend API Requirements

Suggested APIs:

```text
GET    /api/products
GET    /api/products/{id}

POST   /api/orders
GET    /api/orders/{id}
GET    /api/customers/{id}/orders

POST   /api/tickets
GET    /api/tickets/{id}
GET    /api/customers/{id}/tickets

POST   /api/salesforce/cases
GET    /api/salesforce/cases/{id}
```

---

# 20. Backend Service Structure

```text
controller/
    ProductController
    OrderController
    TicketController
    CustomerController

service/
    ProductService
    OrderService
    TicketService
    CustomerService
    SalesforceService

repository/
    ProductRepository
    OrderRepository
    TicketRepository
    CustomerRepository

salesforce/
    SalesforceClient
    SalesforceCaseService
    SalesforceMapper

model/
    Customer
    Product
    Order
    OrderItem
    Ticket
```

---

# 21. Backend Data Model

## Customer

```text
Customer
---------
id
firstName
lastName
email
phone
salesforceContactId
createdAt
```

## Product

```text
Product
-------
id
name
description
category
price
imageUrl
inventory
```

## Order

```text
Order
-----
id
customerId
orderNumber
status
totalAmount
shippingAddress
createdAt
```

## Order Item

```text
OrderItem
---------
id
orderId
productId
quantity
unitPrice
```

## Ticket

```text
Ticket
------
id
ticketNumber
customerId
orderId
subject
description
category
priority
status
salesforceCaseId
resolution
createdAt
updatedAt
```

---

# 22. Salesforce Data Model

Use standard Salesforce objects wherever possible.

## Account

Represents the customer account.

## Contact

Represents the customer.

## Case

Represents the support ticket.

Add these custom Case fields:

| Field | Type |
|---|---|
| External Ticket ID | Text |
| External Order ID | Text |
| Order Amount | Currency |
| Triage Category | Picklist |
| Triage Priority | Picklist |
| Recommended Team | Picklist |
| SLA Hours | Number |
| SLA Due Date | Date/Time |
| Triage Status | Picklist |
| Triage Reason | Long Text |
| Triage Override | Checkbox |
| Resolution | Long Text |

---

# 23. Salesforce Case Lifecycle

```text
New
 ↓
Triaged
 ↓
Assigned
 ↓
In Progress
 ↓
Resolved
```

Optional path:

```text
In Progress
 ↓
Waiting for Customer
 ↓
In Progress
```

---

# 24. Apex Architecture

When a new Case arrives:

```text
Salesforce Case
       │
       ▼
   CaseTrigger
       │
       ▼
CaseTriggerHandler
       │
       ▼
CaseTriageService
       │
       ├── CaseCategoryService
       ├── CasePriorityService
       ├── CaseAssignmentService
       └── CaseSLAService
       │
       ▼
Update Case
```

Suggested Apex classes:

```text
CaseTrigger
CaseTriggerHandler
CaseTriageService
CaseCategoryService
CasePriorityService
CaseAssignmentService
CaseSLAService
CaseTriageResult
CaseTriageException
```

The Trigger should remain lightweight. Business logic should live in service classes.

---

# 25. Rule-Based Case Classification

Phase 1 uses deterministic rules and keywords.

## Delivery

```text
delivery
delivered
shipment
shipping
package
parcel
arrived
late
```

Example:

> "My package has not arrived."

Result:

```text
Category = Delivery
```

## Product Issue

```text
damaged
broken
defective
wrong product
missing item
```

## Payment

```text
payment
charged
transaction
card
payment failed
```

## Return

```text
return
send back
return product
```

## Refund

```text
refund
money back
refund pending
```

## Cancellation

```text
cancel
cancellation
cancel order
```

---

# 26. Priority Rules

## Critical

Examples:

```text
Fraud
Unauthorized payment
Significant financial loss
```

```text
Priority = Critical
SLA = 2 hours
```

## High

Examples:

```text
Payment failure
Product damaged
Order significantly delayed
```

```text
Priority = High
SLA = 4–8 hours
```

## Medium

Examples:

```text
Return request
Refund request
Order modification
```

```text
Priority = Medium
SLA = 24 hours
```

## Low

Examples:

```text
Product information
General questions
```

```text
Priority = Low
SLA = 48 hours
```

---

# 27. Team Assignment

| Category | Team |
|---|---|
| Delivery | Logistics |
| Product Issue | Product Support |
| Payment | Payments |
| Return | Returns |
| Refund | Finance |
| Cancellation | Order Management |
| Other | General Support |

---

# 28. Example Apex Triage Result

Input:

```text
Subject:
My order has not arrived

Description:
The package was supposed to arrive yesterday
but I still haven't received it.
```

Apex produces:

```text
Category:
Delivery

Priority:
High

Team:
Logistics

SLA:
8 hours

Reason:
Delivery delay detected from case description.
```

Salesforce Case:

```text
Status = Triaged
Category = Delivery
Priority = High
Team = Logistics
SLA = 8 hours
```

---

# 29. Custom Metadata

Business rules should preferably be stored in Salesforce Custom Metadata rather than hardcoded.

Example:

| Keyword | Category | Priority | Team | SLA |
|---|---|---|---|---:|
| delivery | Delivery | Medium | Logistics | 24 |
| delayed | Delivery | High | Logistics | 8 |
| damaged | Product Issue | High | Product Support | 8 |
| payment failed | Payment | High | Payments | 4 |
| refund | Refund | Medium | Finance | 24 |
| cancel | Cancellation | Medium | Order Management | 24 |

This makes rules configurable without changing Apex code.

---

# 30. Salesforce Agent Experience

The Salesforce Case page should show the information needed by the support agent.

```text
┌─────────────────────────────────────────────────────────────┐
│ Case #000123                                               │
├─────────────────────────────────────────────────────────────┤
│ Customer: John Smith                                       │
│ Order: ORD-10045                                           │
│                                                             │
│ Subject: My order has not arrived                          │
│                                                             │
│ Category: Delivery                                         │
│ Priority: High                                             │
│ Team: Logistics                                            │
│ SLA: 8 Hours                                               │
│ SLA Due: 29-Sep-2026 22:30                                │
│                                                             │
│ Status: In Progress                                        │
│                                                             │
│ Customer Description                                       │
│ The package was supposed to arrive yesterday...            │
│                                                             │
│ Resolution                                                 │
│ [                                                         ]│
│                                                             │
│                 [ Resolve Case ]                            │
└─────────────────────────────────────────────────────────────┘
```

---

# 31. Agent Actions

The support agent should be able to:

- View customer
- View order reference
- View Case description
- View triage result
- Change priority
- Change assignment
- Add comments
- Change status
- Add resolution
- Resolve Case

---

# 32. Manual Override

Example:

```text
Apex Decision:

Priority = Medium
Team = Logistics
```

Agent changes:

```text
Priority = High
Team = Logistics

Reason:
Customer has already contacted support twice.
```

The Case records:

```text
Triage Override = TRUE
```

The override should also be auditable.

---

# 33. Customer Ticket Details

The customer should be able to track the ticket.

```text
┌─────────────────────────────────────────────────────────────┐
│ Ticket #TCK-10023                                          │
├─────────────────────────────────────────────────────────────┤
│ Order: ORD-10045                                           │
│                                                             │
│ Issue: My order has not arrived                            │
│                                                             │
│ Status                                                     │
│ ✓ Submitted → ✓ Triaged → ✓ In Progress → ● Resolved      │
│                                                             │
│ Category: Delivery                                         │
│ Priority: High                                             │
│                                                             │
│ Resolution                                                 │
│ Shipment was delayed by the courier and is scheduled       │
│ for delivery tomorrow.                                    │
└─────────────────────────────────────────────────────────────┘
```

---

# 34. Salesforce-to-Backend Synchronization

For Phase 1, use simple polling.

```text
Every 30 seconds
       ↓
Backend queries Salesforce
       ↓
Find changed Cases
       ↓
Map Salesforce Case
       ↓
Update Ticket DB
       ↓
Frontend retrieves updated ticket
```

This is deliberately simple for the POC.

---

# 35. Future Event-Driven Architecture

A later version can replace polling with Salesforce Platform Events:

```text
Salesforce Case Updated
        │
        ▼
Platform Event
        │
        ▼
Integration Layer
        │
        ▼
Spring Boot
        │
        ▼
Ticket DB
        │
        ▼
React
```

This should be considered a Phase 2 enhancement.

---

# 36. Error Handling

Example:

```text
Customer
   ↓
Backend
   ↓
Salesforce
   X
Integration Failure
```

The ticket should not be lost.

Example backend status:

```text
SYNC_PENDING
```

The backend should retry the Salesforce operation.

For the POC, simple retry logic is sufficient.

---

# 37. Security

Customer:

- Can view only their own orders
- Can view only their own tickets
- Can create tickets for their own orders

Support Agent:

- Can view authorized Cases
- Can update Case status
- Can add resolution

Backend:

- Owns customer APIs
- Stores Salesforce credentials securely
- Never exposes Salesforce credentials to the React frontend

---

# 38. Apex Testing

Required test scenarios:

### Test 1 — Delivery

```text
Input:
"My package has not arrived"

Expected:
Category = Delivery
```

### Test 2 — Payment

```text
Input:
"My payment failed"

Expected:
Category = Payment
Priority = High
```

### Test 3 — Return

```text
Input:
"I want to return the product"

Expected:
Category = Return
```

### Test 4 — Refund

```text
Input:
"I haven't received my refund"

Expected:
Category = Refund
```

### Test 5 — Bulk Processing

Create 200 Cases and verify:

- All Cases are processed
- No SOQL-in-loop
- No DML-in-loop
- No governor-limit failure

### Test 6 — Override

Verify:

```text
Apex Decision
      ↓
Agent Override
      ↓
Updated Case
      ↓
Audit information
```

---

# 39. End-to-End Sequence

The flow should follow one order from purchase to support resolution.

## Step 1 — Browse

```text
Home
 ↓
Running Shoes
 ↓
Running Shoes Pro
```

## Step 2 — Purchase

```text
Add to Cart
 ↓
Checkout
 ↓
Place Order
```

Order:

```text
ORD-10045
```

## Step 3 — Report Problem

```text
My Orders
 ↓
ORD-10045
 ↓
Report an Issue
```

Customer enters:

> "My package was supposed to arrive yesterday but I haven't received it."

## Step 4 — Backend

```text
POST /api/tickets
```

Backend creates:

```text
TCK-10023
```

Then creates the Salesforce Case.

## Step 5 — Salesforce + Apex

Apex determines:

```text
Category = Delivery
Priority = High
Team = Logistics
SLA = 8 hours
```

## Step 6 — Agent

Agent opens the Case and changes:

```text
Status = In Progress
```

## Step 7 — Resolution

Agent enters:

```text
Courier delay confirmed.
Delivery scheduled for tomorrow.
```

Then:

```text
Resolve Case
```

## Step 8 — Backend

Backend detects:

```text
Case Status = Resolved
```

and updates:

```text
TCK-10023 = Resolved
```

## Step 9 — Customer

Customer opens:

```text
My Tickets
```

and sees:

```text
TCK-10023
Status: Resolved

Courier delay confirmed.
Delivery scheduled for tomorrow.
```

---

# 40. Customer Support Dashboard

A simple support section can show:

```text
┌─────────────────────────────────────────────────────────────┐
│                    My Support                              │
├─────────────────────────────────────────────────────────────┤
│ Open Tickets                  1                            │
│ Resolved Tickets              3                            │
├─────────────────────────────────────────────────────────────┤
│ Ticket       Issue              Status        Priority      │
│ TCK-10023    Delivery Delay     Resolved      High          │
│ TCK-10011    Refund             Resolved      Medium        │
└─────────────────────────────────────────────────────────────┘
```

---

# 41. Backend-to-Salesforce Mapping

| Backend | Salesforce |
|---|---|
| Customer | Contact |
| Customer Account | Account |
| Ticket | Case |
| Ticket ID | External Ticket ID |
| Order ID | External Order ID |
| Subject | Case Subject |
| Description | Case Description |
| Status | Case Status |
| Category | Triage Category |
| Priority | Case Priority |
| Resolution | Case Resolution |

---

# 42. Salesforce-to-Backend Mapping

| Salesforce | Backend |
|---|---|
| Case ID | Salesforce Case ID |
| Status | Ticket Status |
| Priority | Ticket Priority |
| Category | Ticket Category |
| Resolution | Ticket Resolution |
| Last Modified | Ticket Updated At |

---

# 43. Implementation Phases

## Phase 1 — Customer Storefront

Build:

- Home
- Product listing
- Product details
- Cart
- Checkout
- Order confirmation

## Phase 2 — Backend

Build:

- Customer APIs
- Product APIs
- Order APIs
- Database
- Ticket APIs

## Phase 3 — Salesforce Integration

Build:

- Account/Contact synchronization
- Case creation
- Salesforce authentication
- Case mapping

## Phase 4 — Apex

Build:

- Trigger
- Handler
- Triage service
- Category rules
- Priority rules
- Assignment
- SLA

## Phase 5 — Agent Experience

Configure Salesforce Case UI:

- Case details
- Customer
- Order reference
- Triage information
- Status
- Resolution

## Phase 6 — Return Journey

Implement:

```text
Salesforce
 ↓
Backend
 ↓
Database
 ↓
Frontend
```

## Phase 7 — Final Polish

Add:

- Loading states
- Success/error messages
- Ticket timeline
- Order timeline
- Clean UI
- Sample data
- Sample customer
- Sample products

---

# 44. Future Enhancements

## AI Classification

```text
Case
 ↓
Apex
 ↓
AI Classification
 ↓
Category / Priority
```

## AI Response Suggestions

Salesforce could suggest:

```text
Recommended Response:
"Your shipment is currently delayed..."
```

## Knowledge Recommendations

```text
Case
 ↓
Knowledge Search
 ↓
Relevant Article
 ↓
Agent
```

## Event-Driven Integration

```text
Salesforce Platform Event
 ↓
Backend
 ↓
Frontend
```

## Customer Notifications

```text
Case Resolved
 ↓
Notification Service
 ↓
Email / SMS / Push
```

---

# 45. Final Architecture

```text
                         CUSTOMER
                            │
                            ▼
                 ┌─────────────────────┐
                 │    React Storefront │
                 │                     │
                 │ Home                │
                 │ Products            │
                 │ Cart                │
                 │ Orders              │
                 │ Support             │
                 └──────────┬──────────┘
                            │
                         REST API
                            │
                            ▼
                 ┌─────────────────────┐
                 │    Spring Boot      │
                 │                     │
                 │ Customer Service    │
                 │ Product Service     │
                 │ Order Service       │
                 │ Ticket Service      │
                 │ Salesforce Client   │
                 └───────┬─────┬───────┘
                         │     │
                    Database    │
                         │     │
                         │ Salesforce REST
                         │     │
                         ▼     ▼
                 ┌─────────────────────┐
                 │     Salesforce      │
                 │                     │
                 │ Account             │
                 │ Contact             │
                 │ Case                │
                 │                     │
                 │       Apex          │
                 │         │           │
                 │    ┌────┼────┐      │
                 │    ▼    ▼    ▼      │
                 │ Category Priority   │
                 │ Assignment SLA      │
                 │         │           │
                 │         ▼           │
                 │    Support Agent    │
                 └─────────┬───────────┘
                           │
                     Status / Resolution
                           │
                           ▼
                    Spring Boot
                           │
                           ▼
                       Database
                           │
                           ▼
                     React Storefront
                           │
                           ▼
                        CUSTOMER
```

---

# 46. POC Success Criteria

The POC is successful when this complete closed-loop journey works:

```text
Customer
   ↓
Browse Product
   ↓
Add to Cart
   ↓
Checkout
   ↓
Order Created
   ↓
Report Order Issue
   ↓
Backend Ticket Created
   ↓
Salesforce Case Created
   ↓
Apex Processes Case
   ↓
Category / Priority / Team / SLA
   ↓
Salesforce Agent
   ↓
Agent Resolves Case
   ↓
Backend Synchronization
   ↓
Customer Sees Resolution
```

The core message is:

> **A customer action starts in the storefront, travels through the backend into Salesforce, is processed by Apex and handled by a CRM agent, and the resulting business outcome comes all the way back to the customer-facing application.**

This brings together React, Spring Boot, database persistence, Salesforce integration, Apex business logic, CRM operations, and a complete bidirectional customer-service workflow in one focused POC.
