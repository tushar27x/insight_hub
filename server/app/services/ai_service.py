from groq import AsyncGroq
from google import genai
from app.core.config import GROQ_API_KEY, GEMINI_API_KEY
from typing import Dict, Any, List
import asyncio

# Initialize clients
groq_client = AsyncGroq(api_key=GROQ_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# Shared Persona Definition
MANAGER_PERSONA = """
You are a witty, slightly cynical, but deeply experienced Senior Engineering Manager conducting a 
performance review. Your tone is "tough love": you are bitter-sweet, slightly insulting about 
lazy habits (like bad commit messages or lack of PRs), but ultimately you want the developer 
to grow. You use technical jargon correctly and your humor is sharp but professional.
"""

async def generate_roast_gemini(prompt: str) -> str:
    """Fallback to Gemini if Groq fails."""
    try:
        response = await asyncio.to_thread(
            gemini_client.models.generate_content,
            model="gemini-2.0-flash",
            contents=f"{MANAGER_PERSONA}\n\n{prompt}"
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Fallback Error: {e}")
        return "Your code is so average it didn't even trigger my fallback circuits. Try harder."

async def generate_weekly_review(stats: Dict[str, Any]) -> str:
    heatmap = stats.get('last_week_heatmap', [])
    total_last_week = sum(heatmap)
    active_days_last_week = len([d for d in heatmap if d > 0])
    
    prompt = f"""
    REVIEW TYPE: Weekly Sync (The Grind)
    DATA:
    - Contributions last 7 days: {total_last_week}
    - Active days: {active_days_last_week}
    - Daily distribution: {heatmap}

    INSTRUCTIONS:
    1. Critique their consistency. If they missed days, call it out. 
    2. If they were busy on Sunday, ask if they have a life.
    3. Keep it to 2 concise sentences. Be the manager who just checked the dashboard.
    """
    
    try:
        completion = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": MANAGER_PERSONA},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200
        )
        return completion.choices[0].message.content.strip()
    except Exception:
        return await generate_roast_gemini(prompt)

async def generate_craft_review(stats: Dict[str, Any]) -> str:
    commits = stats.get('recent_commits', [])[:10]
    churn = stats.get('code_churn', {"additions": 0, "deletions": 0})
    
    prompt = f"""
    REVIEW TYPE: The Craft (Quality & Habits)
    DATA:
    - Recent Commit Messages: {commits}
    - Code Churn: {churn['additions']} additions, {churn['deletions']} deletions.

    INSTRUCTIONS:
    1. Analyze the commit messages. Are they lazy (e.g., "wip", "fix")?
    2. Analyze the churn ratio. Are they deleting code (good refactoring) or just bloating the repo?
    3. Be sharp. If their commits are bad, tell them to read a style guide.
    4. Keep it to 2-3 sentences max.
    """
    
    try:
        completion = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": MANAGER_PERSONA},
                {"role": "user", "content": prompt}
            ],
            max_tokens=250
        )
        return completion.choices[0].message.content.strip()
    except Exception:
        return await generate_roast_gemini(prompt)

async def generate_roast(stats: Dict[str, Any], archetype: str) -> str:
    languages = ', '.join(stats.get('top_languages', []))
    active_days = stats.get('active_days_per_year', 0)
    
    prompt = f"""
    REVIEW TYPE: The Annual Verdict (The Roast)
    USER DATA:
    - Archetype: {archetype}
    - Activity: {stats.get('total_commits')} commits / {active_days} days.
    - Impact: {stats.get('total_stars')} stars, {stats.get('total_prs')} PRs.
    - Stack: {languages}

    INSTRUCTIONS:
    1. This is the big roast. Combine everything you know about them.
    2. Be technical, witty, and slightly insulting. 
    3. Use their specific languages and archetype as ammo.
    4. 2-3 sentences max. End on a "Verdict".
    """
    
    try: 
        completion = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": MANAGER_PERSONA},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300
        )
        return completion.choices[0].message.content.strip()
    except Exception:
        return await generate_roast_gemini(prompt)

async def generate_repo_summaries(repo_details: list) -> Dict[str, str]:
    summaries = {}
    for repo in repo_details[:3]:
        name = repo["name"]
        readme = repo.get("readme", "")[:1000]
        files = ", ".join(repo.get("files", []))

        prompt = f"""
        TASK: Technical Summary (for an internal repo audit)
        Repo: {name}
        Files: {files}
        README: {readme}
        
        INSTRUCTIONS:
        1. Summarize the technical stack and purpose in 1 sentence.
        2. Don't be "sassy" here; be the manager providing a crisp summary to his director.
        """
        
        try:
            completion = await groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a senior technical architect."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100
            )
            summaries[name] = completion.choices[0].message.content.strip()
        except Exception:
            summaries[name] = "Standard implementation of technical requirements."
            
    return summaries
