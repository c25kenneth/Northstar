# Verify MCP Server Deployment

If you're getting "tool is not part of the available functions", verify your deployment setup:

## Steps to Verify

### 1. Check Environment Variable

Make sure `NORTHSTAR_MCP_DEPLOYMENT_ID` is set in your backend environment:

```bash
echo $NORTHSTAR_MCP_DEPLOYMENT_ID
```

Or check your `.env` file:
```bash
NORTHSTAR_MCP_DEPLOYMENT_ID=your_deployment_id_here
```

### 2. Verify Deployment Exists

The deployment ID should match a deployment in Metorial. Check that:
- The MCP server is actually deployed to Metorial
- The deployment ID is correct
- The deployment is active

### 3. Check Tool Registration

Verify the tool is registered in your MCP server:

**For TypeScript server** (`backend/northstar_mcp_typescript/server.ts`):
- Tool name: `execute_code_change`
- Should be registered with `server.registerTool()`

**For Python server** (`backend/northstar_mcp/server.py`):
- Tool name: `execute_code_change`
- Should be in the `list_tools()` return value

### 4. Check Server Type

Which server are you using?
- **TypeScript**: Uses `@metorial/mcp-server-sdk` (recommended)
- **Python**: Uses standard MCP SDK

Make sure you've deployed the correct server type.

### 5. Verify Deployment Format

The deployment should be passed correctly to Metorial:
```python
deployments = [
    {
        "serverDeploymentId": northstar_mcp_deployment_id
    }
]
```

### 6. Test Deployment

Check backend logs when executing:
- Should see: `NORTHSTAR_MCP_DEPLOYMENT_ID: <your-id>`
- Should see: `Deployments array: [{'serverDeploymentId': '<your-id>'}]`

### 7. Common Issues

**Issue**: Deployment ID is wrong
- **Fix**: Get the correct deployment ID from Metorial dashboard

**Issue**: Server not deployed
- **Fix**: Deploy your MCP server first using Metorial CLI

**Issue**: Tool name mismatch
- **Fix**: Ensure tool is registered as exactly `execute_code_change`

**Issue**: Wrong server type deployed
- **Fix**: Make sure you deployed the TypeScript server if using TypeScript, or Python server if using Python

### 8. Debug Steps

1. Check backend logs for deployment ID
2. Verify the ID matches what's in Metorial
3. Try listing tools in Metorial to see if the tool appears
4. Verify the MCP server code has the tool registered
5. Redeploy the MCP server if needed

### 9. Getting Deployment ID

After deploying your MCP server with Metorial, you'll get a deployment ID. Use that as `NORTHSTAR_MCP_DEPLOYMENT_ID`.

Example deployment command:
```bash
# For TypeScript Deno server
metorial deploy --runtime typescript.deno backend/northstar_mcp_typescript/

# This will output a deployment ID - use that as NORTHSTAR_MCP_DEPLOYMENT_ID
```

