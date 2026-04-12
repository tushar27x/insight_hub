import httpx
from typing import Dict, Any

GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"
GET_WRAPPED_QUERY = """
query GetUserInsights($login: String!) {
  user(login: $login) {
    login
    name
    avatarUrl
    url
    bio

    followers {
      totalCount
    }

    following {
      totalCount
    }

    repositories(first: 5, orderBy: {field: STARGAZERS,
      direction: DESC}) {
        nodes {
        name
        stargazerCount
        languages(first: 3) {
            nodes {
            name
            }
        }
        }
    }

    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }

      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalRepositoryContributions
    }
  }
}
"""


async def fetch_github_stats(token: str, username: str):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-type": "application/json"
    }
    
    payload = {
        "query": GET_WRAPPED_QUERY,
        "variables": {"login": username}
    }
    
    async with httpx.AsyncClient(timeout = 10.0) as client:
        response = await client.post(
            GITHUB_GRAPHQL_URL,
            json=payload,
            headers=headers
        )
        
        response.raise_for_status()
        
        result = response.json()
        
        if "errors" in result:
            raise Exception(f"GraphQL Error:{result['errors']}")
        
        return result.get("data", {}).get("user", {})