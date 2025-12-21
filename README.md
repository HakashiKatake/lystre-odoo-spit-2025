# 🛍️ Lystré - Fashion E-Commerce Platform

> **Odoo × SPIT Hackathon 2024**

Lystré is a modern, full-featured fashion e-commerce platform built with Next.js 15, featuring a beautiful neobrutalism-inspired admin dashboard and an elegant customer portal. The platform provides complete inventory management, order processing, customer engagement features, and a seamless shopping experience.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)

---

## ✨ Features

### 🏪 Customer Portal
- **Product Catalog** - Browse products with filters (category, type, material, price, color)
- **Product Details** - View images, sizes, descriptions with zoom functionality
- **Shopping Cart** - Add/remove items, quantity management, order summary
- **Wishlist** - Save products for later, share wishlist
- **Product Reviews** - Rate & review products, filter by rating/size/body type
- **Recently Viewed** - Track browsing history for easy access
- **Size Guide** - Interactive size chart, "Find My Size" quiz, brand comparisons
- **Find Your Fit** - AI-powered outfit recommendations by occasion
- **Checkout** - Complete order placement with address management
- **Order History** - Track past orders and their status
- **Discounts** - Product-level discounts with strikethrough pricing

### 🔧 Admin Dashboard (Neobrutalism UI)
- **Dashboard** - Revenue metrics, pending orders, quick actions
- **Products** - CRUD operations, image management, pricing with discounts
- **Contacts** - Customer & vendor management
- **Sale Orders** - Order processing, confirmation, invoice generation
- **Purchase Orders** - Vendor order management
- **Invoices** - Customer invoice tracking and payments
- **Vendor Bills** - Expense management
- **Payments** - Track customer & vendor payments
- **Discount Offers** - Create promotional campaigns
- **Coupons** - Generate and manage discount codes
- **Reports** - Business intelligence with charts
- **User Management** - Role-based access control

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | TailwindCSS + Custom RetroUI Components |
| **Database** | PostgreSQL |
| **ORM** | Prisma 6 |
| **State Management** | Zustand (with persistence) |
| **Authentication** | JWT (Custom implementation) |
| **UI Components** | Radix UI, Lucide Icons, Framer Motion |
| **Charts** | Recharts |
| **Notifications** | Sonner (Toast) |

---

## 📁 Project Structure

```
├── app/
│   ├── (portal)/           # Customer-facing pages
│   │   ├── products/       # Product listing & details
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout flow
│   │   ├── orders/         # Order history
│   │   ├── wishlist/       # Saved products
│   │   ├── find-your-fit/  # Style recommendations
│   │   └── account/        # User account
│   ├── admin/              # Admin dashboard
│   │   ├── products/       # Product management
│   │   ├── contacts/       # Contact management
│   │   ├── sale-orders/    # Sales management
│   │   ├── invoices/       # Invoice management
│   │   └── ...
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication
│   │   ├── products/       # Product CRUD
│   │   ├── reviews/        # Product reviews
│   │   └── ...
│   └── components/         # Shared components
├── components/
│   ├── retroui/            # Neobrutalism UI components
│   └── ui/                 # Shadcn/Radix components
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── store.ts            # Zustand stores
│   ├── auth.ts             # JWT utilities
│   ├── utils.ts            # Helper functions
│   └── validators.ts       # Zod schemas
└── prisma/
    └── schema.prisma       # Database schema
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/lystre.git
   cd lystre
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/lystre"
   JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Seed initial data (optional)**
   ```bash
   npx prisma db seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   - Customer Portal: [http://localhost:3000](http://localhost:3000)
   - Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## ☁️ Deployment Guide

### Step 1: Set Up PostgreSQL on Render

1. **Create a Render account**
   - Go to [render.com](https://render.com) and sign up

2. **Create a new PostgreSQL database**
   - Click **New** → **PostgreSQL**
   - Configure:
     - **Name**: `lystre-db`
     - **Database**: `lystre`
     - **User**: `lystre_user`
     - **Region**: Choose closest to your users
     - **Plan**: Free (or Starter for production)
   - Click **Create Database**

3. **Get the connection string**
   - Wait for the database to be ready
   - Copy the **External Database URL** (looks like):
     ```
     postgresql://lystre_user:password@dpg-xxx.render.com:5432/lystre
     ```

### Step 2: Deploy to Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create a Vercel account**
   - Go to [vercel.com](https://vercel.com) and sign up with GitHub

3. **Import your project**
   - Click **Add New** → **Project**
   - Select your GitHub repository
   - Click **Import**

4. **Configure environment variables**
   - Before deploying, add these environment variables:
   
   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Render PostgreSQL External URL |
   | `JWT_SECRET` | A secure random string (32+ chars) |
   
   > 💡 Generate a secure JWT secret:
   > ```bash
   > openssl rand -base64 32
   > ```

5. **Configure build settings**
   - Framework Preset: **Next.js**
   - Build Command: `npx prisma generate && npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

6. **Deploy**
   - Click **Deploy**
   - Wait for the build to complete (3-5 minutes)

7. **Initialize the database**
   - After deployment, run from your local machine:
     ```bash
     # Set the production DATABASE_URL temporarily
     export DATABASE_URL="your-render-postgresql-url"
     
     # Push the schema to production
     npx prisma db push
     ```

### Step 3: Post-Deployment

1. **Verify the deployment**
   - Visit your Vercel URL (e.g., `https://lystre.vercel.app`)
   - Test both customer portal and admin dashboard

2. **Create an admin user**
   - Use the signup page or create directly in the database
   - Set `role` to `INTERNAL` for admin access

3. **Configure your domain (optional)**
   - In Vercel: **Settings** → **Domains**
   - Add your custom domain

---

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens (32+ chars) | ✅ |

### Example `.env` file
```env
# Database (Render PostgreSQL)
DATABASE_URL="postgresql://lystre_user:yourpassword@dpg-xxx.oregon-postgres.render.com:5432/lystre"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Reviews
- `GET /api/reviews?productId=xxx` - Get product reviews
- `POST /api/reviews` - Create review
- `POST /api/reviews/[id]/helpful` - Mark review helpful

### Orders
- `GET /api/sale-orders` - List orders
- `POST /api/sale-orders` - Create order
- `GET /api/sale-orders/[id]` - Get order details

---

## 🎨 Design System

### Colors (Customer Portal)
```css
--primary: #8B7355      /* Warm Brown */
--secondary: #F5EBE0    /* Cream */
--accent: #2B1810       /* Dark Brown */
--background: #FFFEF9   /* Off White */
```

### Colors (Admin Dashboard - Neobrutalism)
```css
--lystre-brown: #8B7355
--border: #000000
--shadow: 4px 4px 0px rgba(0,0,0,1)
```

---

## 🤝 Team

Built with ❤️ for the **Odoo × SPIT Hackathon 2024**

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test your database connection
npx prisma db pull
```

### Build Errors on Vercel
- Ensure `prisma generate` is in your build command
- Check that all environment variables are set

### Prisma Client Issues
```bash
# Regenerate the Prisma client
rm -rf node_modules/.prisma
npx prisma generate
```

---

**Happy Coding! 🚀**
