"""Supabase client initialization for Northstar backend."""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Get Supabase credentials from environment
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not supabase_url:
    raise ValueError(
        "SUPABASE_URL not found in environment variables. "
        "Please set it in your .env file."
    )

if not supabase_key:
    raise ValueError(
        "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY not found in environment variables. "
        "Please set at least one in your .env file."
    )

# Initialize Supabase client
# Note: Use service role key for backend operations (bypasses RLS)
# For anon key, ensure RLS policies allow backend operations
supabase: Client = create_client(supabase_url, supabase_key)

