# Quick Start Guide

## Prerequisites Check

- ✅ Python 3.12+ installed
- ✅ Node.js 18+ installed  
- ✅ UV installed (`pip install uv` or from https://github.com/astral-sh/uv)
- ✅ Supabase account
- ✅ GitHub Personal Access Token
- ✅ Metorial API Key
- ✅ Morph API Key

## Step-by-Step Setup

### 1️⃣ Set Up Supabase Database

1. Go to https://supabase.com and create a new project
2. In your project, go to **SQL Editor**
3. Copy all SQL from `backend/SUPABASE_SCHEMA.md` and run it
4. Go to **Project Settings → API** and copy:
   - Project URL
   - Service Role Key (keep this secret!)
   - Anon Key (for frontend)

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Create .env file (create a new file named .env)
# Copy the content below and fill in your values:

# ==========================================
# Backend .env file content:
# ==========================================
METORIAL_API_KEY=your_key_here
SLACK_DEPLOYMENT_ID=your_deployment_id
GITHUB_DEPLOYMENT_ID=your_github_deployment_id

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

GITHUB_TOKEN=your_github_token_here

MORPH_API_KEY=your_morph_key_here
# ==========================================

# Install Python dependencies
uv sync

# Run the backend server
uvicorn main:app --reload
```

✅ Backend should be running on `http://localhost:8000`

### 3️⃣ Frontend Setup

Open a **new terminal window**:

```bash
# Navigate to frontend
cd frontend

# Create .env file (create a new file named .env)
# Copy the content below and fill in your values:

# ==========================================
# Frontend .env file content:
# ==========================================
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
# ==========================================

# Install Node dependencies
npm install

# Run the frontend server
npm run dev
```

✅ Frontend should be running on `http://localhost:5173`

### 4️⃣ Verify Setup

1. **Check Backend**: Open `http://localhost:8000` - should see `{"status":"healthy",...}`
2. **Check Frontend**: Open `http://localhost:5173` - should see login page
3. **Check API Docs**: Open `http://localhost:8000/docs` - should see FastAPI Swagger UI

### 5️⃣ Connect Your First Integration

1. Open `http://localhost:5173` in your browser
2. Navigate to **Settings** page
3. **Connect GitHub Repository**:
   - Enter your repo in format: `owner/repo-name`
   - Click "Connect GitHub Repository"
4. **(Optional) Connect Slack**:
   - Click "Connect Slack Workspace"
   - Authorize in the popup

### 6️⃣ Create Your First Experiment

1. In Settings, click **"Trigger Experiment"**
2. Wait for proposal to generate (takes ~30 seconds)
3. Go to **Dashboard** - you should see your new proposal
4. Click on the proposal card to view details
5. Enter Fast Apply format code in "Planned Changes"
6. Click **"Approve & Execute"**
7. This will create a GitHub PR! 🎉

## Troubleshooting

**Backend won't start?**
- Check that all `.env` variables are set
- Run `uv sync` again
- Check Python version: `python --version` (should be 3.12+)

**Frontend won't start?**
- Check that `.env` file exists in `frontend/` directory
- Run `npm install` again
- Check Node version: `node --version` (should be 18+)

**Can't connect to Supabase?**
- Verify tables are created (check Supabase Dashboard → Table Editor)
- Check that `SUPABASE_URL` and keys are correct
- Ensure RLS policies allow service role access

**OAuth not working?**
- Check that `SLACK_DEPLOYMENT_ID` is set (if using Slack)
- Ensure popup blockers are disabled
- Check browser console for errors

## Need Help?

- See `SETUP.md` for detailed setup instructions
- Check `backend/SUPABASE_SCHEMA.md` for database schema
- Backend API docs: `http://localhost:8000/docs`

