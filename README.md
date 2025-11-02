# Northstar

Autonomous AI agent that proposes, executes, and learns from product experiments.

## Overview

Northstar uses Metorial's MCP protocol to orchestrate AI-powered code changes via Morph, creating real GitHub PRs for human review.

**Key Features:**
- AI-generated experiment proposals
- Automated code editing with Morph Fast Apply
- Real GitHub PR creation
- Slack integration for approvals

## Architecture

```
Slack/API → FastAPI → Metorial (AI Orchestrator)
                         ↓
              ┌──────────┼──────────┐
              ↓          ↓          ↓
         Northstar   GitHub     Slack
         MCP Tools   MCP        MCP
              ↓
         Morph API
```

## Quick Start

### 1. Set Up Supabase Database

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `backend/SUPABASE_SCHEMA.md` in Supabase SQL Editor
3. Get your Supabase URL and Service Role Key from Project Settings → API

### 2. Backend Setup

```bash
cd backend

# Create .env file with required variables (see SETUP.md for details)
# Required: METORIAL_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GITHUB_TOKEN, MORPH_API_KEY

# Install dependencies
uv sync

# Run the server
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Create .env file with:
# VITE_API_URL=http://localhost:8000
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Initial Setup in App

1. Open `http://localhost:5173`
2. Go to Settings page
3. Connect GitHub repository (format: `owner/repo`)
4. (Optional) Connect Slack workspace
5. Trigger your first experiment!

## Detailed Setup

See [SETUP.md](./SETUP.md) for complete setup instructions, environment variables, and troubleshooting.

## Tech Stack

- **Backend:** FastAPI, Metorial SDK, Morph API, GitPython, PyGithub
- **Frontend:** React 19, Vite 7, TailwindCSS 4
- **AI:** OpenAI GPT-4o, Metorial MCP Protocol

## License

MIT
