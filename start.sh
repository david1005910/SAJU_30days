#!/bin/bash

# 사주공학 YouTube 자동화 시스템 시작 스크립트

echo "🚀 사주공학 시스템을 시작합니다..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check dependencies
echo "📦 의존성 확인 중..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker가 설치되어 있지 않습니다. 먼저 Docker를 설치해주세요.${NC}"
    exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm이 없습니다. 설치합니다...${NC}"
    npm install -g pnpm
fi

# Check Python and uv
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3가 설치되어 있지 않습니다.${NC}"
    exit 1
fi

if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}⚠️  uv가 없습니다. 설치합니다...${NC}"
    curl -LsSf https://astral.sh/uv/install.sh | sh
fi

# Check environment file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env 파일이 없습니다. 생성합니다...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  .env 파일에 ANTHROPIC_API_KEY를 설정해주세요!${NC}"
    exit 1
fi

# Start infrastructure
echo "🐳 Docker 인프라 시작..."
docker compose -f infra/docker-compose.yml up -d

# Wait for services
echo "⏳ 서비스 시작 대기 중..."
sleep 5

# Check if services are running
if ! docker compose -f infra/docker-compose.yml ps | grep -q "Up"; then
    echo -e "${RED}❌ Docker 서비스 시작 실패${NC}"
    exit 1
fi

# Install dependencies
echo "📥 의존성 설치..."
pnpm install

# Setup Python environment
echo "🐍 Python 환경 설정..."
cd services/api
uv pip install -r requirements.txt 2>/dev/null || uv pip install -e .
cd ../..

# Run database migrations
echo "🗄️  데이터베이스 마이그레이션..."
pnpm db:push

# Seed database (optional)
read -p "샘플 데이터를 생성하시겠습니까? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pnpm db:seed
fi

# Start services in separate terminals (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🖥️  서비스를 별도 터미널에서 시작합니다..."
    
    # FastAPI
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/services/api && uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000"'
    
    # Worker
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && pnpm dev:worker"'
    
    # Web Dashboard
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && pnpm dev:web"'
    
    sleep 3
    
    echo -e "${GREEN}✅ 시스템 시작 완료!${NC}"
    echo ""
    echo "📍 접속 주소:"
    echo "   대시보드: http://localhost:3000"
    echo "   API: http://localhost:8000"
    echo "   API 문서: http://localhost:8000/docs"
    echo ""
    echo "💡 종료하려면 각 터미널에서 Ctrl+C를 누르세요"
    
# Linux/WSL
else
    echo "🖥️  서비스를 시작합니다..."
    
    # Use tmux if available
    if command -v tmux &> /dev/null; then
        tmux new-session -d -s saju-api "cd services/api && uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000"
        tmux new-session -d -s saju-worker "pnpm dev:worker"
        tmux new-session -d -s saju-web "pnpm dev:web"
        
        echo -e "${GREEN}✅ 시스템 시작 완료! (tmux 세션)${NC}"
        echo ""
        echo "📍 접속 주소:"
        echo "   대시보드: http://localhost:3000"
        echo "   API: http://localhost:8000"
        echo "   API 문서: http://localhost:8000/docs"
        echo ""
        echo "💡 세션 보기: tmux ls"
        echo "💡 세션 연결: tmux attach -t [session-name]"
        echo "💡 종료: tmux kill-server"
    else
        # Fallback to concurrent execution
        echo "모든 서비스를 동시에 시작합니다..."
        pnpm start:all
    fi
fi