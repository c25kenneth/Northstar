"""Example: Using PostHog MCP with OAuth via Metorial."""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from metorial import Metorial
from openai import AsyncOpenAI


async def main():
    metorial = Metorial(api_key="metorial_sk_Ff8Kh9mNrOcxDzg7uIJCnuGld9xlP07AcNVbwrAajR3R75Z9ugPHKlYqc7zz4bnX7G6OgTddJPq0hGQhkrWQVzwyi66DZo7ZT3v1")
    openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    posthog_deployment_id = "svd_0mhhqlcpwtnBhcK27xzsHW"

    if not posthog_deployment_id:
        print("❌ POSTHOG_DEPLOYMENT_ID not set")
        return

    # PostHog MCP doesn't require OAuth - it uses API keys instead
    # So we can use it directly without OAuth flow
    print("🚀 Using PostHog MCP (no OAuth required)...")

    # Example 1: List available metrics/events
    print("\n📋 Query: List all available metrics and events...")
    result = await metorial.run(
        message="""Tell me a little bit about the project.""",
        server_deployments=[
            {
                "serverDeploymentId": posthog_deployment_id
                # No oauthSessionId needed - PostHog uses API key authentication
            }
        ],
        client=openai_client,
        model="gpt-4o",
        max_steps=25,
    )
    
    print("\n📊 Results:")
    print(result.text)
    
    # Example 2: Get specific metrics query (optional - uncomment to try)
    # print("\n📋 Query: Get event count metrics...")
    # result2 = await metorial.run(
    #     message="""Query PostHog for:
    #     1. Total event count in the last 7 days
    #     2. Unique users in the last 7 days
    #     3. List of top 10 most common events
    #     
    #     Return the metrics in a structured format.""",
    #     server_deployments=[
    #         {
    #             "serverDeploymentId": posthog_deployment_id
    #         }
    #     ],
    #     client=openai_client,
    #     model="gpt-4o",
    #     max_steps=25,
    # )
    # print("\n📊 Metrics Results:")
    # print(result2.text)


if __name__ == "__main__":
    asyncio.run(main())

