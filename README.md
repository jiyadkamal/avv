# Accident Vehicle Verification System (AVV)

A premium, production-ready Next.js 14 application for a crowdsourced accident reporting and verification platform.

## ✨ Features

- **Multifaceted Dashboards**: Tailored experiences for Admins, Contributors, and Subscribers.
- **Premium UI/UX**: Built with Tailwind CSS and Framer Motion for smooth, high-end animations and transitions.
- **Real-time Analytics**: Visualized system performance and revenue with Recharts.
- **Robust Authentication**: Secure auth flow using Supabase Auth with role-based redirection.
- **Crowdsourced Reporting**: Easy-to-use upload flow for contributors to submit vehicle data.
- **Instant Search**: Subscriber-focused vehicle history search with instant results.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State Management**: Zustand + TanStack Query
- **Backend**: Supabase (Auth & API)
- **Toasts**: Sonner

## 🔐 User Roles

1. **Admin**: Platform oversight, report moderation (approve/reject), and user management.
2. **Contributor**: Submit accident reports with evidence and track earnings.
3. **Subscriber**: Search for vehicles by VIN/Plate and view verified accident histories.

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Supabase project (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.local.example` to `.env.local` and fill in your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `/src/app`: Application routes and pages
  - `/(auth)`: Premium login and registration flows
  - `/admin`: Administrative tools and moderation
  - `/contributor`: Reporting and earnings management
  - `/subscriber`: Search portal and vehicle history
- `/src/components`: Reusable UI elements
  - `/ui`: Custom Shadcn/ui core components
  - `/layout`: Global Sidebar, Header, and Dashboard layouts
- `/src/lib`: Core utilities and animation helpers
- `/src/stores`: Client-side state (Zustand)

## 🧪 Verification

To ensure a production-ready build:
```bash
npm run build
```

## 📄 License

MIT
