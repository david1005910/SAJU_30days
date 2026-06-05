# API 문서 (API Documentation)

## 개요

사주공학 API는 한국 전통 사주명리학 계산과 해석을 위한 RESTful API입니다.

## 기본 정보

- **Base URL**: `http://localhost:8000`
- **API Version**: v1
- **Content-Type**: `application/json`
- **Authentication**: API Key (환경변수 `ANTHROPIC_API_KEY`)

## 엔드포인트

### 1. 사주 계산

#### `POST /calculate`

생년월일과 시간을 기반으로 사주 팔자를 계산합니다.

**요청 본문**:
```json
{
  "name": "홍길동",
  "birth_year": 1990,
  "birth_month": 3,
  "birth_day": 15,
  "birth_hour": 14,
  "birth_minute": 30,
  "is_lunar": false,
  "gender": "male",
  "timezone": "Asia/Seoul"
}
```

**응답**:
```json
{
  "name": "홍길동",
  "birth_info": {
    "year": 1990,
    "month": 3,
    "day": 15,
    "hour": 14,
    "minute": 30,
    "is_lunar": false,
    "gender": "male",
    "timezone": "Asia/Seoul"
  },
  "pillars": {
    "year": {
      "gan": "경",
      "zhi": "오",
      "element": "금",
      "animal": "말"
    },
    "month": {
      "gan": "기",
      "zhi": "묘",
      "element": "토",
      "animal": "토끼"
    },
    "day": {
      "gan": "신",
      "zhi": "사",
      "element": "금",
      "animal": "뱀"
    },
    "hour": {
      "gan": "신",
      "zhi": "미",
      "element": "금",
      "animal": "양"
    }
  },
  "five_elements": {
    "wood": 1,
    "fire": 2,
    "earth": 1,
    "metal": 3,
    "water": 1
  },
  "ten_gods": {
    "self": "신금",
    "wealth": "목",
    "officer": "화",
    "seal": "토",
    "food": "수"
  }
}
```

### 2. 사주 해석

#### `POST /interpret`

계산된 사주를 Claude AI로 해석합니다.

**요청 본문**:
```json
{
  "saju_result": {
    // 위 calculate 응답과 동일한 형식
  },
  "interpretation_type": "general" // "general", "career", "love", "health"
}
```

**응답**:
```json
{
  "interpretation": {
    "summary": "전체적인 사주 요약...",
    "personality": "성격 분석...",
    "fortune": "운세 분석...",
    "advice": "조언 및 권고사항...",
    "yearly_fortune": "연간 운세...",
    "monthly_fortune": [
      {
        "month": 1,
        "fortune": "1월 운세..."
      }
      // ... 12개월
    ]
  },
  "metadata": {
    "interpretation_type": "general",
    "generated_at": "2024-01-15T10:30:00Z",
    "model": "claude-3-sonnet"
  }
}
```

### 3. 에피소드 관리

#### `POST /episodes`

새로운 에피소드를 생성하고 처리 파이프라인에 추가합니다.

**요청 본문**:
```json
{
  "title": "에피소드 제목 (선택사항)",
  "saju_input": {
    // calculate 엔드포인트와 동일한 형식
  }
}
```

**응답**:
```json
{
  "episode_id": "ep_abc123",
  "number": 1,
  "title": "홍길동님의 사주 분석",
  "status": "QUEUED",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `GET /episodes/{episode_id}`

특정 에피소드의 상태와 정보를 조회합니다.

**응답**:
```json
{
  "id": "ep_abc123",
  "number": 1,
  "title": "홍길동님의 사주 분석",
  "status": "PROCESSING", // QUEUED, PROCESSING, COMPLETED, FAILED
  "progress": {
    "current_stage": "INTERPRETATION",
    "completed_stages": ["CALCULATION", "INTERPRETATION"],
    "total_stages": 8
  },
  "saju_chart": {
    // 사주 계산 결과
  },
  "script": {
    "content": "스크립트 내용...",
    "scenes": [
      {
        "type": "INTRO",
        "duration": 30,
        "content": "인트로 내용..."
      }
      // ... 더 많은 씬
    ]
  },
  "video": {
    "url": "https://youtube.com/watch?v=...",
    "thumbnail": "https://...",
    "duration": 900
  },
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T11:30:00Z"
}
```

#### `GET /episodes`

모든 에피소드 목록을 조회합니다.

**쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `status`: 상태 필터 (QUEUED, PROCESSING, COMPLETED, FAILED)

**응답**:
```json
{
  "episodes": [
    {
      "id": "ep_abc123",
      "number": 1,
      "title": "홍길동님의 사주 분석",
      "status": "COMPLETED",
      "created_at": "2024-01-15T10:30:00Z",
      "completed_at": "2024-01-15T11:30:00Z"
    }
    // ... 더 많은 에피소드
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### 4. 시스템 상태

#### `GET /health`

API 서버의 상태를 확인합니다.

**응답**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected",
    "anthropic": "connected"
  }
}
```

#### `GET /stats`

시스템 통계를 조회합니다.

**응답**:
```json
{
  "episodes": {
    "total": 50,
    "completed": 45,
    "processing": 3,
    "failed": 2
  },
  "costs": {
    "total_usd": 125.50,
    "anthropic_api": 89.30,
    "youtube_storage": 36.20
  },
  "performance": {
    "avg_processing_time_minutes": 45,
    "success_rate": 0.96
  }
}
```

## 오류 코드

| 코드 | 메시지 | 설명 |
|------|--------|------|
| 400 | Bad Request | 잘못된 요청 형식 |
| 401 | Unauthorized | API 키가 없거나 잘못됨 |
| 404 | Not Found | 리소스를 찾을 수 없음 |
| 422 | Validation Error | 입력 데이터 검증 실패 |
| 429 | Rate Limit Exceeded | 요청 한도 초과 |
| 500 | Internal Server Error | 서버 내부 오류 |

## 예제

### Python 클라이언트

```python
import requests

# 사주 계산
response = requests.post("http://localhost:8000/calculate", json={
    "name": "홍길동",
    "birth_year": 1990,
    "birth_month": 3,
    "birth_day": 15,
    "birth_hour": 14,
    "birth_minute": 30,
    "is_lunar": False,
    "gender": "male",
    "timezone": "Asia/Seoul"
})

saju_result = response.json()
print(f"사주 계산 완료: {saju_result['name']}")

# 해석
interpretation_response = requests.post("http://localhost:8000/interpret", json={
    "saju_result": saju_result,
    "interpretation_type": "general"
})

interpretation = interpretation_response.json()
print(f"해석: {interpretation['interpretation']['summary']}")
```

### JavaScript 클라이언트

```javascript
// 에피소드 생성
const createEpisode = async () => {
  const response = await fetch('http://localhost:8000/episodes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: "홍길동님의 사주 분석",
      saju_input: {
        name: "홍길동",
        birth_year: 1990,
        birth_month: 3,
        birth_day: 15,
        birth_hour: 14,
        birth_minute: 30,
        is_lunar: false,
        gender: "male",
        timezone: "Asia/Seoul"
      }
    })
  });
  
  const episode = await response.json();
  console.log(`에피소드 생성됨: ${episode.episode_id}`);
  return episode;
};

// 에피소드 상태 확인
const checkEpisode = async (episodeId) => {
  const response = await fetch(`http://localhost:8000/episodes/${episodeId}`);
  const episode = await response.json();
  console.log(`상태: ${episode.status}`);
  return episode;
};
```

## 제한사항

- API 요청 속도: 초당 10회
- 사주 계산: 일일 1000회
- 에피소드 처리: 동시 5개
- 파일 업로드: 최대 100MB

## 지원

- GitHub Issues: [https://github.com/david1005910/SAJU_30days/issues](https://github.com/david1005910/SAJU_30days/issues)
- Email: david1005910@github.com