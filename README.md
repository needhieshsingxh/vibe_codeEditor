# Vibe Code Editor

A full-stack AI-assisted code playground built with Next.js, Monaco editor, WebContainers, and Prisma.

## What This Project Is

Vibe Code Editor lets users create and manage playground projects, edit files in-browser, run project templates, and chat with an AI assistant while coding.

## Features

- Authentication with NextAuth (Google and GitHub providers)
- Monaco-based in-browser code editing
- File explorer with create, rename, and delete dialogs
- AI chat sidebar integrated with provider fallback
- Template-based playground creation (React, Next.js, Express, Vue, Hono, Angular)
- Prisma + MongoDB persistence
- Dashboard for managing and starring playgrounds

## AI Provider Options

The chat API uses providers in this order:

1. Gemini (if `GEMINI_API_KEY` is set)
2. OpenAI-compatible API (if `OPENAI_API_KEY` is set)
3. Ollama (fallback for local model hosting)

You can use only one provider or keep fallback providers configured.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Prisma ORM
- MongoDB Atlas
- NextAuth v5 (beta)
- Monaco Editor + WebContainers

## Run Locally

## 1) Prerequisites

- Node.js 20+ recommended
- npm (comes with Node.js)
- MongoDB Atlas connection string
- At least one AI provider key (Gemini recommended)

## 2) Install Dependencies

```bash
npm install
```

## 3) Configure Environment Variables

Create a local `.env` file in the project root and add values like this:

```env
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>/<db-name>"

AUTH_SECRET="your-long-random-secret"
AUTH_TRUST_HOST=true

GITHUB_ID="your-github-oauth-client-id"
GITHUB_SECRET="your-github-oauth-client-secret"

GOOGLE_ID="your-google-oauth-client-id"
GOOGLE_SECRET="your-google-oauth-client-secret"

# Preferred AI provider
GEMINI_API_KEY="your-gemini-api-key"
# Optional (defaults to gemini-2.0-flash)
GEMINI_MODEL="gemini-2.0-flash"

# Optional OpenAI-compatible fallback
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
OPENAI_BASE_URL="https://api.openai.com/v1"

# Optional Ollama fallback (local)
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="codellama:latest"
```

## 4) Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 5) Build for Production (Optional Local Check)

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - run app in development mode
- `npm run build` - generate Prisma client and build Next.js app
- `npm run start` - start production server
- `npm run lint` - run ESLint

## Screenshots
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/942b7db7-8136-40bc-a759-fef4bc550c29" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/662141f2-0c82-45a0-b257-186651cf08c8" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/83ce608f-3b88-46b8-939f-f7482f9105a3" />


## Deployment

This app is ready for Vercel deployment.

Required env vars on Vercel:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST`
- `GEMINI_API_KEY` (if using Gemini)
- OAuth vars if auth providers are enabled (`GOOGLE_ID`, `GOOGLE_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`)

