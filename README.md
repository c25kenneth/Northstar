# Northstar

An AI agent that lives in Slack, proposes experiments, and ships code.

Northstar exists because product iteration has become the new bottleneck—and AI can now close the loop between insight, code, and impact.

## What it does

```
You: "northstar, how are our DAUs looking?"
Northstar: "DAUs at 2,847 users, up 18% from last week.
           Mobile engagement increased 31% after navigation improvements."

You: "propose an experiment to improve retention"
Northstar: [Analyzes codebase, proposes experiment with confidence scores]

You: "make it happen"
Northstar: "PR #47 is up. This should improve perceived performance
           without touching backend."
```

Northstar analyzes your analytics, understands your codebase, proposes changes, and opens PRs. All from Slack.

## System Overview

We built a two-stage system to keep latency under 1 second for most queries:

**Stage 1: Triage** (200ms)
```python
# Fast classification determines which tools are needed
CASUAL_CHAT       → Slack only
REPO_ANALYSIS     → Captain knowledge base + Slack
ANALYTICS_QUERY   → PostHog + Slack
CODE_CHANGE       → GitHub + Northstar MCP + Slack
EXPERIMENT_PROPOSAL → All tools
```

**Stage 2: Execute**
```
Only loads the MCP servers needed for this specific request
├─ Slack MCP (OAuth-enabled)
├─ GitHub MCP (PR creation)
├─ PostHog MCP (analytics)
└─ Northstar MCP (custom experiment tools)
```

The triage pattern means simple queries don't pay the cost of loading unused tools.

### Stack

```
Slack Events API
    ↓
FastAPI + Background Tasks
    ↓
Metorial MCP Orchestration (GPT-4o)
    ↓
    ├─ Slack MCP
    ├─ GitHub MCP
    ├─ PostHog MCP
    └─ Northstar MCP → Morph API (code generation)
```

Data layer: Supabase for experiment tracking and state.

Knowledge layer: Captain for codebase indexing (infinite context windows).

## Setup

**Prerequisites:** Python 3.12+, Node.js 18+, UV package manager

**Backend:**
```bash
cd backend
uv sync
cp .env.example .env  # Add API keys
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env  # Add Supabase credentials
npm run dev
```

**Database:** Create Supabase project, run schema from `backend/SUPABASE_SCHEMA.md`

Connect a GitHub repo through the frontend at `localhost:5173`, then start messaging in Slack.

## Implementation notes

- 2,616 lines in `main.py` (core orchestrator)
- Type-safe with comprehensive hints throughout
- Async-first with FastAPI background tasks
- Agent personality system makes responses feel like a calm engineer, not a chatbot
- Rich Slack markdown formatting (no blocks, just clean text)

The triage system was the key architectural choice. Loading all MCP servers upfront added 3-5s latency even for "hey northstar" queries. Now simple messages respond in under a second.

## What's next

- Feed PR outcomes back into confidence models
- Multi-repo coordination for microservices
- Automatic A/B test creation with feature flags
- Slack threads for full conversation context

## Built with

[Metorial](https://metorial.com), [Morph](https://morphllm.com), [Captain](https://runcaptain.com), [PostHog](https://posthog.com), [Supabase](https://supabase.com), FastAPI, React, TailwindCSS

---

Built for YC Agent Hacks, January 2025
