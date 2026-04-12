from groq import AsyncGroq
from google import genai
from app.core.config import GROQ_API_KEY, GEMINI_API_KEY
from typing import Dict, Any
import asyncio

# Initialize clients
groq_client = AsyncGroq(api_key=GROQ_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

async def generate_roast_gemini(stats: Dict[str, Any], archetype: str, prompt: str) -> str:
    """Fallback to Gemini if Groq fails."""
    try:
        response = await asyncio.to_thread(
            gemini_client.models.generate_content,
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Fallback Error: {e}")
        return "You code so much that even my AI brain is tired. Go outside."

async def generate_roast(stats: Dict[str, Any], archetype: str) -> str:
    languages = ', '.join(stats.get('top_languages', []))
    social = stats.get('social_ratio', '0/0')
    active_days = stats.get('active_days_per_year', 0)
    
    prompt = f"""
    You are a legendary, slightly grumpy Senior Software Architect. 
    Analyze this developer's "GitHub Wrapped" stats and give them a highly personalized, 
    dev-centric roast.

    USER DATA:
    - Archetype: {archetype}
    - Coding Activity: {stats.get('total_commits')} commits over {active_days} active days.
    - Stack: {languages}
    - Impact: {stats.get('total_stars')} stars and {stats.get('total_prs')} Pull Requests.
    - Social Ratio (Followers/Following): {social}

    ROAST INSTRUCTIONS:
    1. Be specific! If they have high commits but low stars, mention it.
    2. Use their specific languages ({languages}) in the jokes.
    3. If they are a "{archetype}", explain why that's both impressive and slightly concerning.
    4. Mention their social ratio ({social}) if it's lopsided.
    5. Keep it to 2-3 sentences max. Be sharp, witty, and deeply technical.
    """
    
    try: 
        # Primary: Attempt Groq
        completion = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a sarcastic senior developer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq Primary Error: {e}. Attempting Gemini fallback...")
        # Secondary: Fallback to Gemini
        return await generate_roast_gemini(stats, archetype, prompt)
