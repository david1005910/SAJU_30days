# SAJU_30days - 사주공학 YouTube 자동화 시스템

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**전통 사주명리학을 데이터 기반으로 해석하는 YouTube 채널 자동화 파이프라인**

[데모 보기](#demo) • [빠른 시작](#quick-start) • [문서](#documentation) • [기여하기](#contributing)

</div>

## 🎯 프로젝트 소개

사주공학(Saju Engineering)은 전통 사주명리학을 "감(感)"이 아닌 **데이터·규칙·검증 가능한 절차**로 풀어내는 YouTube 채널의 완전 자동화 시스템입니다.

### 핵심 특징

- 🔬 **100% 결정론적 사주 계산** - AI 환각 없는 정확한 만세력 기반 계산
- 🤖 **Claude AI 해석** - 계산된 사실만을 해석하는 안전한 AI 활용
- 🎬 **완전 자동 영상 생성** - Remotion 기반 고품질 영상 렌더링
- 📅 **30일 커리큘럼** - 체계적인 학습 진행 구조
- 💰 **비용 추적** - 에피소드당 상세 비용 분석 (평균 $0.40)
- 🚀 **1클릭 운영** - 매일 승인 버튼 한 번으로 운영 가능

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────┐
│           운영자 (브라우저)               │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼─────────┐
         │  Next.js 14      │  대시보드
         └───────┬─────────┘
                 │
         ┌───────▼─────────┐
         │  FastAPI         │  사주 계산 엔진
         └───┬───────┬─────┘
             │       │
      ┌──────▼─┐  ┌──▼───────┐
      │ BullMQ │  │ Claude AI │
      └────────┘  └───────────┘
             │
      ┌──────▼─────────┐
      │ Remotion → YouTube │
      └──────────────────┘
```

## 📦 기술 스택

| 영역 | 기술 | 설명 |
|------|------|------|
| 🎯 프런트엔드 | Next.js 14 | 운영 대시보드 |
| ⚙️ 백엔드 | FastAPI | 사주 계산 엔진 + API |
| 🤖 AI | Claude API | 한국어 해석 생성 |
| 📹 영상 | Remotion | React 기반 영상 렌더링 |
| 🗣️ TTS | Edge TTS | 한국어 음성 합성 |
| 💾 DB | PostgreSQL + Prisma | 데이터 관리 |
| 📊 큐 | BullMQ + Redis | 파이프라인 관리 |

## 🚀 빠른 시작 {#quick-start}

### 필수 준비사항

- Docker Desktop
- Node.js 18+
- Python 3.11+
- Anthropic API Key

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/david1005910/SAJU_30days.git
cd SAJU_30days

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일에 ANTHROPIC_API_KEY 설정

# 3. 시스템 시작
./start.sh

# 4. 대시보드 접속
open http://localhost:3000
```

## 📚 30일 커리큘럼

| 주차 | 내용 | 에피소드 |
|------|------|----------|
| 1주 | 기초 개념 | 사주란?, 천간지지, 오행, 일간 |
| 2주 | 십성 이해 | 비견/겁재, 식신/상관, 편재/정재, 편관/정관, 편인/정인 |
| 3주 | 대운과 시간 | 대운, 세운, 월운, 교운기, 신살 |
| 4-5주 | 실전 분석 | 일간별 특성 분석 (갑목~계수) |

## 🎬 8단계 파이프라인

```mermaid
graph LR
    A[주제 선정] --> B[사주 계산]
    B --> C[AI 해석]
    C --> D[장면 분할]
    D --> E[이미지 생성]
    E --> F[TTS 생성]
    F --> G[자막 동기화]
    G --> H[렌더/업로드]
```

## 📊 비용 분석

| 항목 | 비용 | 설명 |
|------|------|------|
| Claude API | ~$0.12 | 스크립트 생성 |
| 이미지 생성 | ~$0.20 | 장면별 이미지 |
| TTS | ~$0.05 | 한국어 음성 |
| **총합** | **~$0.40** | 에피소드당 |

## 🔒 보안 및 윤리

- ✅ 결정론적 계산으로 AI 환각 방지
- ✅ 개인정보 보호 (익명/가상 데이터만 사용)
- ✅ 교양/엔터테인먼트 목적 명시
- ✅ 공포 마케팅 금지

## 📝 주요 명령어

```bash
# 시스템 관리
./start.sh          # 전체 시스템 시작
./stop.sh           # 시스템 종료
./test-pipeline.sh  # 파이프라인 테스트

# 데이터베이스
pnpm db:studio      # Prisma Studio
pnpm db:seed        # 샘플 데이터 생성

# 개발
pnpm dev            # 개발 서버 시작
pnpm build          # 프로덕션 빌드
```

## 🤝 기여하기 {#contributing}

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 말

- 전통 사주명리학 지식 제공: 한국 명리학회
- AI 기술 지원: Anthropic Claude
- 영상 렌더링: Remotion 팀

## 📞 문의

- GitHub Issues: [문제 제보](https://github.com/david1005910/SAJU_30days/issues)
- Email: david1005910@github.com

---

<div align="center">

**🤖 Built with Claude Code**

[⭐ Star](https://github.com/david1005910/SAJU_30days) • 
[🐛 Issues](https://github.com/david1005910/SAJU_30days/issues) • 
[📖 Wiki](https://github.com/david1005910/SAJU_30days/wiki)

</div>