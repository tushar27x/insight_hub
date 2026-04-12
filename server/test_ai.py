import asyncio
import os
import sys

# Add the server directory to the python path
sys.path.append(os.path.join(os.getcwd(), 'server'))

from server.app.services.ai_service import generate_roast

async def test_ai_service():
    stats = {
        'total_commits': 1500,
        'top_languages': ['Python', 'TypeScript', 'C++'],
        'total_issues': 25
    }
    archetype = "The Code Ninja"
    
    print("Testing AI Roast Generation with invalid Groq key...")
    import server.app.services.ai_service
    app.services.ai_service.groq_client.api_key = "invalid_key"
    roast = await generate_roast(stats, archetype)
    print(f"Fallback Roast Result: {roast}")

if __name__ == "__main__":
    asyncio.run(test_ai_service())
