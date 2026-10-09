import httpx
import json
import logging
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import settings
from typing import Dict, Any

class AIService:
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def analyze_project(self, description: str) -> Dict[str, Any]:
        if not settings.AI_API_KEY:
            # Mock response for dev if no API key
            logging.warning("AI_API_KEY not set. Returning mock response.")
            return {
                "title": "Mock Project Title",
                "description": description,
                "project_type": "Web Application",
                "business_domain": "Technology",
                "functional_requirements": ["Req 1", "Req 2"],
                "frontend_technologies": ["React"],
                "backend_technologies": ["FastAPI"],
                "database": ["MongoDB"],
                "middleware": [],
                "apis": ["REST"],
                "third_party_services": [],
                "authentication": ["JWT"],
                "authorization": ["RBAC"],
                "security": ["HTTPS"],
                "performance_requirements": ["Fast response"],
                "scalability_requirements": ["Horizontal scaling"],
                "deployment_requirements": ["Docker"],
                "recommended_features": ["Dark Mode"],
                "estimated_complexity": "MEDIUM",
                "assumptions": ["Mock assumption"],
                "questions_for_client": ["Mock question?"]
            }

        url = f"{settings.AI_API_URL}/models/{settings.AI_MODEL}:generateContent?key={settings.AI_API_KEY}"
        
        prompt = f"""
        Analyze the following project description and generate structured requirements.
        Output MUST be in valid JSON matching this exact structure, nothing else:
        {{
            "title": "string",
            "description": "string",
            "project_type": "string",
            "business_domain": "string",
            "functional_requirements": ["string"],
            "frontend_technologies": ["string"],
            "backend_technologies": ["string"],
            "database": ["string"],
            "middleware": ["string"],
            "apis": ["string"],
            "third_party_services": ["string"],
            "authentication": ["string"],
            "authorization": ["string"],
            "security": ["string"],
            "performance_requirements": ["string"],
            "scalability_requirements": ["string"],
            "deployment_requirements": ["string"],
            "recommended_features": ["string"],
            "estimated_complexity": "LOW|MEDIUM|HIGH|VERY_HIGH",
            "assumptions": ["string"],
            "questions_for_client": ["string"]
        }}

        Project Description:
        {description}
        """

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            
            try:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0]
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0]
                return json.loads(text.strip())
            except (KeyError, IndexError, json.JSONDecodeError) as e:
                logging.error(f"Failed to parse AI response: {text}")
                raise Exception(f"AI response parsing failed: {str(e)}")

ai_service = AIService()
