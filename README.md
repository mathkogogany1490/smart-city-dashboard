# 스마트시정 실시간 대시보드

시흥시 스마트시정 화면을 React, FastAPI, Postgres로 나눈 프로젝트입니다.

## Docker 실행

프로젝트 루트에서 아래를 실행합니다. Nginx가 화면을 제공하고 `/api`와 `/ws`를 FastAPI로 넘깁니다. API 컨테이너는 Compose 안의 `postgres`로 접속합니다.

```bash
docker compose up --build -d
```

브라우저 주소는 `http://127.0.0.1:8088` 입니다. API 문서는 `http://127.0.0.1:8088/docs` 입니다. 이 컴퓨터의 80, 8080, 5433 포트는 다른 프로젝트가 쓰고 있어서 화면은 8088, API 직접 접속은 8020, DB 호스트 포트는 5434입니다.

```bash
docker compose logs -f backend
docker compose down
```

## 로컬 실행

Postgres가 `127.0.0.1:5432`에 떠 있어야 합니다. 데이터베이스 이름은 `smart_city`입니다.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8010
```

새 터미널을 프로젝트 루트에서 열고:

```bash
cd frontend
npm install
npm run dev
```

브라우저 주소는 `http://127.0.0.1:5173` 입니다. API 문서는 `http://127.0.0.1:8010/docs` 입니다. 이 컴퓨터의 8000번 포트는 다른 서버가 쓰고 있어서, `.env`의 API 주소는 8010으로 맞춰 두었습니다. 포트를 바꾸면 `VITE_API_BASE_URL`과 `VITE_WS_URL`도 같이 바꿔야 합니다.

## 환경 변수

루트 `.env` 한 파일을 서버와 화면이 함께 읽습니다.

- `DATABASE_URL` Postgres 접속 주소
- `VITE_API_BASE_URL` 화면이 호출할 API 주소
- `VITE_WS_URL` 실시간 소켓 주소
- `WEATHER_API_KEY` 비어 있으면 Open-Meteo로 시흥 날씨를 가져옵니다.
- `YOUTUBE_API_KEY` 비어 있으면 DB에 넣어 둔 영상 목록을 보여 줍니다.
- `MOLIT_API_KEY` 부동산 실거래 연동용 자리입니다. 비어 있으면 인구밀도를 보여 줍니다.

## 구조

```text
frontend/src
  api        서버 호출
  query      TanStack Query 훅
  pages      화면 조합
  components 카드, 지도, 차트

backend/app
  models        테이블
  schemas       응답 형식
  repositories  조회와 저장
  services      집계, 날씨, 실시간 민원
  web           HTTP 라우트와 웹소켓
```

서버가 켜져 있는 동안 몇 초마다 민원 한 건이 들어오고, 화면 숫자가 같이 바뀝니다.

기초 데이터를 다시 넣으려면 API 서버를 멈춘 뒤, `backend` 폴더에서 `python -m app.seed`를 실행합니다. 이 명령은 `smart_city` 테이블을 비우고 다시 채웁니다.
