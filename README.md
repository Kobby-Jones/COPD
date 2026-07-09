# PneumaAI — COPD Prediction System (Frontend)

AI-powered COPD risk prediction platform for clinical decision support. This
Next.js app talks to the companion NestJS backend (`../copd-backend`) over a
real HTTP API — there is no mock data left in the app.

## Quick Start

```bash
npm install
cp .env.example .env.local   # already provided, edit if your API runs elsewhere
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The backend must be
running at the URL configured in `.env.local` (defaults to
`http://localhost:3001/api/v1`) — see `../copd-backend/README.md`.

**Demo login credentials** (created by the backend's `npm run seed`):
- Email: `sarah.mitchell@copdcare.example`
- Password: `ChangeMe123!`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Charts**: Recharts
- **Animation**: Framer Motion
- **State**: Zustand (with persistence)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## API Integration

All data comes from the NestJS backend via `services/api.ts`, which is a thin
wrapper around `lib/apiClient.ts`:

- JWT access/refresh tokens are stored in `localStorage` (`lib/tokenStore.ts`),
  separate from the zustand `authStore` (which only holds the display profile).
- On a `401`, the client automatically attempts a single `/auth/refresh` and
  retries the original request; if that fails, the session is cleared and the
  user is bounced to `/auth/login`.
- `NEXT_PUBLIC_API_URL` (see `.env.local`) is the only environment variable
  needed to point the app at a different backend (staging, deployed, etc).

## Breathing-Sound Recording (ICBHI mode)

The `/predict` page now has two detection modes:

1. **Clinical Questionnaire** — the original form, scored by the backend's
   rule-based `ClinicalRiskEngine` (stand-in for the trained GradientBoost
   model).
2. **Breathing Sound Recording** — records audio in-browser via
   `MediaRecorder` (`components/predict/AudioRecorder.tsx`), with a fallback
   to uploading an existing audio file. The recording is uploaded to
   `POST /respiratory-audio/upload`, and its id is submitted alongside the
   clinical form as `audioRecordingId` with `mode: "audio"` to
   `POST /predictions`.

Because the ICBHI respiratory-sound model hasn't been trained yet, the
backend responds `503 MODEL_NOT_READY` for audio-mode predictions. The
frontend handles this gracefully — `lib/apiClient.ts`'s `ApiError` exposes
`isModelNotReady`, and the predict page shows a dedicated "model not trained
yet" screen instead of a broken result. Once the model is trained and
`AUDIO_MODEL_SERVICE_URL` is set on the backend, this mode will start
returning real predictions with no frontend changes required.

## Features

| Page | Description |
|------|-------------|
| `/dashboard` | Overview stats, trend charts, risk distribution — all live |
| `/predict` | AI COPD risk prediction — clinical form or breathing-sound recording |
| `/patients` | Searchable patient list with risk filters |
| `/patients/[id]` | Detailed patient profile view |
| `/explainability` | Global + most-recent-patient SHAP explanations |
| `/analytics` | Population analytics, model metrics |
| `/reports` | Clinical report generation, listing, and PDF download |
| `/settings` | Profile, notifications, system, security |

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── auth/                # Login & forgot-password
│   ├── dashboard/            # Main dashboard
│   ├── predict/               # AI prediction — clinical + audio modes
│   ├── patients/               # Patient management
│   ├── explainability/          # SHAP explanations
│   ├── analytics/                 # Population analytics
│   ├── reports/                     # Report management
│   └── settings/                      # User settings
├── components/
│   ├── charts/               # Recharts wrappers
│   ├── layout/                # Sidebar, Topnav
│   ├── predict/                 # AudioRecorder (mic capture + upload)
│   └── ui/                       # Button, Input, badges, etc.
├── context/                # Zustand stores (user/profile only)
├── lib/
│   ├── apiClient.ts          # fetch wrapper, auth headers, token refresh
│   └── tokenStore.ts           # localStorage JWT storage
├── services/                # API service layer (real HTTP calls)
├── styles/                 # globals.css
└── types/                   # TypeScript interfaces
```

## Next Step: Training the ICBHI Model

The backend is fully scaffolded for the audio detection mode (upload,
storage, DB records, response contract) but does not train or host the model
itself. Once a respiratory-sound classifier is trained on the ICBHI
Respiratory Sound Database and served behind a small inference microservice,
point the backend's `AUDIO_MODEL_SERVICE_URL` at it — no frontend changes are
needed.
