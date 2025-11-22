# 📦 StockMaster - Inventory Management System

A modern, full-stack inventory management system built with Next.js 14, TypeScript, Supabase, and Tailwind CSS. Features comprehensive stock tracking, document management, and multiple authentication methods including Google OAuth and OTP email verification.

## ✨ Features

### 🔐 Authentication
- **Email & Password Login** - Traditional authentication with Supabase
- **Google OAuth** - One-click sign-in with Google account
- **OTP Email Verification** - Passwordless login via email OTP
- Secure session management with JWT tokens
- Password recovery flow

### 📊 Inventory Management
- **Product Management** - Create, edit, delete, and track products
- **Warehouse Management** - Multi-warehouse support with location tracking
- **Document System** - Receipts, Deliveries, Transfers, and Adjustments
- **Stock Ledger** - Complete history of all stock movements
- **Real-time Dashboard** - KPIs and statistics visualization

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Beautiful gradient themes
- Interactive forms with validation
- Real-time data updates
- Clean and intuitive interface

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: NextAuth.js, Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Email**: Nodemailer with Gmail SMTP
- **State Management**: React Query (TanStack Query)
- **Form Validation**: Zod schemas

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Console account (for OAuth)
- Gmail account with App Password (for OTP emails)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/Somicool/Odoo-SPNIT.git
cd Odoo-SPNIT

2. Install dependencies
Set up environment variables
Copy .env.example to .env.local:
cp .env.example .env.local

