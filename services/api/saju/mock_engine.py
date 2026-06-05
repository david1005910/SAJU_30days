"""
Mock Saju calculation engine for testing without sxtwl
"""

from datetime import datetime
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
import hashlib
import json

from .constants import GAN, ZHI, FIVE_ELEMENTS, TEN_GODS

@dataclass
class SajuInput:
    """Input parameters for Saju calculation"""
    datetime: datetime
    is_lunar: bool = False
    sex: str = "M"
    time_known: bool = True
    timezone: str = "Asia/Seoul"
    true_solar_time: bool = True
    zishi_policy: str = "late_early"

@dataclass
class SajuResult:
    """Result of Saju calculation"""
    input: Dict
    pillars: Dict[str, List[str]]
    day_master: str
    five_elements: Dict[str, int]
    ten_gods: Dict[str, str]
    luck_pillars: Dict
    verify_hash: str

class MockSajuEngine:
    """
    Mock Saju calculation engine for testing
    Returns deterministic mock data based on input
    """
    
    def calculate(self, input_data: SajuInput) -> SajuResult:
        """
        Generate mock Saju calculation result
        Uses deterministic mock data based on datetime
        """
        # Generate mock pillars based on datetime
        dt = input_data.datetime
        
        # Mock pillar calculation (deterministic based on date)
        year_idx = (dt.year - 1900) % 60
        month_idx = dt.month % 12
        day_idx = (dt.day + dt.month) % 60
        hour_idx = dt.hour % 12
        
        # Generate mock pillars
        year_gan = GAN[year_idx % 10]
        year_zhi = ZHI[year_idx % 12]
        month_gan = GAN[(year_idx + month_idx) % 10]
        month_zhi = ZHI[month_idx]
        day_gan = GAN[day_idx % 10]
        day_zhi = ZHI[day_idx % 12]
        hour_gan = GAN[(day_idx + hour_idx) % 10]
        hour_zhi = ZHI[hour_idx]
        
        pillars = {
            "year": [year_gan, year_zhi],
            "month": [month_gan, month_zhi],
            "day": [day_gan, day_zhi],
            "hour": [hour_gan, hour_zhi] if input_data.time_known else None
        }
        
        # Day master
        day_master = day_gan
        
        # Calculate five elements distribution
        five_elements = {"목": 0, "화": 0, "토": 0, "금": 0, "수": 0}
        for pillar_type, pillar in pillars.items():
            if pillar:
                gan, zhi = pillar
                five_elements[FIVE_ELEMENTS[gan]] += 1
                five_elements[FIVE_ELEMENTS[zhi]] += 1
        
        # Calculate ten gods
        ten_gods_map = TEN_GODS.get(day_master, TEN_GODS["甲"])
        ten_gods = {}
        for pillar_type, pillar in pillars.items():
            if pillar and pillar_type != "day":
                gan, _ = pillar
                ten_gods[f"{pillar_type}_gan"] = ten_gods_map.get(gan, "비견")
        
        # Mock luck pillars
        luck_pillars = {
            "direction": "순행" if input_data.sex == "M" else "역행",
            "start_age": 7,
            "sequence": [
                ["壬", "午"], ["癸", "未"], ["甲", "申"], ["乙", "酉"],
                ["丙", "戌"], ["丁", "亥"], ["戊", "子"], ["己", "丑"]
            ]
        }
        
        # Create result
        result_data = {
            "input": {
                "datetime": input_data.datetime.isoformat(),
                "is_lunar": input_data.is_lunar,
                "sex": input_data.sex,
                "time_known": input_data.time_known
            },
            "pillars": pillars,
            "day_master": day_master,
            "five_elements": five_elements,
            "ten_gods": ten_gods,
            "luck_pillars": luck_pillars
        }
        
        # Calculate verification hash
        verify_hash = hashlib.sha256(
            json.dumps(result_data, sort_keys=True, ensure_ascii=False).encode()
        ).hexdigest()
        
        return SajuResult(
            input=result_data["input"],
            pillars=pillars,
            day_master=day_master,
            five_elements=five_elements,
            ten_gods=ten_gods,
            luck_pillars=luck_pillars,
            verify_hash=verify_hash
        )