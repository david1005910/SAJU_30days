# 사주공학 빠른 시작 가이드

## 🚀 5분 안에 시작하기

### 1. 필수 준비사항

```bash
# API 키 설정 (필수!)
cp .env.example .env
# .env 파일을 열어서 ANTHROPIC_API_KEY 입력
```

### 2. 시스템 시작

```bash
# 전체 시스템 자동 시작 (추천)
./start.sh

# 또는 수동으로 시작
docker compose -f infra/docker-compose.yml up -d  # DB/Redis
cd services/api && uv run uvicorn main:app        # Python API
pnpm dev:worker                                   # Worker
pnpm dev:web                                       # Dashboard
```

### 3. 대시보드 접속

브라우저에서 http://localhost:3000 접속

### 4. 첫 에피소드 생성

1. 대시보드에서 "새 에피소드 생성" 클릭
2. Day 1 커리큘럼 선택
3. 파이프라인 진행 상태 확인
4. "검토대기" 상태가 되면 "승인" 클릭
5. YouTube 업로드 완료!

## 📝 주요 명령어

```bash
# 시작/종료
./start.sh    # 시스템 시작
./stop.sh     # 시스템 종료

# 테스트
./test-pipeline.sh  # 파이프라인 테스트

# 데이터베이스
pnpm db:studio     # Prisma Studio (DB 관리 UI)
pnpm db:seed       # 샘플 데이터 생성

# 개별 서비스
pnpm dev:web       # 대시보드만 실행
pnpm dev:worker    # 워커만 실행
```

## 🎯 핵심 작업 흐름

```
1. 커리큘럼 선택 (30일 중 선택)
   ↓
2. 사주 계산 (Python 엔진)
   ↓
3. AI 해석 생성 (Claude API)
   ↓
4. 영상 자동 생성 (Remotion)
   ↓
5. 운영자 검토 (대시보드)
   ↓
6. YouTube 발행 (1클릭 승인)
```

## ⚙️ 환경 변수 설정

`.env` 파일 필수 설정:

```env
# 필수
ANTHROPIC_API_KEY=sk-ant-...

# 선택 (YouTube 업로드용)
YOUTUBE_CLIENT_SECRET_PATH=./secrets/client_secret.json
```

## 🆘 문제 해결

### Docker 컨테이너가 시작되지 않음
```bash
docker compose -f infra/docker-compose.yml logs
docker compose -f infra/docker-compose.yml restart
```

### 데이터베이스 연결 실패
```bash
# DB 재시작
docker compose -f infra/docker-compose.yml restart db
# 마이그레이션 재실행
pnpm db:push
```

### Claude API 오류
- `.env`의 `ANTHROPIC_API_KEY` 확인
- API 잔액/한도 확인

### 포트 충돌
- 3000 (Next.js), 8000 (FastAPI), 5432 (PostgreSQL), 6379 (Redis)
- 다른 프로세스가 사용 중이면 종료 필요

## 📊 모니터링

- **대시보드**: http://localhost:3000
- **API 문서**: http://localhost:8000/docs
- **DB 관리**: `pnpm db:studio` 실행 후 http://localhost:5555
- **Redis**: `docker exec -it saju-redis redis-cli`

## 💰 비용 추적

에피소드당 예상 비용:
- Claude API: ~$0.12
- 이미지 생성: ~$0.20
- TTS: ~$0.05
- **총 ~$0.40/에피소드**

대시보드에서 실시간 비용 확인 가능

## 🎬 30일 커리큘럼

- **Day 1-5**: 기초 (사주란?, 천간지지, 오행)
- **Day 6-12**: 십성 이해
- **Day 13-18**: 대운과 시간
- **Day 19-30**: 일간별 실전 분석

매일 자동 생성, 1클릭 승인으로 발행!