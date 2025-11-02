"""Database operations for proposals, experiments, and results."""

from typing import Optional, List, Dict, Any
from datetime import datetime
import time
import uuid
from supabase_client import supabase


# Repository operations

def create_repository(
    repo_fullname: str,
    default_branch: str = "main",
    base_branch: str = "main"
) -> Dict[str, Any]:
    """
    Create a new repository record.

    Args:
        repo_fullname: Repository in format 'owner/repo'
        default_branch: Default branch name (default: 'main')
        base_branch: Base branch for PRs (default: 'main')

    Returns:
        Created repository record
    """
    parts = repo_fullname.split("/")
    if len(parts) != 2:
        raise ValueError("repo_fullname must be in format 'owner/repo'")
    
    owner, repo_name = parts
    
    repo_data = {
        "repo_fullname": repo_fullname,
        "owner": owner,
        "repo_name": repo_name,
        "default_branch": default_branch,
        "base_branch": base_branch,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }

    try:
        result = supabase.table("repositories").insert(repo_data).execute()
        return result.data[0] if result.data else repo_data
    except Exception as e:
        raise Exception(f"Failed to create repository: {str(e)}")


def get_repository(repo_fullname: str) -> Optional[Dict[str, Any]]:
    """
    Get a repository by full name.

    Args:
        repo_fullname: Repository in format 'owner/repo'

    Returns:
        Repository record or None if not found
    """
    try:
        result = supabase.table("repositories").select("*").eq("repo_fullname", repo_fullname).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        # If table doesn't exist, return None
        error_str = str(e).lower()
        if "relation" in error_str or "table" in error_str or "does not exist" in error_str:
            return None
        raise Exception(f"Failed to get repository: {str(e)}")


def get_active_repository() -> Optional[Dict[str, Any]]:
    """
    Get the active repository (first active repo).

    Returns:
        Repository record or None if not found
    """
    try:
        result = supabase.table("repositories").select("*").eq("is_active", True).limit(1).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        # If table doesn't exist, return None instead of raising
        error_str = str(e).lower()
        if "relation" in error_str or "table" in error_str or "does not exist" in error_str:
            # Table doesn't exist yet - user needs to run the schema
            return None
        raise Exception(f"Failed to get active repository: {str(e)}")


def list_repositories(limit: int = 50) -> List[Dict[str, Any]]:
    """
    List all repositories.

    Args:
        limit: Maximum number of repositories to return

    Returns:
        List of repository records (empty list if table doesn't exist)
    """
    try:
        result = supabase.table("repositories").select("*").order("created_at", desc=True).limit(limit).execute()
        return result.data or []
    except Exception as e:
        # If table doesn't exist, return empty list instead of raising
        error_str = str(e).lower()
        if "relation" in error_str or "table" in error_str or "does not exist" in error_str:
            return []
        raise Exception(f"Failed to list repositories: {str(e)}")


def update_repository(
    repo_fullname: str,
    is_active: Optional[bool] = None,
    default_branch: Optional[str] = None,
    base_branch: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update repository settings.

    Args:
        repo_fullname: Repository in format 'owner/repo'
        is_active: Whether repository is active
        default_branch: Default branch name
        base_branch: Base branch for PRs

    Returns:
        Updated repository record
    """
    update_data = {
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if is_active is not None:
        update_data["is_active"] = is_active
    if default_branch:
        update_data["default_branch"] = default_branch
    if base_branch:
        update_data["base_branch"] = base_branch

    try:
        result = supabase.table("repositories").update(update_data).eq("repo_fullname", repo_fullname).execute()
        
        if not result.data:
            raise Exception(f"Repository {repo_fullname} not found")
        
        return result.data[0]
    except Exception as e:
        raise Exception(f"Failed to update repository: {str(e)}")



def create_proposal(
    proposal_id: str,
    idea_summary: str,
    rationale: str,
    expected_impact: Dict[str, Any],
    technical_plan: List[Dict[str, str]],
    category: str,
    confidence: float,
    repo_id: Optional[str] = None,
    update_block: Optional[str] = None,
    oauth_session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new experiment proposal in Supabase.

    Args:
        proposal_id: Unique proposal identifier
        idea_summary: Brief summary of the proposal
        rationale: Reasoning behind the proposal
        expected_impact: Dict with 'metric' and 'delta_pct' keys
        technical_plan: List of file/action dicts
        category: Category of the experiment
        confidence: Confidence score (0.0 to 1.0)
        repo_id: Optional repository ID (UUID)
        update_block: Optional Fast Apply format code update block
        oauth_session_id: Optional OAuth session ID

    Returns:
        Created proposal record
    """
    proposal_data = {
        "proposal_id": proposal_id,
        "idea_summary": idea_summary,
        "rationale": rationale,
        "expected_impact": expected_impact,
        "technical_plan": technical_plan,
        "category": category,
        "confidence": confidence,
        "status": "pending",
        "oauth_session_id": oauth_session_id,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    # Only add repo_id if provided and column exists in table
    if repo_id:
        proposal_data["repo_id"] = repo_id
    if update_block:
        proposal_data["update_block"] = update_block

    try:
        result = supabase.table("proposals").insert(proposal_data).execute()
        return result.data[0] if result.data else proposal_data
    except Exception as e:
        error_str = str(e).lower()
        
        # Handle duplicate proposal_id - generate a unique one
        if ("duplicate key" in error_str and "proposal_id" in error_str) or "23505" in error_str:
            # Check if proposal already exists
            existing_proposal = get_proposal(proposal_id)
            if existing_proposal:
                # Generate a unique proposal_id by appending timestamp
                timestamp = int(time.time())
                new_proposal_id = f"{proposal_id}-{timestamp}"
                proposal_data["proposal_id"] = new_proposal_id
                try:
                    result = supabase.table("proposals").insert(proposal_data).execute()
                    return result.data[0] if result.data else proposal_data
                except Exception as retry_error:
                    # If still fails, try with a UUID suffix
                    new_proposal_id = f"{proposal_id}-{str(uuid.uuid4())[:8]}"
                    proposal_data["proposal_id"] = new_proposal_id
                    result = supabase.table("proposals").insert(proposal_data).execute()
                    return result.data[0] if result.data else proposal_data
            else:
                # Proposal doesn't exist but we got duplicate key error - try with timestamp anyway
                timestamp = int(time.time())
                new_proposal_id = f"{proposal_id}-{timestamp}"
                proposal_data["proposal_id"] = new_proposal_id
                result = supabase.table("proposals").insert(proposal_data).execute()
                return result.data[0] if result.data else proposal_data
        
        # If repo_id or update_block column doesn't exist, retry without them
        if ("repo_id" in error_str or "update_block" in error_str) and ("column" in error_str or "pgrst204" in error_str):
            # Remove columns that don't exist and retry
            original_proposal_data = proposal_data.copy()
            if "repo_id" in error_str and "repo_id" in proposal_data:
                del proposal_data["repo_id"]
            if "update_block" in error_str and "update_block" in proposal_data:
                del proposal_data["update_block"]
            
            if proposal_data != original_proposal_data:
                try:
                    result = supabase.table("proposals").insert(proposal_data).execute()
                    return result.data[0] if result.data else proposal_data
                except Exception as retry_error:
                    raise Exception(f"Failed to create proposal: {str(retry_error)}")
        
        # If RLS policy error, provide helpful message
        if "row-level security" in error_str or "42501" in error_str:
            raise Exception(
                f"Failed to create proposal: Row-level security (RLS) policy is blocking the insert. "
                f"Please run this SQL in Supabase to fix:\n"
                f"CREATE POLICY \"Allow all operations on proposals\" ON proposals FOR ALL USING (true) WITH CHECK (true);\n"
                f"Or see SUPABASE_SCHEMA.md for proper RLS policies."
            )
        raise Exception(f"Failed to create proposal: {str(e)}")


def get_proposal(proposal_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a proposal by ID.

    Args:
        proposal_id: Proposal identifier

    Returns:
        Proposal record or None if not found
    """
    try:
        result = supabase.table("proposals").select("*").eq("proposal_id", proposal_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        raise Exception(f"Failed to get proposal: {str(e)}")


def list_proposals(limit: int = 50, status: Optional[str] = None, repo_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    List all proposals, optionally filtered by status or repository.

    Args:
        limit: Maximum number of proposals to return
        status: Optional status filter (pending, approved, rejected, executing, completed)
        repo_id: Optional repository ID filter

    Returns:
        List of proposal records
    """
    try:
        # Try to include repository info via join, fallback to basic select if join fails
        try:
            query = supabase.table("proposals").select("*, repositories(repo_fullname, owner, repo_name)").order("created_at", desc=True).limit(limit)
        except Exception:
            # If join fails (column doesn't exist or join not supported), use basic select
            query = supabase.table("proposals").select("*").order("created_at", desc=True).limit(limit)
        
        if status:
            query = query.eq("status", status)
        
        if repo_id:
            query = query.eq("repo_id", repo_id)
        
        result = query.execute()
        return result.data or []
    except Exception as e:
        raise Exception(f"Failed to list proposals: {str(e)}")


def update_proposal(
    proposal_id: str,
    status: Optional[str] = None,
    update_block: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update proposal.

    Args:
        proposal_id: Proposal identifier
        status: New status (pending, approved, rejected, executing, completed)
        update_block: Fast Apply format code update block

    Returns:
        Updated proposal record
    """
    try:
        update_data = {
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if status:
            update_data["status"] = status
        if update_block:
            update_data["update_block"] = update_block
        
        result = supabase.table("proposals").update(update_data).eq("proposal_id", proposal_id).execute()
        
        if not result.data:
            raise Exception(f"Proposal {proposal_id} not found")
        
        return result.data[0]
    except Exception as e:
        raise Exception(f"Failed to update proposal: {str(e)}")


def update_proposal_status(proposal_id: str, status: str) -> Dict[str, Any]:
    """
    Update proposal status (convenience function).

    Args:
        proposal_id: Proposal identifier
        status: New status (pending, approved, rejected, executing, completed)

    Returns:
        Updated proposal record
    """
    return update_proposal(proposal_id, status=status)


def create_experiment(
    proposal_id: str,
    instruction: str,
    update_block: str,
    pr_url: Optional[str] = None,
    branch: Optional[str] = None,
    oauth_session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new experiment record (execution of a proposal).

    Args:
        proposal_id: Associated proposal ID
        instruction: Natural language instruction for the experiment
        update_block: Fast Apply format code update
        pr_url: GitHub PR URL
        branch: Git branch name
        oauth_session_id: Optional OAuth session ID

    Returns:
        Created experiment record
    """
    experiment_data = {
        "proposal_id": proposal_id,
        "instruction": instruction,
        "update_block": update_block,
        "pr_url": pr_url,
        "branch": branch,
        "status": "running",
        "oauth_session_id": oauth_session_id,
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        result = supabase.table("experiments").insert(experiment_data).execute()
        
        # Update proposal status to 'executing'
        update_proposal_status(proposal_id, "executing")
        
        return result.data[0] if result.data else experiment_data
    except Exception as e:
        raise Exception(f"Failed to create experiment: {str(e)}")


def get_experiment(experiment_id: str) -> Optional[Dict[str, Any]]:
    """
    Get an experiment by ID.

    Args:
        experiment_id: Experiment identifier

    Returns:
        Experiment record or None if not found
    """
    try:
        result = supabase.table("experiments").select("*").eq("id", experiment_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        raise Exception(f"Failed to get experiment: {str(e)}")


def get_experiment_by_proposal(proposal_id: str) -> Optional[Dict[str, Any]]:
    """
    Get an experiment by proposal ID.

    Args:
        proposal_id: Proposal identifier

    Returns:
        Experiment record or None if not found
    """
    try:
        result = supabase.table("experiments").select("*").eq("proposal_id", proposal_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        raise Exception(f"Failed to get experiment by proposal: {str(e)}")


def list_experiments(limit: int = 50, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    List all experiments, optionally filtered by status.

    Args:
        limit: Maximum number of experiments to return
        status: Optional status filter (running, completed, failed, cancelled)

    Returns:
        List of experiment records
    """
    try:
        query = supabase.table("experiments").select("*").order("created_at", desc=True).limit(limit)
        
        if status:
            query = query.eq("status", status)
        
        result = query.execute()
        return result.data or []
    except Exception as e:
        raise Exception(f"Failed to list experiments: {str(e)}")


def update_experiment(
    experiment_id: str,
    status: Optional[str] = None,
    pr_url: Optional[str] = None,
    result_summary: Optional[str] = None,
    metric_delta: Optional[float] = None,
    result_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Update experiment with results.

    Args:
        experiment_id: Experiment identifier
        status: New status (running, completed, failed, cancelled)
        pr_url: PR URL if not set initially
        result_summary: Summary of results
        metric_delta: Metric change percentage
        result_data: Additional result data

    Returns:
        Updated experiment record
    """
    update_data = {
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if status:
        update_data["status"] = status
    if pr_url:
        update_data["pr_url"] = pr_url
    if result_summary:
        update_data["result_summary"] = result_summary
    if metric_delta is not None:
        update_data["metric_delta"] = metric_delta
    if result_data:
        update_data["result_data"] = result_data

    try:
        result = supabase.table("experiments").update(update_data).eq("id", experiment_id).execute()
        
        if not result.data:
            raise Exception(f"Experiment {experiment_id} not found")
        
        # If experiment is completed, update proposal status
        if status == "completed":
            experiment = result.data[0]
            if experiment.get("proposal_id"):
                update_proposal_status(experiment["proposal_id"], "completed")
        
        return result.data[0]
    except Exception as e:
        raise Exception(f"Failed to update experiment: {str(e)}")


def create_activity_log(
    message: str,
    proposal_id: Optional[str] = None,
    experiment_id: Optional[str] = None,
    log_type: str = "info"
) -> Dict[str, Any]:
    """
    Create an activity log entry.

    Args:
        message: Log message
        proposal_id: Associated proposal ID
        experiment_id: Associated experiment ID
        log_type: Log type (info, success, warning, error)

    Returns:
        Created activity log record
    """
    log_data = {
        "message": message,
        "proposal_id": proposal_id,
        "experiment_id": experiment_id,
        "log_type": log_type,
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        result = supabase.table("activity_logs").insert(log_data).execute()
        return result.data[0] if result.data else log_data
    except Exception as e:
        raise Exception(f"Failed to create activity log: {str(e)}")


def list_activity_logs(limit: int = 50) -> List[Dict[str, Any]]:
    """
    List recent activity logs.

    Args:
        limit: Maximum number of logs to return

    Returns:
        List of activity log records
    """
    try:
        result = supabase.table("activity_logs").select("*").order("created_at", desc=True).limit(limit).execute()
        return result.data or []
    except Exception as e:
        raise Exception(f"Failed to list activity logs: {str(e)}")

