#!/bin/bash

# 파이프라인 테스트 스크립트

echo "🧪 사주공학 파이프라인 테스트"
echo "================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if services are running
check_service() {
    if curl -s -o /dev/null -w "%{http_code}" $1 | grep -q "200\|404"; then
        echo -e "${GREEN}✅ $2 실행 중${NC}"
        return 0
    else
        echo -e "${RED}❌ $2가 실행되지 않음${NC}"
        return 1
    fi
}

echo -e "\n${BLUE}1. 서비스 상태 확인${NC}"
echo "------------------------"
check_service "http://localhost:8000" "FastAPI"
API_RUNNING=$?
check_service "http://localhost:3000" "Next.js Dashboard"
WEB_RUNNING=$?

if [ $API_RUNNING -ne 0 ] || [ $WEB_RUNNING -ne 0 ]; then
    echo -e "${RED}서비스를 먼저 시작해주세요: ./start.sh${NC}"
    exit 1
fi

echo -e "\n${BLUE}2. 사주 계산 테스트${NC}"
echo "------------------------"
CALC_RESPONSE=$(curl -s -X POST http://localhost:8000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "datetime": "1990-05-15T14:30:00",
    "is_lunar": false,
    "sex": "M",
    "time_known": true
  }')

if echo "$CALC_RESPONSE" | grep -q "pillars"; then
    echo -e "${GREEN}✅ 사주 계산 성공${NC}"
    echo "$CALC_RESPONSE" | python3 -m json.tool | head -20
else
    echo -e "${RED}❌ 사주 계산 실패${NC}"
    echo "$CALC_RESPONSE"
fi

echo -e "\n${BLUE}3. 커리큘럼 확인${NC}"
echo "------------------------"
CURRICULUM=$(curl -s http://localhost:8000/api/curriculum)
if echo "$CURRICULUM" | grep -q "episodes"; then
    echo -e "${GREEN}✅ 30일 커리큘럼 로드 성공${NC}"
    echo "$CURRICULUM" | python3 -m json.tool | grep "title" | head -5
else
    echo -e "${RED}❌ 커리큘럼 로드 실패${NC}"
fi

echo -e "\n${BLUE}4. 에피소드 생성 테스트${NC}"
echo "------------------------"
EPISODE_RESPONSE=$(curl -s -X POST http://localhost:8000/api/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "curriculum_day": 1
  }')

if echo "$EPISODE_RESPONSE" | grep -q "episode"; then
    echo -e "${GREEN}✅ 에피소드 생성 성공${NC}"
    echo "$EPISODE_RESPONSE" | python3 -m json.tool
    EPISODE_ID=$(echo "$EPISODE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['episode']['id'])" 2>/dev/null)
    echo "에피소드 ID: $EPISODE_ID"
else
    echo -e "${RED}❌ 에피소드 생성 실패${NC}"
    echo "$EPISODE_RESPONSE"
fi

echo -e "\n${BLUE}5. AI 해석 테스트 (Claude API 필요)${NC}"
echo "------------------------"
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  ANTHROPIC_API_KEY가 설정되지 않음 - 스킵${NC}"
else
    INTERPRET_RESPONSE=$(curl -s -X POST http://localhost:8000/api/interpret \
      -H "Content-Type: application/json" \
      -d "{
        \"episode_id\": \"$EPISODE_ID\"
      }")
    
    if echo "$INTERPRET_RESPONSE" | grep -q "interpretation"; then
        echo -e "${GREEN}✅ AI 해석 생성 성공${NC}"
        echo "$INTERPRET_RESPONSE" | python3 -m json.tool | head -20
    else
        echo -e "${RED}❌ AI 해석 실패${NC}"
        echo "$INTERPRET_RESPONSE"
    fi
fi

echo -e "\n${BLUE}6. 데이터베이스 확인${NC}"
echo "------------------------"
DB_CHECK=$(docker exec -i saju-postgres psql -U saju -d saju -c "SELECT COUNT(*) FROM \"Episode\";" 2>/dev/null | grep -o '[0-9]\+' | head -1)
if [ ! -z "$DB_CHECK" ]; then
    echo -e "${GREEN}✅ 데이터베이스 연결 성공 (에피소드: $DB_CHECK개)${NC}"
else
    echo -e "${RED}❌ 데이터베이스 연결 실패${NC}"
fi

echo -e "\n${BLUE}7. Redis 큐 확인${NC}"
echo "------------------------"
REDIS_CHECK=$(docker exec -i saju-redis redis-cli ping 2>/dev/null)
if [ "$REDIS_CHECK" = "PONG" ]; then
    echo -e "${GREEN}✅ Redis 연결 성공${NC}"
    QUEUE_COUNT=$(docker exec -i saju-redis redis-cli llen "bull:saju.pipeline:wait" 2>/dev/null)
    echo "대기 중인 작업: ${QUEUE_COUNT:-0}개"
else
    echo -e "${RED}❌ Redis 연결 실패${NC}"
fi

echo -e "\n================================"
echo -e "${GREEN}테스트 완료!${NC}"
echo ""
echo "다음 단계:"
echo "1. 대시보드 접속: http://localhost:3000"
echo "2. 에피소드 생성 및 승인"
echo "3. 파이프라인 실행 모니터링"