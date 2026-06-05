#!/bin/bash

# 사주공학 시스템 종료 스크립트

echo "🛑 사주공학 시스템을 종료합니다..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Kill Node processes
echo "Stopping Node services..."
pkill -f "next dev" 2>/dev/null
pkill -f "tsx watch" 2>/dev/null
pkill -f "remotion" 2>/dev/null

# Kill Python processes
echo "Stopping Python services..."
pkill -f "uvicorn" 2>/dev/null

# Kill tmux sessions if they exist
if command -v tmux &> /dev/null; then
    tmux kill-session -t saju-api 2>/dev/null
    tmux kill-session -t saju-worker 2>/dev/null
    tmux kill-session -t saju-web 2>/dev/null
fi

# Stop Docker containers
echo "🐳 Docker 컨테이너 종료..."
docker compose -f infra/docker-compose.yml down

echo -e "${GREEN}✅ 시스템 종료 완료${NC}"