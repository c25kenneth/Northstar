"""Test script to send demo messages showcasing rich Slack markdown formatting."""

import asyncio
import os
from dotenv import load_dotenv
from metorial import Metorial
from openai import AsyncOpenAI

load_dotenv()

async def send_demo_messages():
    """Send demo messages for each message type."""

    metorial = Metorial(api_key=os.getenv("METORIAL_API_KEY"))
    openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    slack_deployment_id = os.getenv("SLACK_DEPLOYMENT_ID")
    slack_oauth_session_id = os.getenv("SLACK_OAUTH_SESSION_ID")

    # Test channel - you can change this
    channel = "C09QL9V1J1F"

    print("📤 Sending demo messages to Slack...")

    # Demo 1: EXPERIMENT_PROPOSAL format
    print("\n1️⃣ Sending EXPERIMENT_PROPOSAL demo...")
    experiment_message = """*New experiment proposed:*
Add loading skeleton to dashboard for perceived performance

*Category:* UX Enhancement
*Confidence:* 85%
*Expected impact:* +12% user_satisfaction
*PR Ready:* True

*Rationale:*
Users currently see a blank screen for 800ms while the dashboard loads data. This creates uncertainty and makes the app feel slower than it is. Adding skeleton loaders will give immediate visual feedback and improve perceived performance, even though actual load time remains the same.

*Technical Plan:*
• src/components/Dashboard.jsx: Add Skeleton component wrapper around data display
• src/components/FinancialOverview.jsx: Implement skeleton loading state
• src/components/RecentTransactions.jsx: Add transaction tile skeletons"""

    await metorial.run(
        message=f"Post this exact message to Slack channel {channel}:\n\n{experiment_message}",
        server_deployments=[
            {
                "serverDeploymentId": slack_deployment_id,
                "oauthSessionId": slack_oauth_session_id
            }
        ],
        client=openai_client,
        model="gpt-4o",
        max_steps=3
    )
    print("✅ Experiment proposal sent")

    await asyncio.sleep(2)

    # Demo 2: CODE_CHANGE success format
    print("\n2️⃣ Sending CODE_CHANGE demo...")
    code_change_message = """*Code change executed*

*PR:* https://github.com/tylerbordeaux/northstar-demo/pull/123
*Files changed:* 3 file(s)
*Changes:* Added responsive mobile navigation with hamburger menu"""

    await metorial.run(
        message=f"Post this exact message to Slack channel {channel}:\n\n{code_change_message}",
        server_deployments=[
            {
                "serverDeploymentId": slack_deployment_id,
                "oauthSessionId": slack_oauth_session_id
            }
        ],
        client=openai_client,
        model="gpt-4o",
        max_steps=3
    )
    print("✅ Code change sent")

    await asyncio.sleep(2)

    # Demo 3: ANALYTICS_QUERY format
    print("\n3️⃣ Sending ANALYTICS_QUERY demo...")
    analytics_message = """*Analytics Report*

*Metric:* Daily Active Users (DAU)
*Current:* 2,847 users
*Trend:* Up 18% from last week

*Key insights:*
• Growth is primarily driven by new user signups (+24% WoW)
• Mobile engagement increased 31% after navigation improvements
• Peak usage hours shifted from 9-11am to 2-4pm, suggesting international adoption"""

    await metorial.run(
        message=f"Post this exact message to Slack channel {channel}:\n\n{analytics_message}",
        server_deployments=[
            {
                "serverDeploymentId": slack_deployment_id,
                "oauthSessionId": slack_oauth_session_id
            }
        ],
        client=openai_client,
        model="gpt-4o",
        max_steps=3
    )
    print("✅ Analytics report sent")

    print("\n✨ All demo messages sent successfully!")


if __name__ == "__main__":
    asyncio.run(send_demo_messages())
