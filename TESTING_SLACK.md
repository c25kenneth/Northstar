# Testing Slack Notifications

This guide explains how to test Slack notifications when experiments are triggered.

## Prerequisites

1. **Slack OAuth Connection**
   - Go to Settings page in the frontend
   - Click "Connect Slack"
   - Authorize the app in the popup window
   - Wait for confirmation that Slack is connected

2. **Environment Variables**
   - Ensure `SLACK_DEPLOYMENT_ID` is set in your `.env` file
   - Ensure `METORIAL_API_KEY` is set
   - Ensure `OPENAI_API_KEY` is set

## Testing Steps

### Option 1: Test via Frontend (Easiest)

1. **Connect Slack**
   ```
   - Navigate to Settings page
   - Click "Connect Slack" button
   - Complete OAuth flow
   - Verify "Slack: Connected" status
   ```

2. **Trigger a New Experiment**
   ```
   - Still on Settings page
   - Click "Trigger New Experiment"
   - Wait for proposal to be generated
   - Check Slack for notification:
     🚀 New experiment proposal: [Summary]
     ID: exp-001
     Repository: owner/repo
     Category: user_experience
     Confidence: 80%
   ```

3. **Approve an Experiment**
   ```
   - Go to Dashboard
   - Click on a pending proposal
   - Click "Approve & Create PR"
   - Check Slack for two notifications:
     1. ✅ Experiment approved and being executed!
     2. ✅ Experiment executed successfully! (with PR URL)
   ```

### Option 2: Test via API Directly

1. **Test Slack Message Endpoint**
   ```bash
   curl -X POST "http://localhost:8000/slack/message?message=Test%20message&oauth_session_id=YOUR_SESSION_ID"
   ```

2. **Get OAuth Session ID**
   - Check localStorage in browser: `northstar_slack_oauth_session_id`
   - Or check your Supabase `proposals` table for `oauth_session_id` column
   - Or connect Slack in Settings to get a new session ID

### Option 3: Test Programmatically

Create a test script:

```python
# test_slack.py
import asyncio
from main import send_slack_message

async def test():
    oauth_session_id = "YOUR_SESSION_ID_HERE"
    message = "🧪 Test message from Northstar!"
    
    result = await send_slack_message(message, oauth_session_id)
    print(f"Result: {result}")

if __name__ == "__main__":
    asyncio.run(test())
```

Run it:
```bash
cd backend
python test_slack.py
```

## What to Check

### When Testing Notifications:

1. **Check Backend Logs**
   ```bash
   # In your backend terminal, look for:
   - "Sent Slack notification for experiment..."
   - "Failed to send Slack notification..." (if errors)
   ```

2. **Check Slack Channel**
   - Messages should appear in the Slack workspace you authorized
   - Check the channel configured in your Metorial Slack deployment

3. **Check Activity Logs**
   - Go to Dashboard → Activity Logs
   - Should see entries for proposal creation, approval, execution

### Expected Messages:

**When Proposal is Created:**
```
🚀 New experiment proposal: [Summary]
ID: exp-001
Repository: owner/repo
Category: user_experience
Confidence: 80%
```

**When Experiment is Approved:**
```
✅ Experiment approved and being executed!
Proposal ID: exp-001
Description: [Summary]
```

**When Experiment is Executed:**
```
✅ Experiment executed successfully!
ID: exp-001
Description: [Summary]
PR: https://github.com/owner/repo/pull/123
```

## Troubleshooting

### No Slack Messages Received?

1. **Check OAuth Session ID**
   ```javascript
   // In browser console:
   localStorage.getItem('northstar_slack_oauth_session_id')
   ```
   - Should return a session ID like `soas_...`
   - If null, reconnect Slack in Settings

2. **Check Environment Variables**
   ```bash
   # In backend directory:
   grep SLACK_DEPLOYMENT_ID .env
   grep METORIAL_API_KEY .env
   ```
   - Both should be set and valid

3. **Check Backend Logs**
   - Look for error messages about Slack notifications
   - Common errors:
     - "Failed to send Slack notification for..."
     - "OAuth session invalid"
     - "SLACK_DEPLOYMENT_ID not set"

4. **Verify Metorial Deployment**
   - Ensure your Slack MCP server is deployed in Metorial
   - Verify the `SLACK_DEPLOYMENT_ID` matches your deployment
   - Test Metorial Slack tool manually in Metorial dashboard

5. **Check Slack Authorization**
   - Reconnect Slack in Settings if needed
   - Ensure the OAuth session hasn't expired
   - Verify you authorized the correct Slack workspace

### Slack Messages Sent But Not Received?

1. **Check Slack Channel Settings**
   - Default channel may be set in Metorial deployment
   - Messages might go to DMs instead of a channel

2. **Check Metorial Dashboard**
   - Look for execution logs
   - Check if the Slack tool was called
   - Verify tool execution succeeded

## Manual Testing Checklist

- [ ] Slack OAuth connected in Settings
- [ ] `SLACK_DEPLOYMENT_ID` set in `.env`
- [ ] `METORIAL_API_KEY` set in `.env`
- [ ] Backend server running
- [ ] Trigger new experiment → Check Slack for notification
- [ ] Approve experiment → Check Slack for approval notification
- [ ] Approve experiment → Check Slack for execution notification with PR URL
- [ ] Check backend logs for any errors

## Notes

- Slack notifications are **non-blocking**: If they fail, the operation (proposal creation/execution) still continues
- Check backend logs for warnings like "Failed to send Slack notification..."
- OAuth session ID is stored in localStorage and in the database
- Each proposal stores its OAuth session ID for notifications

