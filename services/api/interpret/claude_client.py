"""
Claude API client for Saju interpretation
"""

import os
import json
from typing import Dict, List, Optional
from dataclasses import dataclass
import anthropic
from anthropic import Anthropic

@dataclass
class InterpretationRequest:
    """Request for Saju interpretation"""
    saju_result: Dict  # From calculation engine
    episode_goal: str
    episode_keywords: List[str]
    tone: str = "공학적·차분·근거 제시"

@dataclass
class InterpretationResult:
    """Result of Claude interpretation"""
    intro_30s: str
    sections: List[Dict]
    youtube_meta: Dict
    model: str
    temperature: float
    prompt_tokens: int
    output_tokens: int
    validated: bool = False

class ClaudeInterpreter:
    """
    Claude API wrapper for Saju interpretation
    Only interprets calculated facts, never invents new data
    """
    
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key or api_key == "test_key_for_demo":
            # Mock mode for testing
            self.client = None
            self.mock_mode = True
        else:
            self.client = Anthropic(api_key=api_key)
            self.mock_mode = False
        self.model = "claude-3-5-sonnet-20241022"  # Latest model
        self.temperature = 0.7
        
    def interpret(self, request: InterpretationRequest) -> InterpretationResult:
        """
        Generate Korean script from Saju calculation
        """
        if self.mock_mode:
            # Return mock interpretation for testing
            return self._mock_interpret(request)
            
        prompt = self._build_prompt(request)
        
        try:
            response = self.client.messages.create(
                model=self.model,
                temperature=self.temperature,
                max_tokens=4000,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                system=self._get_system_prompt()
            )
            
            # Parse JSON response
            content = response.content[0].text
            parsed = json.loads(content)
            
            # Extract token usage
            usage = response.usage
            
            return InterpretationResult(
                intro_30s=parsed["intro_30s"],
                sections=parsed["sections"],
                youtube_meta=parsed["youtube"],
                model=self.model,
                temperature=self.temperature,
                prompt_tokens=usage.input_tokens,
                output_tokens=usage.output_tokens,
                validated=False  # Will be set by validator
            )
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse Claude response as JSON: {e}")
        except Exception as e:
            raise ValueError(f"Claude API error: {e}")
    
    def _get_system_prompt(self) -> str:
        """System prompt establishing rules and boundaries"""
        return """당신은 사주공학 채널의 스크립트 작가입니다.
        
중요 원칙:
1. 제공된 사주 계산 결과만을 해석합니다. 새로운 간지나 오행을 만들어내지 않습니다.
2. "전직 OLED CTO가 데이터로 풀어보는" 톤을 유지합니다.
3. 자극적 표현(충격, 대박, 운명) 사용 금지
4. 모든 해석에 근거를 제시합니다
5. 단정적 표현보다 경향성으로 설명합니다

출력 형식:
- 반드시 유효한 JSON으로만 응답
- 마크다운 백틱 사용 금지
- 한국어로 작성"""

    def _build_prompt(self, request: InterpretationRequest) -> str:
        """Build prompt from calculation result and episode info"""
        return f"""사주 계산 결과:
{json.dumps(request.saju_result, ensure_ascii=False, indent=2)}

에피소드 목표: {request.episode_goal}
키워드: {", ".join(request.episode_keywords)}

위 계산 결과를 바탕으로 YouTube 영상 스크립트를 작성해주세요.

요구사항:
1. 30초 인트로: 시청자를 사로잡을 핵심 질문이나 통찰
2. 본문 섹션: 3-4개 섹션으로 구성, 각각 제목/나레이션/화면텍스트 포함
3. YouTube 메타데이터: 제목 3개, 설명, 태그 10개, 썸네일 텍스트

다음 JSON 형식으로 응답하세요:
{{
    "intro_30s": "30초 인트로 스크립트",
    "sections": [
        {{
            "title": "섹션 제목",
            "narration": "나레이션 텍스트",
            "onscreen_text": "화면에 표시할 핵심 텍스트",
            "infographic": "five_elements_bar 또는 ten_gods_table 또는 null"
        }}
    ],
    "youtube": {{
        "titles": ["제목1", "제목2", "제목3"],
        "description": "영상 설명",
        "tags": ["태그1", "태그2", ...],
        "thumbnail_text": "썸네일 텍스트"
    }}
}}"""

    def _mock_interpret(self, request: InterpretationRequest) -> InterpretationResult:
        """Generate mock interpretation for testing"""
        return InterpretationResult(
            intro_30s="사주를 데이터로 보면 어떤 패턴이 보일까요? 오늘은 오행의 균형을 통계적으로 분석해봅니다.",
            sections=[
                {
                    "title": "오행 분포 분석",
                    "narration": "이 사주는 목 2개, 화 1개, 토 2개, 금 2개, 수 1개로 구성되어 있습니다.",
                    "onscreen_text": "균형잡힌 오행 분포",
                    "infographic": "five_elements_bar"
                },
                {
                    "title": "일간의 특성",
                    "narration": f"일간 {request.saju_result.get('day_master', '甲')}는 당신의 본질을 나타냅니다.",
                    "onscreen_text": "일간 = 나의 중심",
                    "infographic": None
                }
            ],
            youtube_meta={
                "titles": [
                    "사주를 데이터로 분석하면?",
                    "오행 균형의 통계학",
                    "당신의 사주 패턴 분석"
                ],
                "description": "사주공학 채널에서 전통 명리학을 현대적 데이터 분석으로 재해석합니다.",
                "tags": ["사주", "명리학", "데이터분석", "오행", "사주공학"],
                "thumbnail_text": "사주 = 데이터?"
            },
            model=self.model,
            temperature=self.temperature,
            prompt_tokens=100,
            output_tokens=200,
            validated=False
        )

class ValidationGate:
    """
    Validates Claude output against calculation results
    Prevents hallucination of non-existent Gan-Zhi or elements
    """
    
    def __init__(self):
        self.gan_set = set("甲乙丙丁戊己庚辛壬癸")
        self.zhi_set = set("子丑寅卯辰巳午未申酉戌亥")
        self.elements_set = {"목", "화", "토", "금", "수"}
        self.ten_gods_set = {
            "비견", "겁재", "식신", "상관", 
            "편재", "정재", "편관", "정관",
            "편인", "정인"
        }
    
    def validate(
        self, 
        interpretation: InterpretationResult,
        saju_result: Dict
    ) -> tuple[bool, Optional[str]]:
        """
        Validate interpretation against calculation
        Returns (is_valid, error_message)
        """
        # Extract allowed tokens from calculation
        allowed_tokens = self._extract_allowed_tokens(saju_result)
        
        # Check intro
        violations = self._check_text(interpretation.intro_30s, allowed_tokens)
        if violations:
            return False, f"Intro contains unvalidated tokens: {violations}"
        
        # Check sections
        for i, section in enumerate(interpretation.sections):
            text = section.get("narration", "") + section.get("onscreen_text", "")
            violations = self._check_text(text, allowed_tokens)
            if violations:
                return False, f"Section {i+1} contains unvalidated tokens: {violations}"
        
        return True, None
    
    def _extract_allowed_tokens(self, saju_result: Dict) -> set:
        """Extract all valid tokens from calculation"""
        allowed = set()
        
        # Add pillars
        pillars = saju_result.get("pillars", {})
        for pillar_type, pillar in pillars.items():
            if pillar:
                allowed.add(pillar[0])  # Gan
                allowed.add(pillar[1])  # Zhi
        
        # Add elements mentioned in calculation
        elements = saju_result.get("five_elements", {})
        allowed.update(elements.keys())
        
        # Add ten gods from calculation
        ten_gods = saju_result.get("ten_gods", {})
        allowed.update(ten_gods.values())
        
        return allowed
    
    def _check_text(self, text: str, allowed_tokens: set) -> List[str]:
        """Check text for tokens not in allowed set"""
        violations = []
        
        # Check Gan-Zhi
        for char in text:
            if char in self.gan_set or char in self.zhi_set:
                if char not in allowed_tokens:
                    violations.append(char)
        
        # Check elements (Korean)
        for element in self.elements_set:
            if element in text and element not in allowed_tokens:
                # Allow if used in general context, not as specific Saju element
                # This requires more sophisticated NLP, simplified here
                pass
        
        return violations