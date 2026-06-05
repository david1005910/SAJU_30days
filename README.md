# 사주공학 YouTube 자동화 시스템

전통 사주명리학을 데이터 기반으로 해석하는 YouTube 채널의 완전 자동화 파이프라인입니다.

## 시스템 구성

- **사주 계산**: Python sxtwl 기반 결정론적 계산 (AI 사용 안 함)
- **해석 생성**: Claude API를 통한 한국어 스크립트 생성
- **영상 제작**: Remotion으로 자동 렌더링
- **발행 관리**: Next.js 대시보드에서 1클릭 승인

## 빠른 시작

### 1. 환경 설정

```bash
# .env 파일 생성 (필수)
cp .env.example .env
# ANTHROPIC_API_KEY 설정 필요
```

### 2. 인프라 실행

```bash
# PostgreSQL + Redis 시작
docker compose -f infra/docker-compose.yml up -d

# 데이터베이스 마이그레이션
cd packages/db
pnpm prisma migrate dev
```

### 3. 서비스 시작

```bash
# FastAPI (사주 계산 + Claude 해석)
cd services/api
uv run uvicorn main:app --reload

# BullMQ Worker (파이프라인 처리)
cd apps/worker
pnpm dev

# Next.js Dashboard (운영 UI)
cd apps/web
pnpm dev
```

대시보드 접속: http://localhost:3000

## 8단계 파이프라인

```
[1] 주제 선정 → [2] 사주 계산 → [3] AI 해석
→ [4] 장면 분할 → [5] 이미지 생성 → [6] TTS
→ [7] 자막 동기화 → [8] 렌더/업로드
```

## 핵심 원칙

1. **사주 계산은 100% 결정론적** - AI는 해석만 담당
2. **환각 방지** - 계산되지 않은 간지/오행 자동 차단
3. **1클릭 운영** - 매일 승인 버튼 한 번만

## 30일 커리큘럼

- Day 1-5: 기초 개념 (사주란, 천간지지, 오행)
- Day 6-12: 십성 이해
- Day 13-18: 대운과 시간
- Day 19-30: 일간별 실전 분석

## 비용 추적

에피소드당 예상 비용:
- Claude API: $0.12
- 이미지 생성: $0.20
- TTS: $0.05
- 총합: ~$0.40/편

## 문의

사주공학 채널 운영 관련 문의는 이슈로 등록해주세요.