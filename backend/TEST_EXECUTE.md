# Testing Execute Code Change Tool

## Issue: Metorial Not Calling execute_code_change Tool

### Symptoms
- ✅ Slack notifications work (proposals are created)
- ❌ No PRs created when approving proposals
- Metorial says "I'm sorry, I can't perform the action"

### Possible Causes

1. **Deployment ID Mismatch**
   - `NORTHSTAR_MCP_DEPLOYMENT_ID` doesn't match actual deployment
   - Check: `echo $NORTHSTAR_MCP_DEPLOYMENT_ID` in backend
   - Verify in Metorial dashboard

2. **Deployment Not Active**
   - MCP server deployment is paused or not running
   - Check Metorial dashboard for deployment status

3. **Tool Not Discovered**
   - Metorial can't see tools from the deployment
   - Tool might not be properly registered
   - Check `server.ts` has `execute_code_change` registered

4. **Wrong Deployment Type**
   - Using wrong deployment (Slack/GitHub instead of MCP)
   - Deployment ID format might be wrong

### Debug Steps

1. **Test Deployment** (use debug endpoint):
   ```bash
   curl http://localhost:8000/debug/mcp-deployment
   ```
   This will show what Metorial can see from the deployment.

2. **Check Backend Logs**:
   Look for:
   - `NORTHSTAR_MCP_DEPLOYMENT_ID: <id>`
   - `Deployments config: [{'serverDeploymentId': '<id>'}]`
   - `Metorial run completed. Result: ...`

3. **Verify Deployment**:
   - Log into Metorial dashboard
   - Find your MCP server deployment
   - Copy the exact deployment ID
   - Update `backend/.env` with correct ID

4. **Check Tool Registration**:
   - Verify `execute_code_change` is in `server.ts`
   - Tool should be registered with `server.registerTool()`
   - Check tool name is exactly: `execute_code_change`

5. **Redeploy MCP Server**:
   ```bash
   cd backend/northstar_mcp_typescript
   metorial deploy
   ```
   Copy the new deployment ID to `backend/.env`

### Quick Fix

If Metorial keeps refusing, try:
1. Verify deployment ID is correct
2. Redeploy MCP server
3. Restart backend after updating `.env`
4. Test again

### Expected Behavior

When working correctly:
1. User clicks "Approve & Create PR"
2. Backend calls Metorial with deployment
3. Metorial discovers `execute_code_change` tool
4. Metorial calls the tool with parameters
5. Tool clones repo, creates branch, creates PR
6. Tool returns PR URL
7. Backend extracts PR URL and updates experiment
8. Slack notification sent with PR URL

