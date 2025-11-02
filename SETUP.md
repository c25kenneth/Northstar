# Setup and Running Guide

This guide will help you set up and run the Northstar application.

## Prerequisites

- **Python 3.12+** (for backend)
- **Node.js 18+** (for frontend)
- **UV** (Python package manager) - Install from https://github.com/astral-sh/uv
- **Supabase Account** (for database)
- **GitHub Personal Access Token** (for PR creation)
- **Metorial API Key** (for AI orchestration)
- **Morph API Key** (for code merging)
- **Slack Deployment ID** (optional, for Slack integration)

## Step 1: Set Up Supabase Database

1. **Create a Supabase project** at https://supabase.com
2. **Run the database schema**:
   - Go to your Supabase project → SQL Editor
   - Copy and run the SQL from `backend/SUPABASE_SCHEMA.md`
   - This creates the tables: `repositories`, `proposals`, `experiments`, `activity_logs`

3. **Get your Supabase credentials**:
   - Project URL: Found in Project Settings → API
   - Service Role Key: Found in Project Settings → API (use this for backend)

## Step 2: Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create `.env` file**:
   ```bash
   # Backend Environment Variables
   # Metorial & AI
   METORIAL_API_KEY=your_metorial_api_key
   OPENAI_API_KEY=your_openai_api_key  # Required for Metorial.run()
   SLACK_DEPLOYMENT_ID=your_slack_deployment_id
   GITHUB_DEPLOYMENT_ID=your_github_deployment_id
   NORTHSTAR_MCP_DEPLOYMENT_ID=your_northstar_mcp_deployment_id  # Optional
   
   # Supabase
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   # OR use anon key if RLS policies allow:
   # SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # GitHub
   GITHUB_TOKEN=your_github_personal_access_token
   
   # Morph API
   MORPH_API_KEY=your_morph_api_key
   MORPH_BASE_URL=https://api.morphllm.com/v1  # Optional, defaults to this
   
   # Optional: Default target repo/file (if not provided in requests)
   TARGET_REPO=owner/repo
   TARGET_FILE=path/to/file
   ```

3. **Install dependencies**:
   ```bash
   uv sync
   ```
   This will create a virtual environment and install all Python dependencies.

4. **Run the backend server**:
   ```bash
   # Using uvicorn directly
   uvicorn main:app --reload

   # OR using uv
   uv run uvicorn main:app --reload
   ```

   The backend will run on `http://localhost:8000`

5. **Verify backend is running**:
   - Visit `http://localhost:8000` - should see `{"status":"healthy",...}`
   - Visit `http://localhost:8000/docs` - FastAPI Swagger documentation

## Step 3: Frontend Setup

1. **Navigate to frontend directory** (in a new terminal):
   ```bash
   cd frontend
   ```

2. **Create `.env` file**:
   ```bash
   # Frontend Environment Variables
   VITE_API_URL=http://localhost:8000
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173` (or next available port)

5. **Verify frontend is running**:
   - Open `http://localhost:5173` in your browser
   - You should see the login page

## Step 4: Initial Setup in the App

1. **Connect GitHub Repository**:
   - Go to Settings page
   - Enter your repository in format `owner/repo`
   - Click "Connect GitHub Repository"

2. **Connect Slack (Optional)**:
   - Go to Settings page
   - Click "Connect Slack Workspace"
   - Authorize in the popup window

3. **Create Your First Proposal**:
   - Go to Settings page
   - Click "Trigger Experiment"
   - Wait for proposal to be generated
   - Check Dashboard for the new proposal

4. **Approve and Execute**:
   - Click on a proposal card in Dashboard
   - Review the proposal details
   - Enter Fast Apply format code in "Planned Changes"
   - Click "Approve & Execute"
   - This will create a GitHub PR!

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `METORIAL_API_KEY` | ✅ Yes | Your Metorial API key |
| `OPENAI_API_KEY` | ✅ Yes | Your OpenAI API key (required for Metorial.run()) |
| `SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key (recommended) |
| `GITHUB_TOKEN` | ✅ Yes | GitHub personal access token |
| `MORPH_API_KEY` | ✅ Yes | Morph API key for code merging |
| `SLACK_DEPLOYMENT_ID` | ⚠️ Optional | Slack MCP deployment ID |
| `GITHUB_DEPLOYMENT_ID` | ⚠️ Optional | GitHub MCP deployment ID |
| `NORTHSTAR_MCP_DEPLOYMENT_ID` | ⚠️ Optional | Northstar MCP deployment ID |
| `TARGET_REPO` | ⚠️ Optional | Default repository (owner/repo) |
| `TARGET_FILE` | ⚠️ Optional | Default file path |

### Frontend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ⚠️ Optional | Backend API URL (defaults to `http://localhost:8000`) |
| `VITE_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anon key |

## Troubleshooting

### Backend Issues

**Port already in use**:
```bash
# Use a different port
uvicorn main:app --reload --port 8001
```

**Module not found errors**:
```bash
# Reinstall dependencies
uv sync
```

**Supabase connection errors**:
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check that RLS policies allow service role access
- Ensure tables are created (run SQL from `SUPABASE_SCHEMA.md`)

**Morph API errors**:
- Verify `MORPH_API_KEY` is correct
- Check API rate limits

### Frontend Issues

**Can't connect to backend**:
- Verify backend is running on `http://localhost:8000`
- Check `VITE_API_URL` in `.env` matches backend URL
- Check CORS settings in backend (should allow `http://localhost:5173`)

**Supabase connection errors**:
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check RLS policies allow authenticated users to read

**OAuth redirect issues**:
- Ensure Slack redirect URL is configured in your Slack app settings
- Check that popup blockers aren't blocking the OAuth popup

## Common Commands

### Backend
```bash
# Install dependencies
uv sync

# Run server
uvicorn main:app --reload

# Run with custom port
uvicorn main:app --reload --port 8001

# Run with uv
uv run uvicorn main:app --reload
```

### Frontend
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Next Steps

1. ✅ Set up Supabase database
2. ✅ Configure environment variables
3. ✅ Run backend server
4. ✅ Run frontend server
5. ✅ Connect GitHub repository
6. ✅ Connect Slack (optional)
7. ✅ Create your first experiment!

## Support

- Backend API docs: `http://localhost:8000/docs`
- Supabase dashboard: Your Supabase project dashboard
- Check logs in terminal for errors

