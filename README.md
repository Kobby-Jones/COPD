# PneumaAI — COPD Prediction System

AI-powered COPD risk prediction platform for clinical decision support.

## Quick Start

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

**Demo login credentials:**
- Email: `dr.mitchell@citymedical.org`
- Password: `password123`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Charts**: Recharts
- **Animation**: Framer Motion
- **State**: Zustand (with persistence)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Features

| Page | Description |
|------|-------------|
| `/dashboard` | Overview stats, trend charts, risk distribution |
| `/predict` | AI COPD risk prediction form with SHAP results |
| `/patients` | Searchable patient list with risk filters |
| `/patients/[id]` | Detailed patient profile view |
| `/explainability` | Global + patient-level SHAP explanations |
| `/analytics` | Population analytics, model metrics |
| `/reports` | Clinical report management |
| `/settings` | Profile, notifications, system, security |

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── auth/               # Login & forgot-password
│   ├── dashboard/          # Main dashboard
│   ├── predict/            # AI prediction form
│   ├── patients/           # Patient management
│   ├── explainability/     # SHAP explanations
│   ├── analytics/          # Population analytics
│   ├── reports/            # Report management
│   └── settings/           # User settings
├── components/
│   ├── charts/             # Recharts wrappers
│   ├── layout/             # Sidebar, Topnav
│   └── ui/                 # Button, Input, badges, etc.
├── context/                # Zustand stores
├── data/                   # Mock patient & analytics data
├── hooks/                  # useToast hook
├── lib/                    # cn(), risk utilities
├── services/               # API service layer (mock)
├── styles/                 # globals.css
└── types/                  # TypeScript interfaces
```
