# Environment Variable Checklist

## For Proposal Generation to Work

### Backend Environment Variables (REQUIRED for fetching code):

1. **GITHUB_TOKEN** - Required to fetch repository code from GitHub
   ```bash
   GITHUB_TOKEN=ghp_your_github_token_here
   ```
   - This must be set in your **backend** environment (not the MCP server)
   - Used by `fetch_repository_context()` function
   - Must have `repo` scope to read repository contents

### Backend Environment Variables (For MCP Tool):

2. **NORTHSTAR_MCP_DEPLOYMENT_ID** - Required for using the MCP tool
   ```bash
   NORTHSTAR_MCP_DEPLOYMENT_ID=your_deployment_id_here
   ```

3. **METORIAL_API_KEY** - Required for Metorial orchestration
   ```bash
   METORIAL_API_KEY=your_metorial_api_key
   ```

4. **OPENAI_API_KEY** - Required for OpenAI models
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   ```

## How to Check

1. **Check if GITHUB_TOKEN is set in backend:**
   ```python
   import os
   print("GITHUB_TOKEN:", "SET" if os.getenv("GITHUB_TOKEN") else "NOT SET")
   ```

2. **Check backend logs for:**
   - "GITHUB_TOKEN not set" messages
   - "Insufficient codebase context" errors
   - Repository fetching errors

3. **Common Issues:**
   - GITHUB_TOKEN not set → Backend can't fetch code → AI says "can't access repositories"
   - GITHUB_TOKEN set but wrong scope → Can't read repo contents
   - NORTHSTAR_MCP_DEPLOYMENT_ID not set → Falls back to direct generation (may still work)

