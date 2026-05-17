from datetime import datetime
from typing import Dict, Any

def calculate_user_insights(raw_github_stats: Dict[str, Any]) -> Dict[str, Any]:
    contributions = raw_github_stats.get("contributionsCollection", {})
    
    total_commits = contributions.get("totalCommitContributions", 0)
    total_prs = contributions.get("totalPullRequestContributions", 0)
    total_issues = contributions.get("totalIssueContributions", 0)
    
    # 1. Extract Ranked Repositories
    repo_contributions = contributions.get("commitContributionsByRepository", [])
    ranked_repos = sorted([
        {"name": rc["repository"]["name"], "count": rc["contributions"]["totalCount"]}
        for rc in repo_contributions
    ], key=lambda x: x["count"], reverse=True)

    # 2. Extract Repo Details for AI
    repos = raw_github_stats.get("repositories", {}).get("nodes", [])
    repo_details = []
    recent_commits = []
    for repo in repos:
        # Extract recent commits
        history = repo.get("defaultBranchRef", {}).get("target", {}).get("history", {}).get("nodes", [])
        for c in history:
            if c.get("message"):
                recent_commits.append(c["message"])

        repo_details.append({
            "name": repo["name"],
            "readme": repo.get("readme", {}).get("text", "") if repo.get("readme") else "",
            "files": [e["name"] for e in repo.get("tree", {}).get("entries", [])] if repo.get("tree") else []
        })

    # 3. Code Churn
    pr_nodes = raw_github_stats.get("pullRequests", {}).get("nodes", [])
    total_additions = sum((pr.get("additions") or 0) for pr in pr_nodes)
    total_deletions = sum((pr.get("deletions") or 0) for pr in pr_nodes)

    lang_count = {}
    total_stars = sum(r.get("stargazerCount", 0) for r in repos)
    
    for repo in repos:
        languages = repo.get("languages",{}).get("nodes", [])
        for lang in languages:
            name = lang.get("name")
            if name:
                lang_count[name] = lang_count.get(name, 0) + 1
    
    top_languages = sorted(lang_count, key=lang_count.get, reverse=True)[:5]
    
    # Extracting Social Stats
    followers = raw_github_stats.get("followers", {}).get("totalCount", 0)
    following = raw_github_stats.get("following", {}).get("totalCount", 0)
    
    # Calculate Active Days (days with at least one contribution)
    active_days = 0
    weeks = contributions.get("contributionCalendar", {}).get("weeks", [])
    for week in weeks:
        for day in week.get("contributionDays", []):
            if day.get("contributionCount", 0) > 0:
                active_days += 1

    # Extract last 7 days heatmap with robust sorting and alignment
    last_week_heatmap = []
    heatmap_labels = []
    
    if weeks:
        # Flatten all days and ensure they are sorted by date
        all_days = []
        for week in weeks:
            for day in week.get("contributionDays", []):
                if day.get("date"):
                    all_days.append(day)
        
        # Sort by date to ensure consistency
        all_days.sort(key=lambda x: x.get("date"))
        
        # Take the most recent 7 days
        last_7_days = all_days[-7:]
        
        # Strictly align counts and labels
        for day in last_7_days:
            count = day.get("contributionCount", 0)
            date_str = day.get("date")
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            
            last_week_heatmap.append(count)
            heatmap_labels.append(dt.strftime("%a")) # 'Mon', 'Tue', etc.
            
        # Ensure we always return exactly 7 days
        if len(last_week_heatmap) < 7:
            # This should rarely happen with GitHub activity over a year, 
            # but we pad with 0s if necessary.
            while len(last_week_heatmap) < 7:
                last_week_heatmap.insert(0, 0)
                heatmap_labels.insert(0, "N/A")

    # 4. Monthly Heatmap for Dashboard (last 4 weeks / 28 days)
    last_month_heatmap = []
    if weeks:
        all_days = []
        for week in weeks:
            for day in week.get("contributionDays", []):
                if day.get("date"):
                    all_days.append(day)
        all_days.sort(key=lambda x: x.get("date"))
        # Take the most recent 28 days
        last_28_days = all_days[-28:]
        last_month_heatmap = [day.get("contributionCount", 0) for day in last_28_days]

    archetype = determine_archetype(
        raw_github_stats, 
        total_commits, 
        total_prs, 
        total_issues, 
        repo_details
    )
    
    return {
        "stats": {
            "total_commits": total_commits,
            "total_prs": total_prs,
            "total_issues": total_issues,
            "ranked_repos": ranked_repos,
            "repo_details": repo_details,
            "recent_commits": recent_commits,
            "code_churn": {"additions": total_additions, "deletions": total_deletions},
            "top_languages": top_languages,
            "total_stars": total_stars,
            "active_days_per_year": active_days,
            "social_ratio": f"{followers}/{following}",
            "last_week_heatmap": last_week_heatmap,
            "last_month_heatmap": last_month_heatmap,
            "heatmap_labels": heatmap_labels
        },
        "archetype": archetype
    }
    
def determine_archetype(
    raw_github_stats: Dict[str, Any], 
    total_commits: int, 
    total_prs: int,
    total_issues: int,
    repo_details: list) -> str:
    
    # 1. Priority: The Bug Hunter
    if total_issues > (total_commits + total_prs) * 0.2:
        return "🕵️ The Bug Hunter"

    # 2. Priority: The Open Source Hero
    if total_prs > total_commits * 0.4:
        return "🌟 The Open Source Hero"

    # 3. Priority: The Software Architect
    architect_signals = {'docker', 'kubernetes', 'k8s', 'terraform', 'yml', 'yaml', 'config', 'workflow'}
    for repo in repo_details:
        files = [f.lower() for f in repo.get("files", [])]
        if any(sig in f for f in files for sig in architect_signals):
            return "🏗️ The Software Architect"

    weekend_commits = 0
    weekday_commits = 0
    
    weeks = raw_github_stats.get("contributionsCollection", {}).get("contributionCalendar", {}).get("weeks", [])
    
    for week in weeks :
        contribution_days = week.get("contributionDays", [])
        for day in contribution_days:
            date = day.get("date", "")
            if date:
                dt_obj = datetime.strptime(date, "%Y-%m-%d")
                day_of_week = dt_obj.weekday()
                count = day.get("contributionCount", 0)
                if day_of_week >= 5:
                    weekend_commits += count
                else:
                    weekday_commits += count
                            
                
    if weekend_commits > weekday_commits * 0.5:
        return "🛡️ The Weekend Warrior"
    else:
        return "💻 The Code Crusader"
