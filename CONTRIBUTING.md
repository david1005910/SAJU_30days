# 기여 가이드 (Contributing Guide)

먼저 사주공학 프로젝트에 관심을 가져주셔서 감사합니다! 🙏

이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 📋 목차

- [행동 강령](#행동-강령)
- [기여 방법](#기여-방법)
- [개발 환경 설정](#개발-환경-설정)
- [코드 스타일](#코드-스타일)
- [커밋 메시지 규칙](#커밋-메시지-규칙)
- [Pull Request 프로세스](#pull-request-프로세스)
- [이슈 제보](#이슈-제보)

## 행동 강령

이 프로젝트는 모든 참여자가 서로를 존중하고 배려하는 환경을 지향합니다.

- 🤝 서로를 존중하고 건설적인 피드백을 제공하세요
- 🌍 다양한 배경과 경험을 가진 사람들을 환영합니다
- 📚 배움의 자세를 유지하고 실수를 인정하세요

## 기여 방법

### 1. 이슈 확인
- 작업하기 전에 [Issues](https://github.com/david1005910/SAJU_30days/issues)를 확인하세요
- 작업하려는 내용이 이미 논의되고 있는지 확인하세요
- 새로운 기능이나 큰 변경사항은 먼저 이슈로 논의해주세요

### 2. Fork & Clone
```bash
# Fork 후 클론
git clone https://github.com/[your-username]/SAJU_30days.git
cd SAJU_30days

# Upstream 저장소 추가
git remote add upstream https://github.com/david1005910/SAJU_30days.git
```

### 3. 브랜치 생성
```bash
# 최신 코드 동기화
git fetch upstream
git checkout main
git merge upstream/main

# 작업 브랜치 생성
git checkout -b feature/amazing-feature
```

## 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- Python 3.11+
- Docker Desktop
- pnpm 8+

### 설치
```bash
# 의존성 설치
pnpm install

# Python 환경 설정
cd services/api
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -r pyproject.toml

# Docker 인프라 시작
docker compose -f infra/docker-compose.yml up -d

# 데이터베이스 설정
pnpm db:push
pnpm db:seed
```

### 테스트 실행
```bash
# 전체 테스트
./test-pipeline.sh

# Node.js 테스트
pnpm test

# Python 테스트
cd services/api
uv run pytest
```

## 코드 스타일

### TypeScript/JavaScript
- ESLint와 Prettier 설정을 따라주세요
- 함수와 변수는 camelCase 사용
- 컴포넌트와 클래스는 PascalCase 사용

### Python
- PEP 8 스타일 가이드 준수
- Black 포매터 사용
- Type hints 적극 활용

### 공통
- 주석은 한국어 가능 (코드는 영어)
- 의미 있는 변수명 사용
- 함수는 단일 책임 원칙 준수

## 커밋 메시지 규칙

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스, 도구 설정 등

### 예시
```bash
feat(api): 사주 계산 정확도 향상

- sxtwl 라이브러리 버전 업데이트
- 절기 계산 로직 개선
- 자시 처리 옵션 추가

Closes #123
```

## Pull Request 프로세스

### 1. PR 생성 전 체크리스트
- [ ] 코드가 프로젝트 스타일 가이드를 따르는가?
- [ ] 모든 테스트가 통과하는가?
- [ ] 새로운 기능에 대한 테스트를 추가했는가?
- [ ] 문서를 업데이트했는가?
- [ ] 커밋 메시지가 규칙을 따르는가?

### 2. PR 템플릿
```markdown
## 변경 사항
<!-- 무엇을 변경했는지 간단히 설명 -->

## 변경 이유
<!-- 왜 이 변경이 필요한지 설명 -->

## 테스트 방법
<!-- 변경사항을 어떻게 테스트할 수 있는지 설명 -->

## 체크리스트
- [ ] 코드 스타일 가이드 준수
- [ ] 테스트 통과
- [ ] 문서 업데이트
```

### 3. 코드 리뷰
- 모든 PR은 최소 1명의 리뷰어 승인이 필요합니다
- 리뷰 코멘트에 건설적으로 응답해주세요
- 필요시 추가 커밋으로 수정사항을 반영해주세요

## 이슈 제보

### 버그 리포트
버그를 발견하면 다음 정보를 포함해 이슈를 생성해주세요:
- 버그 설명
- 재현 방법
- 예상 동작
- 실제 동작
- 환경 정보 (OS, 브라우저, Node/Python 버전 등)
- 스크린샷 (가능한 경우)

### 기능 제안
새로운 기능을 제안할 때:
- 기능의 목적과 가치 설명
- 예상 사용 시나리오
- 가능한 구현 방법 (선택사항)

## 도움이 필요하신가요?

- 📖 [프로젝트 문서](https://github.com/david1005910/SAJU_30days/wiki)
- 💬 [Discussions](https://github.com/david1005910/SAJU_30days/discussions)
- 📧 Email: david1005910@github.com

## 감사의 말

프로젝트에 기여해주시는 모든 분들께 진심으로 감사드립니다! 🎉

여러분의 기여가 사주공학을 더 나은 프로젝트로 만듭니다.