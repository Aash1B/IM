# 🚗 Instant Mechanic Ops Center — Live Operations Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-Analytics-FF5A00?style=for-the-badge)](https://recharts.org/)

An internal **Live Operations Control Platform** engineered for **Instant Mechanic**. This platform allows the operations team to monitor citywide vehicle service dispatches, active bookings, field technician locations, revenue metrics, and operational lifecycles in real time.

---

## 📌 Project Overview

Instant Mechanic operates hundreds of vehicle repair and maintenance bookings across major cities (Delhi NCR, Bangalore). This application serves as the **Internal Operations Command Center** for managing:
- **Citywide Booking Lifecycles**: Tracking bookings from `PENDING` → `ASSIGNED` → `MECHANIC_ON_THE_WAY` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`.
- **Field Mechanics Roster**: Monitoring real-time statuses (`AVAILABLE`, `ASSIGNED`, `ON_THE_WAY`, `BUSY`, `OFFLINE`) and live GPS locations.
- **Financial & Operational Analytics**: Live breakdown of revenue, daily volume trends, and service category distributions.
- **Customer Directory**: Customer profiles, spending metrics, and booking histories.

The frontend is architected **independently from the backend** using a clean service layer, native `fetch` HTTP client, and mock API adapter matching the NestJS backend API specs 1-to-1.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router) & React
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & Custom CSS variables
- **Brand System**: Instant Mechanic Design Language (Vibrant Orange `#FF5A00`, Deep Charcoal `#171512`, Warm Cream Background `#FFF9EF`, Custom Grid Texture)
- **Charts & Data Visualization**: Recharts (Area, Line, Donut, Bar charts)
- **Icons**: Lucide React
- **API Client**: Native Browser `fetch` Abstraction (`src/lib/api.ts`)

---

## 🏗 Architecture

The frontend follows a clean **Separation of Concerns** architecture:

```
┌───────────────────────────────────────────────────────────┐
│                       UI Layer                            │
│  Pages (/dashboard/overview, /bookings, /mechanics, etc.) │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                      Custom Hooks                         │
│  (useDashboard, useBookings, useMechanics, useAuth, etc.) │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                      Service Layer                        │
│ (dashboard.service.ts, booking.service.ts, auth.service) │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────┴─────────────────────────────┐
│                 Native fetch API Adapter                  │
│       (http://localhost:3000/api/v1 OR Mock Adapter)       │
└───────────────────────────────────────────────────────────┘
```

---

## 🚀 Local Setup Guide

### 1. Prerequisites
- Node.js 18+ and `npm` installed.

### 2. Installation
Navigate into the `frontend` directory:
```bash
cd frontend
npm install
```

### 3. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Demo Login Credentials
Click the **"Fill Credentials"** button on the sign-in page or use:
- **Email**: `admin@instantmechanic.com`
- **Password**: `Password123!`

---

## ⚙️ Environment Variables

Create a `.env.local` file inside `frontend/` if connecting to a custom backend:

```env
# API Base Endpoint URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Development Mock Flag (set to 'false' when connecting to live NestJS backend)
NEXT_PUBLIC_USE_MOCK=true
```

---

## 📡 API Documentation & Endpoints

The frontend client consumes the following NestJS REST API endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate ops admin user & return JWT token |
| `GET` | `/api/v1/dashboard` | Fetch 8 core KPI operational metrics |
| `GET` | `/api/v1/dashboard/analytics` | Fetch chart datasets (Bookings, Revenue, Donut, Services) |
| `GET` | `/api/v1/bookings` | List bookings with search, status, date, amount, sorting & pagination |
| `GET` | `/api/v1/bookings/:id` | Get single booking specification details |
| `PATCH` | `/api/v1/bookings/:id/status` | Update booking lifecycle status (`PENDING` → `COMPLETED`) |
| `GET` | `/api/v1/bookings/export` | Download filtered bookings CSV report |
| `GET` | `/api/v1/mechanics` | List mechanics roster with status & current assignment |
| `GET` | `/api/v1/mechanics/:id` | Get mechanic profile & performance metrics |
| `GET` | `/api/v1/mechanics/locations` | Fetch field mechanic live GPS coordinates |
| `GET` | `/api/v1/customers` | Fetch customer directory & expenditure metrics |
| `GET` | `/api/v1/notifications` | Fetch unread activity notifications |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark notification as read |

---

## ☁️ Deployment (Vercel)

To deploy the frontend to **Vercel**:
1. Push your repository to **GitHub**.
2. Import `trial/frontend` into Vercel.
3. Configure `NEXT_PUBLIC_API_URL` in environment variables.
4. Deploy!

---

## 🤖 AI Usage Disclosure

As encouraged by the internship assignment instructions:
- **AI Tools Used**: Antigravity AI, Gemini 3.6 Flash (Medium).
- **Usage Scope**:
  - Initial project scaffolding & TypeScript type definitions.
  - Designing brand-aligned Tailwind CSS design system tokens matching the Instant Mechanic reference website screenshots.
  - Generating realistic Indian seed mock datasets (110+ bookings, 30 mechanics with Delhi NCR GPS coordinates).
- **Personal Implementation & Refinements**:
  - Architected native `fetch` service abstraction to enable seamless switching between mock & NestJS production backends.
  - Designed the interactive booking timeline stepper and state update modal.
  - Custom color palette tuning (`#FF5A00`, `#171512`, `#FFF9EF`, `#F4F4F0`) and proportional visual typography.
