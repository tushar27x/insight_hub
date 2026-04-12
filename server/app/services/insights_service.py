from datetime import datetime
from typing import Dict, Any

def calculate_user_insights(raw_github_stats: Dict[str, Any]) -> Dict[str, Any]:
    contributions = raw_github_stats.get("contributionsCollection", {})
    
    total_commits = contributions.get("totalCommitContributions", 0)
    total_prs = contributions.get("totalPullRequestContributions", 0)
    total_issues = contributions.get("totalIssueContributions", 0)
    
    lang_count = {}
    repos = raw_github_stats.get("repositories", {}).get("nodes", [])
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

    archetype = determine_archetype(raw_github_stats, total_commits, total_prs)
    
    return {
        "stats": {
            "total_commits": total_commits,
            "total_prs": total_prs,
            "total_issues": total_issues,
            "top_languages": top_languages,
            "total_stars": total_stars,
            "active_days_per_year": active_days,
            "social_ratio": f"{followers}/{following}"
        },
        "archetype": archetype
    }
    
def determine_archetype(
    raw_github_stats: Dict[str, Any], 
    total_commits: int, 
    total_prs: int) -> str:
    
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
            
    