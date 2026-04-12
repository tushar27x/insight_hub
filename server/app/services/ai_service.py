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
    prompt = f"""
    You are a sarcastic senior developer. Roast this GitHub user based on their stats:
    - Archetype: {archetype}
    - Total Commits: {stats.get('total_commits', 0)}
    - Top Languages: {', '.join(stats.get('top_languages', []))}
    - Issues Closed: {stats.get('total_issues', 0)}

    Rules:
    1. Be witty and sarcastic, but not mean.
    2. Use developer inside jokes (indentation, YAML, coffee, etc.).
    3. Keep it to 2 sentences max.
    4. Mention their archetype.
    """
    
    try: 
        # Primary: Attempt Groq
        completion = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a sarcastic senior developer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq Primary Error: {e}. Attempting Gemini fallback...")
        # Secondary: Fallback to Gemini
        return await generate_roast_gemini(stats, archetype, prompt)
