
## CONTEXT & GOAL

You are building **“ApparelDesk”**, a **full-stack clothing e-commerce + backend management system**, for a hackathon hosted by **Odoo x SPIT**.

The judges explicitly value:

* Dynamic / real-time data (NOT static JSON)
* Clean, responsive UI
* Robust validation
* Clear backend API design
* Proper data modeling
* Git collaboration (multi-contributor friendly)
* Local-first & offline-aware thinking
* Avoiding Backend-as-a-Service (Firebase / Supabase etc.)

ALSO USE INDIAN RUPEES (₹) INSTEAD OF DOLLAR ($)

This project must demonstrate **engineering depth**, not just UI polish.

---

## TECH STACK (MANDATORY)

### Frontend

* **Next.js (App Router)**
* **TypeScript**
* **Tailwind CSS**
* **React Hook Form + Zod** for input validation
* **Server Actions / API Routes** (no client-only logic for critical flows)

### Backend

* **Node.js (inside Next.js OR separate Express app)**
* **PostgreSQL**
* **Prisma ORM (v6)**
* **RESTful APIs with clear separation of concerns**
* **No Backend-as-a-Service**

### Infrastructure

* **Docker (Postgres locally)**
* **GitHub Codespaces compatible**
* **Environment-based configuration**

### Automation / Alerts

* **n8n (self-hosted or local)** for:

  * Order status updates
  * Payment alerts
  * Low-stock notifications
  * Email notifications to customers & vendors

---

## NON-NEGOTIABLE ENGINEERING RULES

1. **NO static JSON for production data**
2. **Every form must have frontend + backend validation**
3. **Every API must handle errors gracefully**
4. **No business logic in UI components**
5. **No hard-coded values (use enums/constants)**
6. **Readable, modular, maintainable code**
7. **Comments only where logic is non-obvious**
8. **Clear separation between customer portal & internal backend**
9. **All DB writes must be transactional where required**
10. **Offline-aware UI (graceful degradation)**

---

## FOLDER STRUCTURE (MANDATORY)

```
/app
  /(auth)
    login/
    register/
  /(portal)
    products/
    cart/
    checkout/
    orders/
    invoices/
  /(admin)
    dashboard/
    products/
    contacts/
    sale-orders/
    purchase-orders/
    invoices/
    payments/
    reports/
  /api
    auth/
    products/
    orders/
    invoices/
    payments/
    coupons/
    reports/

/lib
  prisma.ts
  auth.ts
  validators/
  constants/
  utils/

/prisma
  schema.prisma
  migrations/

/services
  order.service.ts
  payment.service.ts
  inventory.service.ts
  coupon.service.ts
  report.service.ts

/n8n
  workflows/
```

---

## DATABASE MODELS (MANDATORY – EXACT STRUCTURE)

### Users

```
id
name
email (unique)
passwordHash
role (INTERNAL | PORTAL)
createdAt
```

### Contacts

```
id
name
type (customer | vendor | both)
email
mobile
address { city, state, pincode }
```

### Products

```
id
name
category
type
material
colors[]
stock
salesPrice
purchasePrice
tax
published (boolean)
```

### SaleOrders

```
id
customerId
status (draft | confirmed | paid | cancelled)
paymentTermId
totalAmount
createdAt
```

### PurchaseOrders

```
id
vendorId
status
totalAmount
createdAt
```

### Invoices

```
id
orderId
dueDate
paidAmount
status (unpaid | partial | paid)
```

### PaymentTerms

```
id
name
discountPercentage
discountDays
```

### DiscountOffers

```
id
percentage
startDate
endDate
```

### Coupons

```
code
status (unused | used)
contactId (optional)
```

### Payments

```
id
invoiceId
amount
method
createdAt
```

---

## PAGE-BY-PAGE FEATURE REQUIREMENTS

### 🛍️ CUSTOMER PORTAL

#### Products Page

* Fetch products dynamically from DB
* Show only `published = true`
* Filters: category, type, material
* Handle loading & empty states

#### Cart

* Stored in **localStorage (local-first)**
* Sync with backend on checkout
* Validate stock before order creation

#### Checkout

* Coupon code validation (API-based)
* Payment term = Immediate Payment
* Demo payment workflow (NO real Stripe required)
* On success:

  * Create SaleOrder
  * Trigger n8n webhook

#### Orders & Invoices

* Auth-protected
* Fetch user-specific orders only
* Download invoice PDF (generated server-side)

---

### 🧑‍💼 ADMIN / BACKEND PANEL

#### Products Management

* CRUD with stock tracking
* Publish / Unpublish toggle
* Stock auto-update on orders

#### Contacts

* Customers auto-created on signup
* Vendors manually created
* Used across all documents

#### Sale Orders

* Created from portal checkout
* Optional coupon application
* Convert to Invoice

#### Purchase Orders & Vendor Bills

* Update stock on confirmation
* Payment registration

#### Payments

* Register payments
* Update invoice status

#### Reports

* Sales by Product
* Sales by Customer
* Purchases by Vendor
* All reports generated dynamically via SQL/Prisma

---

## VALIDATION RULES (MANDATORY)

### Frontend

* React Hook Form + Zod + Zustand for state management
* Required fields, email format, numeric limits
* Disabled submit on invalid state

### Backend

* Zod / custom validators on every API
* Never trust frontend input
* Meaningful error messages
* HTTP status codes used correctly

---

## ERROR HANDLING (MANDATORY)

* Global error boundary in frontend
* Try/catch in all services
* Transaction rollback on failure
* User-friendly error messages
* Developer-friendly logs

---

## OFFLINE & LOCAL-FIRST STRATEGY

* Cart stored locally
* Forms cache draft state
* Graceful “offline” UI indicator
* Sync on reconnect

---

## N8N INTEGRATION (MANDATORY)

### Events to trigger

* New Sale Order created
* Payment received
* Invoice overdue
* Product stock below threshold

### Implementation

* Backend emits webhook to n8n
* n8n workflows:

  * Send email to customer/vendor
  * Send admin alert
  * Optional Slack/Discord webhook

Example:

```
POST /webhooks/n8n/order-created
```




