"""
Deterministic Saju calculation engine using sxtwl (수성천문력)
"""

# import sxtwl  # Temporarily disabled for testing
from datetime import datetime
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
import hashlib
import json

from .constants import GAN, ZHI, FIVE_ELEMENTS, TEN_GODS, SIXTY_JIAZI

@dataclass
class SajuInput:
    """Input parameters for Saju calculation"""
    datetime: datetime
    is_lunar: bool = False
    sex: str = "M"  # M or F
    time_known: bool = True
    timezone: str = "Asia/Seoul"
    true_solar_time: bool = True
    zishi_policy: str = "late_early"  # late_early or early_late

@dataclass
class SajuResult:
    """Result of Saju calculation"""
    input: Dict
    pillars: Dict[str, List[str]]  # year, month, day, hour -> [gan, zhi]
    day_master: str  # 일간
    five_elements: Dict[str, int]  # 오행 분포
    ten_gods: Dict[str, str]  # 십성 분포
    luck_pillars: Dict  # 대운 정보
    verify_hash: str  # SHA256 hash for validation

class SajuEngine:
    """
    Deterministic Saju calculation engine
    Uses sxtwl for accurate astronomical calculations
    """
    
    def __init__(self):
        # self.lunar = sxtwl.Lunar()  # Temporarily disabled
        pass
        
    def calculate(self, input_data: SajuInput) -> SajuResult:
        """
        Main calculation method
        Returns complete Saju analysis
        """
        # Convert lunar to solar if needed
        if input_data.is_lunar:
            solar_date = self._lunar_to_solar(input_data.datetime)
        else:
            solar_date = input_data.datetime
            
        # Get sxtwl day object
        day = self.lunar.getDayBySolar(
            solar_date.year,
            solar_date.month,
            solar_date.day
        )
        
        # Calculate four pillars
        year_pillar = self._get_year_pillar(day)
        month_pillar = self._get_month_pillar(day, solar_date)
        day_pillar = self._get_day_pillar(day)
        hour_pillar = self._get_hour_pillar(
            day_pillar[0], 
            solar_date.hour if input_data.time_known else None,
            input_data.zishi_policy
        )
        
        pillars = {
            "year": list(year_pillar),
            "month": list(month_pillar),
            "day": list(day_pillar),
            "hour": list(hour_pillar) if input_data.time_known else None
        }
        
        # Day master (일간)
        day_master = day_pillar[0]
        
        # Calculate five elements distribution
        five_elements = self._calculate_five_elements(pillars)
        
        # Calculate ten gods
        ten_gods = self._calculate_ten_gods(day_master, pillars)
        
        # Calculate luck pillars (대운)
        luck_pillars = self._calculate_luck_pillars(
            day_master,
            year_pillar[0],
            month_pillar,
            input_data.sex,
            day,
            solar_date
        )
        
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
    
    def _lunar_to_solar(self, lunar_date: datetime) -> datetime:
        """Convert lunar calendar date to solar"""
        # Implementation using sxtwl
        # This is a simplified version - full implementation would handle leap months
        solar = self.lunar.getLunarCalendar(
            lunar_date.year,
            lunar_date.month,
            lunar_date.day,
            False  # isLeap
        )
        return datetime(solar.y, solar.m, solar.d, lunar_date.hour, lunar_date.minute)
    
    def _get_year_pillar(self, day: sxtwl.Day) -> Tuple[str, str]:
        """Get year pillar (연주)"""
        return (GAN[day.getYearGZ().tg], ZHI[day.getYearGZ().dz])
    
    def _get_month_pillar(self, day: sxtwl.Day, solar_date: datetime) -> Tuple[str, str]:
        """Get month pillar (월주) - based on solar terms"""
        # Month pillar changes at solar term boundaries
        month_gz = day.getMonthGZ()
        return (GAN[month_gz.tg], ZHI[month_gz.dz])
    
    def _get_day_pillar(self, day: sxtwl.Day) -> Tuple[str, str]:
        """Get day pillar (일주)"""
        return (GAN[day.getDayGZ().tg], ZHI[day.getDayGZ().dz])
    
    def _get_hour_pillar(
        self, 
        day_gan: str, 
        hour: Optional[int],
        zishi_policy: str
    ) -> Optional[Tuple[str, str]]:
        """Get hour pillar (시주)"""
        if hour is None:
            return None
            
        # Determine hour branch (시지)
        hour_branches = "子丑寅卯辰巳午未申酉戌亥"
        
        # Handle 자시 (23:00-01:00) policy
        if zishi_policy == "late_early":
            # 23:00-00:00 is late 자시 (previous day)
            # 00:00-01:00 is early 자시 (current day)
            if hour >= 23:
                hour_idx = 0
            else:
                hour_idx = ((hour + 1) // 2) % 12
        else:
            # Simple division
            hour_idx = ((hour + 1) // 2) % 12
            
        hour_zhi = hour_branches[hour_idx]
        
        # Calculate hour stem (시간) based on day stem
        # 甲己 -> 甲子시 starts
        # 乙庚 -> 丙子시 starts
        # 丙辛 -> 戊子시 starts
        # 丁壬 -> 庚子시 starts
        # 戊癸 -> 壬子시 starts
        day_gan_idx = GAN.index(day_gan)
        hour_gan_start = [0, 2, 4, 6, 8][day_gan_idx % 5]
        hour_gan_idx = (hour_gan_start + hour_idx) % 10
        hour_gan = GAN[hour_gan_idx]
        
        return (hour_gan, hour_zhi)
    
    def _calculate_five_elements(self, pillars: Dict) -> Dict[str, int]:
        """Calculate five elements distribution"""
        elements_count = {"목": 0, "화": 0, "토": 0, "금": 0, "수": 0}
        
        for pillar_type, pillar in pillars.items():
            if pillar is None:
                continue
            gan, zhi = pillar
            elements_count[FIVE_ELEMENTS[gan]] += 1
            elements_count[FIVE_ELEMENTS[zhi]] += 1
            
        return elements_count
    
    def _calculate_ten_gods(self, day_master: str, pillars: Dict) -> Dict[str, str]:
        """Calculate ten gods (십성) for each position"""
        ten_gods_map = TEN_GODS[day_master]
        result = {}
        
        for pillar_type, pillar in pillars.items():
            if pillar is None or pillar_type == "day":
                continue
            gan, _ = pillar
            result[f"{pillar_type}_gan"] = ten_gods_map[gan]
            
        return result
    
    def _calculate_luck_pillars(
        self,
        day_master: str,
        year_gan: str,
        month_pillar: Tuple[str, str],
        sex: str,
        day: sxtwl.Day,
        birth_date: datetime
    ) -> Dict:
        """Calculate luck pillars (대운)"""
        # Determine direction (순행/역행)
        year_gan_idx = GAN.index(year_gan)
        is_yang_year = year_gan_idx % 2 == 0
        
        if (sex == "M" and is_yang_year) or (sex == "F" and not is_yang_year):
            direction = "순행"
            step = 1
        else:
            direction = "역행"
            step = -1
            
        # Calculate start age (대운수)
        # This is simplified - full implementation would calculate days to next solar term
        # and convert to years (3 days = 1 year)
        start_age = 7  # Default simplified value
        
        # Generate luck pillar sequence
        month_gan, month_zhi = month_pillar
        current_gan_idx = GAN.index(month_gan)
        current_zhi_idx = ZHI.index(month_zhi)
        
        sequence = []
        for i in range(8):  # 8 luck periods (80 years)
            next_gan_idx = (current_gan_idx + step * (i + 1)) % 10
            next_zhi_idx = (current_zhi_idx + step * (i + 1)) % 12
            sequence.append([GAN[next_gan_idx], ZHI[next_zhi_idx]])
            
        return {
            "direction": direction,
            "start_age": start_age,
            "sequence": sequence
        }
    
    def validate_against_almanac(self, result: SajuResult, almanac_data: Dict) -> bool:
        """
        Validate calculation result against traditional almanac
        Used for testing and quality assurance
        """
        # Compare pillars
        for pillar_type in ["year", "month", "day", "hour"]:
            if pillar_type in almanac_data:
                if result.pillars[pillar_type] != almanac_data[pillar_type]:
                    return False
        return True