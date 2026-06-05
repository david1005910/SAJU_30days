"""
FastAPI main application for Saju Engine
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
import os
import json
import yaml
from dotenv import load_dotenv

from saju.mock_engine import MockSajuEngine as SajuEngine, SajuInput
from interpret.claude_client import ClaudeInterpreter, InterpretationRequest, ValidationGate

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="Saju Engine API",
    description="Deterministic Saju calculation and AI interpretation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
saju_engine = SajuEngine()
claude_interpreter = ClaudeInterpreter()
validation_gate = ValidationGate()

# Load curriculum
with open("../../curriculum/30day.yaml", "r", encoding="utf-8") as f:
    curriculum = yaml.safe_load(f)

# Request/Response models
class CalculateRequest(BaseModel):
    datetime: str
    is_lunar: bool = False
    sex: str = "M"
    time_known: bool = True
    timezone: str = "Asia/Seoul"

class InterpretRequest(BaseModel):
    episode_id: str
    force_regenerate: bool = False

class EpisodeCreateRequest(BaseModel):
    curriculum_day: int
    scheduled_for: Optional[datetime] = None

# Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "saju-engine"}

@app.post("/api/calculate")
async def calculate_saju(request: CalculateRequest):
    """
    Calculate Saju from birth data
    This is deterministic - no AI involved
    """
    try:
        input_data = SajuInput(
            datetime=datetime.fromisoformat(request.datetime),
            is_lunar=request.is_lunar,
            sex=request.sex,
            time_known=request.time_known,
            timezone=request.timezone
        )
        
        result = saju_engine.calculate(input_data)
        
        return {
            "success": True,
            "result": {
                "input": result.input,
                "pillars": result.pillars,
                "day_master": result.day_master,
                "five_elements": result.five_elements,
                "ten_gods": result.ten_gods,
                "luck_pillars": result.luck_pillars,
                "verify_hash": result.verify_hash
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/interpret")
async def interpret_saju(request: InterpretRequest):
    """
    Generate Korean script using Claude
    Validates against calculation to prevent hallucination
    """
    try:
        # TODO: Get episode and calculation from database
        # For now, using mock data
        episode_data = curriculum["episodes"][0]
        
        # Mock calculation result
        saju_result = {
            "pillars": {
                "year": ["甲", "子"],
                "month": ["乙", "丑"],
                "day": ["丙", "寅"],
                "hour": ["丁", "卯"]
            },
            "day_master": "丙",
            "five_elements": {"목": 3, "화": 2, "토": 1, "금": 0, "수": 2},
            "ten_gods": {
                "year_gan": "편인",
                "month_gan": "정인",
                "hour_gan": "겁재"
            }
        }
        
        # Prepare interpretation request
        interp_request = InterpretationRequest(
            saju_result=saju_result,
            episode_goal=episode_data["goal"],
            episode_keywords=episode_data["keywords"]
        )
        
        # Generate interpretation
        interpretation = claude_interpreter.interpret(interp_request)
        
        # Validate against calculation
        is_valid, error_msg = validation_gate.validate(interpretation, saju_result)
        
        if not is_valid:
            # Retry with feedback
            return {
                "success": False,
                "error": f"Validation failed: {error_msg}",
                "retry_needed": True
            }
        
        interpretation.validated = True
        
        return {
            "success": True,
            "interpretation": {
                "intro_30s": interpretation.intro_30s,
                "sections": interpretation.sections,
                "youtube_meta": interpretation.youtube_meta,
                "validated": interpretation.validated,
                "model": interpretation.model,
                "tokens": {
                    "prompt": interpretation.prompt_tokens,
                    "output": interpretation.output_tokens
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/episodes")
async def create_episode(request: EpisodeCreateRequest):
    """
    Create new episode from curriculum
    """
    try:
        if request.curriculum_day < 1 or request.curriculum_day > 30:
            raise ValueError("Curriculum day must be between 1 and 30")
        
        episode_data = curriculum["episodes"][request.curriculum_day - 1]
        
        # TODO: Create episode in database
        # TODO: Enqueue pipeline job
        
        return {
            "success": True,
            "episode": {
                "id": f"ep_{request.curriculum_day}",
                "number": request.curriculum_day,
                "title": episode_data["title"],
                "goal": episode_data["goal"],
                "status": "QUEUED"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/episodes/{episode_id}")
async def get_episode(episode_id: str):
    """
    Get episode details with all related data
    """
    # TODO: Fetch from database
    return {
        "id": episode_id,
        "status": "REVIEW",
        "title": "Sample Episode",
        "chart": None,
        "script": None,
        "scenes": [],
        "costs": []
    }

@app.post("/api/episodes/{episode_id}/approve")
async def approve_episode(episode_id: str):
    """
    Approve episode for publishing
    Human gate for quality control
    """
    # TODO: Update database status
    # TODO: Enqueue publish job
    
    return {
        "success": True,
        "message": f"Episode {episode_id} approved for publishing"
    }

@app.get("/api/curriculum")
async def get_curriculum():
    """
    Get 30-day curriculum
    """
    return curriculum

@app.get("/api/costs/{episode_id}")
async def get_episode_costs(episode_id: str):
    """
    Get cost breakdown for an episode
    """
    # TODO: Fetch from database
    return {
        "episode_id": episode_id,
        "total": 0.45,
        "currency": "USD",
        "breakdown": [
            {"stage": "interpret", "item": "claude_tokens", "amount": 0.12},
            {"stage": "images", "item": "image_gen", "amount": 0.20},
            {"stage": "tts", "item": "edge_tts", "amount": 0.03},
            {"stage": "render", "item": "compute", "amount": 0.10}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)