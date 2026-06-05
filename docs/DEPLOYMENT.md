# 배포 가이드 (Deployment Guide)

## 개요

이 문서는 사주공학 시스템을 프로덕션 환경에 배포하는 방법을 안내합니다.

## 배포 옵션

### 1. Docker Compose (권장)
### 2. 클라우드 서비스 (AWS, GCP, Azure)
### 3. 로컬 서버 수동 설치

---

## 1. Docker Compose 배포 (권장)

### 사전 요구사항

- Docker Engine 20.10+
- Docker Compose v2.0+
- 최소 4GB RAM, 20GB 저장공간
- 포트 3000, 8000, 5432, 6379 사용 가능

### 배포 단계

#### 1단계: 저장소 클론

```bash
git clone https://github.com/david1005910/SAJU_30days.git
cd SAJU_30days
```

#### 2단계: 환경 변수 설정

```bash
# 환경 파일 복사
cp .env.example .env

# 필수 환경 변수 설정
nano .env
```

**필수 설정 항목**:
```bash
# Claude API 키 (https://console.anthropic.com에서 발급)
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# 보안 키 생성
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# 프로덕션 도메인 설정
NEXTAUTH_URL=https://your-domain.com

# 데이터베이스 비밀번호 변경
POSTGRES_PASSWORD=$(openssl rand -base64 16)
```

#### 3단계: Docker 네트워크 및 볼륨 준비

```bash
# Docker 네트워크 생성
docker network create saju-network

# 데이터 볼륨 생성
docker volume create saju-postgres-data
docker volume create saju-redis-data
docker volume create saju-storage
```

#### 4단계: 배포 시작

```bash
# 프로덕션 모드로 시작
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 로그 확인
docker compose logs -f
```

#### 5단계: 데이터베이스 초기화

```bash
# 데이터베이스 마이그레이션
docker compose exec web pnpm db:push

# 초기 데이터 삽입
docker compose exec web pnpm db:seed

# 커리큘럼 로드
docker compose exec api python -m saju.curriculum.loader
```

#### 6단계: 상태 확인

```bash
# 서비스 상태 확인
curl http://localhost:8000/health
curl http://localhost:3000/api/health

# 컨테이너 상태 확인
docker compose ps
```

---

## 2. 클라우드 서비스 배포

### AWS 배포

#### ECS (Elastic Container Service) 사용

```bash
# AWS CLI 설정
aws configure

# ECR 로그인
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# 이미지 빌드 및 푸시
docker build -t saju-api -f Dockerfile.api .
docker build -t saju-web -f Dockerfile.web .

docker tag saju-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/saju-api:latest
docker tag saju-web:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/saju-web:latest

docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/saju-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/saju-web:latest
```

#### RDS 및 ElastiCache 설정

```bash
# RDS PostgreSQL 인스턴스 생성
aws rds create-db-instance \
  --db-instance-identifier saju-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username saju \
  --master-user-password your-secure-password \
  --allocated-storage 20

# ElastiCache Redis 클러스터 생성
aws elasticache create-cache-cluster \
  --cache-cluster-id saju-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### GCP 배포

#### Cloud Run 사용

```bash
# gcloud 설정
gcloud init

# 이미지 빌드 및 배포
gcloud builds submit --tag gcr.io/PROJECT_ID/saju-api -f Dockerfile.api
gcloud builds submit --tag gcr.io/PROJECT_ID/saju-web -f Dockerfile.web

# Cloud Run 서비스 배포
gcloud run deploy saju-api \
  --image gcr.io/PROJECT_ID/saju-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars="ANTHROPIC_API_KEY=your-key"

gcloud run deploy saju-web \
  --image gcr.io/PROJECT_ID/saju-web \
  --platform managed \
  --region us-central1
```

### Azure 배포

#### Container Instances 사용

```bash
# Azure CLI 설정
az login

# 리소스 그룹 생성
az group create --name SajuResourceGroup --location eastus

# Container Registry 생성
az acr create --resource-group SajuResourceGroup --name sajuregistry --sku Basic

# 이미지 빌드 및 푸시
az acr build --registry sajuregistry --image saju-api -f Dockerfile.api .
az acr build --registry sajuregistry --image saju-web -f Dockerfile.web .

# Container Instances 배포
az container create \
  --resource-group SajuResourceGroup \
  --name saju-api \
  --image sajuregistry.azurecr.io/saju-api \
  --environment-variables ANTHROPIC_API_KEY=your-key
```

---

## 3. 로컬 서버 수동 설치

### Ubuntu 20.04+ 기준

#### 사전 요구사항 설치

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 20 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Python 3.11 설치
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install -y python3.11 python3.11-venv python3.11-dev

# pnpm 설치
npm install -g pnpm

# PostgreSQL 설치
sudo apt install -y postgresql postgresql-contrib

# Redis 설치
sudo apt install -y redis-server

# FFmpeg 설치 (비디오 처리용)
sudo apt install -y ffmpeg
```

#### 데이터베이스 설정

```bash
# PostgreSQL 설정
sudo -u postgres psql
CREATE USER saju WITH ENCRYPTED PASSWORD 'secure_password';
CREATE DATABASE saju_engine OWNER saju;
GRANT ALL PRIVILEGES ON DATABASE saju_engine TO saju;
\q

# Redis 설정
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

#### 애플리케이션 배포

```bash
# 저장소 클론
git clone https://github.com/david1005910/SAJU_30days.git
cd SAJU_30days

# 의존성 설치
pnpm install

# Python 환경 설정
cd services/api
python3.11 -m venv venv
source venv/bin/activate
pip install uv
uv pip install -r pyproject.toml
cd ../..

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집하여 실제 값 설정

# 데이터베이스 마이그레이션
pnpm db:push
pnpm db:seed

# 빌드
pnpm build

# PM2로 프로세스 관리
sudo npm install -g pm2

# API 서버 시작
cd services/api
pm2 start "uv run uvicorn main:app --host 0.0.0.0 --port 8000" --name saju-api

# 웹 서버 시작
cd ../../apps/web
pm2 start "pnpm start" --name saju-web

# Worker 시작
cd ../../apps/worker
pm2 start "pnpm start" --name saju-worker

# PM2 설정 저장
pm2 save
pm2 startup
```

---

## 4. 도메인 및 SSL 설정

### Nginx 리버스 프록시 설정

```bash
# Nginx 설치
sudo apt install -y nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/saju-engine
```

**Nginx 설정 내용**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # API 프록시
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 웹 앱 프록시
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Let's Encrypt SSL 인증서

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo crontab -e
# 다음 줄 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 5. 모니터링 및 유지보수

### 로그 관리

```bash
# Docker 로그 확인
docker compose logs -f --tail=100

# PM2 로그 확인
pm2 logs saju-api
pm2 logs saju-web
pm2 logs saju-worker
```

### 백업 설정

#### 데이터베이스 백업

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/saju"

# PostgreSQL 백업
pg_dump -h localhost -U saju saju_engine > $BACKUP_DIR/db_$DATE.sql

# Redis 백업
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# 파일 스토리지 백업
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz ./storage

# 7일 이상 된 백업 파일 삭제
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

#### 자동 백업 설정

```bash
# 크론탭 설정
sudo crontab -e

# 매일 새벽 2시 백업
0 2 * * * /path/to/backup.sh
```

### 성능 모니터링

```bash
# 리소스 사용량 확인
docker stats

# 애플리케이션 메트릭 확인
curl http://localhost:8001/metrics

# 데이터베이스 성능 확인
sudo -u postgres psql saju_engine -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
"
```

---

## 6. 업데이트 절차

### 코드 업데이트

```bash
# 저장소 업데이트
git pull origin main

# 의존성 업데이트
pnpm install

# 데이터베이스 마이그레이션 (필요시)
pnpm db:push

# 빌드
pnpm build

# 서비스 재시작
docker compose restart  # Docker 사용 시
# 또는
pm2 restart all  # PM2 사용 시
```

### 롤백 절차

```bash
# 이전 버전으로 롤백
git checkout previous-stable-tag

# 데이터베이스 복원 (필요시)
psql -U saju -d saju_engine < /var/backups/saju/db_YYYYMMDD_HHMMSS.sql

# 서비스 재시작
docker compose restart
```

---

## 7. 트러블슈팅

### 자주 발생하는 문제

#### API 서버가 시작되지 않는 경우

```bash
# 로그 확인
docker compose logs api

# 환경 변수 확인
docker compose exec api env | grep ANTHROPIC

# 포트 충돌 확인
sudo netstat -tulpn | grep :8000
```

#### 데이터베이스 연결 실패

```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# 연결 테스트
psql -h localhost -U saju -d saju_engine -c "SELECT 1;"

# 방화벽 확인
sudo ufw status
```

#### Redis 연결 실패

```bash
# Redis 상태 확인
redis-cli ping

# Redis 설정 확인
redis-cli CONFIG GET "*"
```

#### 메모리 부족

```bash
# 메모리 사용량 확인
free -h

# 프로세스별 메모리 사용량
ps aux --sort=-%mem | head

# 스왑 추가 (필요시)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 긴급 복구 절차

#### 전체 시스템 복구

```bash
# 1. 서비스 중단
docker compose down

# 2. 데이터베이스 복원
psql -U saju -d saju_engine < /var/backups/saju/latest_db.sql

# 3. 스토리지 복원
tar -xzf /var/backups/saju/latest_storage.tar.gz

# 4. 서비스 재시작
docker compose up -d

# 5. 상태 확인
curl http://localhost:8000/health
```

---

## 8. 보안 설정

### 방화벽 설정

```bash
# UFW 활성화
sudo ufw enable

# 필요한 포트만 열기
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# 내부 포트는 로컬호스트만 허용
sudo ufw allow from 127.0.0.1 to any port 5432
sudo ufw allow from 127.0.0.1 to any port 6379
```

### 정기 보안 업데이트

```bash
# 시스템 패키지 업데이트 자동화
sudo nano /etc/cron.daily/security-updates

#!/bin/bash
apt update
apt upgrade -y
apt autoremove -y
```

---

## 지원

배포 과정에서 문제가 발생하면:

- GitHub Issues: [https://github.com/david1005910/SAJU_30days/issues](https://github.com/david1005910/SAJU_30days/issues)
- Email: david1005910@github.com
- 문서: [README.md](../README.md), [CONTRIBUTING.md](../CONTRIBUTING.md)