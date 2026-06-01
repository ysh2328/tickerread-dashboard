# 배포 핸드오프 문서 (tickerread.com / Hostinger)

> 이 문서는 **다른 AI 또는 사람이 이어서** 이 앱을 실제 도메인에 올릴 수 있도록 작성된 안내서입니다.
> 작성 시점 기준으로 코드/호스팅 상태를 확인해서 정리했습니다. 사용자는 비개발자에 가깝다고 가정하고, 어려운 용어는 풀어서 안내해 주세요.

---

## 0. 한 줄 요약

React + Vite로 만든 **일목균형표 섹터 대시보드**다. 야후 파이낸스 데이터를 `/yahoo` 경로로 프록시해서 가져오기 때문에 **단순 정적 호스팅으로는 안 되고, Node 서버(server.js)가 같이 돌아야 한다.** 다행히 사용자가 가진 **Hostinger Business 플랜은 Node.js 앱을 지원**하므로, 코드 수정 없이 배포 가능하다.

---

## 1. 앱 구조 (지금 상태, 코드 수정 불필요)

- 프론트엔드: React 19 + Vite 5, 빌드 결과물은 `dist/` 폴더에 생성됨
- 데이터 호출: `src/App.jsx`에서 상대경로로 요청
  ```js
  fetch(`/yahoo/v8/finance/chart/${ticker}?interval=1d&range=5y`)
  ```
- 운영 서버: `server.js` (Node 내장 http 서버)
  - `dist/` 정적 파일 서빙
  - 앱에서 쓰는 `/yahoo/v8/finance/chart/:ticker` 요청만 `https://query1.finance.yahoo.com`로 프록시
  - 같은 종목 데이터는 서버에서 5분간 캐시해 야후 API 호출 수를 줄임
  - `process.env.PORT`(없으면 4173), `process.env.HOST`(없으면 0.0.0.0) 사용 → **Hostinger가 주는 PORT를 자동으로 따름 (수정 불필요)**
- 핵심 스크립트(`package.json`)
  - `npm run build` → `dist/` 생성
  - `npm start` → `node server.js` (운영 서버 실행)
- **중요 제약**
  - `server.js`는 Node 전역 `fetch`를 사용 → **Node 18 이상 필수** (Hostinger에서 18/20/22/24 선택 가능, 20.x 권장)
  - 정적 파일만 올리면 `/yahoo` 프록시가 없어서 **차트 데이터가 안 나온다.** 반드시 server.js가 돌아가는 "백엔드(서버형) Node 앱"으로 배포해야 한다.

---

## 2. 현재 호스팅 정보 (사용자 제공)

- 상품: **Hostinger Business Web Hosting** (Node.js 앱 지원 확인됨)
- 도메인: **tickerread.com** (상태: 활성, 만료 2030-04-29)
- 사용자의 원래 의도: 이 도메인에 **워드프레스 자동화 블로그**를 만들 계획

### ⚠️ 가장 먼저 결정할 것 — 도메인 충돌
사용자는 `tickerread.com`에 **워드프레스**를 쓰려고 한다. 그런데 Hostinger에서 Node.js 앱은 "새 웹사이트"로 추가해야 하고, 한 도메인에 워드프레스와 Node 앱을 동시에 루트로 두기 어렵다.

**권장:** 대시보드는 **서브도메인**에 올린다.
- 예: `app.tickerread.com` 또는 `dashboard.tickerread.com` → 대시보드(Node 앱)
- `tickerread.com` (루트) → 워드프레스 블로그
- 서브도메인 생성: hPanel → Domains → Subdomains 에서 먼저 만든 뒤, Node 앱 추가 시 그 서브도메인을 지정.

> 사용자에게 "블로그용 주소와 대시보드 주소를 나눌지" 먼저 물어보고 진행할 것.

---

## 3. 배포 절차 A — ZIP 파일 업로드 (GitHub 없이, 가장 쉬움)

### 3-1. 올릴 ZIP 만들기
프로젝트 폴더에서 **아래 항목만** 압축한다 (node_modules는 절대 넣지 말 것 — Hostinger가 알아서 설치함):

포함:
```
src/  public/  index.html  package.json  package-lock.json  vite.config.js  server.js  eslint.config.js
```
제외:
```
node_modules/   node_modules.winbak/   dist/   .git/
```
> `dist/`는 Hostinger가 빌드 때 다시 만들므로 넣지 않아도 됨.

### 3-2. hPanel에서 배포
1. hPanel 로그인 → 왼쪽 **Websites** → **Add Website**
2. **Node.js Apps** 선택
3. **Upload your website files** 선택 → 위에서 만든 `.zip` 업로드
4. **Build settings(빌드 설정)** 화면에서 값 입력 (자동 감지가 틀릴 수 있으니 아래로 맞춘다):
   - **Framework type(프레임워크):** `Other` 선택 (Vite 프론트 + 커스텀 Node 서버라 자동감지로는 정적 처리될 수 있음 → 반드시 서버형으로)
   - **Build command:** `npm run build`
   - **Output directory(출력 폴더):** `dist`
   - **Entry file(시작 파일):** `server.js`  ← 이게 있어야 `/yahoo` 프록시가 동작함
   - **Node 버전:** `20.x` (또는 18/22)
5. 배포할 도메인/서브도메인을 위 2번 결정에 맞게 지정
6. **Deploy** 클릭 → 빌드 로그가 성공으로 끝나는지 확인

---

## 4. 배포 절차 B — GitHub 연동 (자동 배포, 선택)

코드를 GitHub 저장소에 올려두면 push 할 때마다 자동 재배포된다.
1. GitHub에 이 프로젝트를 올린다 (`.gitignore`에 node_modules, dist 포함되어 있는지 확인)
2. hPanel → Websites → Add Website → **Node.js Apps** → **Import Git Repository**
3. GitHub 권한 **Authorize** → 저장소 선택
4. **Build settings**는 위 3-2의 4번과 동일하게 (Other / build: `npm run build` / output: `dist` / entry: `server.js` / Node 20.x)
5. **Deploy**

---

## 5. 배포 후 확인

1. 배포된 주소(예: `https://app.tickerread.com`) 접속 → 트리맵 화면이 뜨는지
2. 섹터 클릭 → **차트가 그려지는지** (이게 되면 `/yahoo` 프록시가 정상)
3. 차트가 안 그려지면:
   - hPanel → Node 앱 대시보드 → **Deployment log** 확인
   - Entry file이 `server.js`로 되어 있는지 재확인 (정적으로 배포되면 프록시가 없어 데이터 안 나옴)
   - 서버형 앱이면 대시보드에 **Restart** 버튼이 보임 → 한 번 재시작

---

## 6. 알려진 주의사항 (사용자에게 꼭 설명)

1. **야후 파이낸스는 비공식 데이터다.** IP 단위로 `Too Many Requests`(429)가 날 수 있어, 방문자가 많아지면 차트가 간헐적으로 안 뜰 수 있음. 장기 운영하려면:
   - 현재 들어간 5분 캐시의 보관 시간 조정, 또는
   - Financial Modeling Prep / Finnhub / Polygon 같은 **정식 유료 API로 교체** 검토.
2. **이 서버에는 로그인/인증이 없다.** 프록시는 차트 API와 고정 쿼리만 허용하도록 제한했지만, 공개되면 누구나 대시보드와 `/yahoo` 프록시를 호출할 수 있다. 방문자가 많아지면 인증 또는 요청 제한을 추가할 것.
3. **HTTPS**는 Hostinger가 도메인에 무료 SSL을 붙여주므로 보통 자동 처리됨. 안 되면 hPanel → Security/SSL에서 발급.
4. Node 앱 빌드 파일은 `public_html` 바깥의 `/home/{user}/domains/{domain}/nodejs`에 생성되고, `public_html/.htaccess`가 라우팅을 처리한다. 403 에러가 나면 재배포하면 `.htaccess`가 다시 생성됨.

---

## 7. 다른 AI를 위한 메모

- 사용자는 비개발자에 가깝다. **클릭 단위로, 용어 풀어서** 안내할 것. 한 번에 한 단계씩.
- **코드는 수정할 필요가 거의 없다.** `server.js`가 이미 `process.env.PORT`를 따르고 정적+프록시를 모두 처리한다.
- 막히면 가장 흔한 원인은 **(a) 정적 앱으로 배포되어 server.js가 안 돌아감, (b) Node 18 미만, (c) 도메인이 워드프레스와 충돌** 세 가지다.
- 파일 위치: 프로젝트 루트 `/home/ysh/project/dashboard-app` (참고용 — 사용자의 실제 작업 PC 경로는 다를 수 있음).
- 관련 공식 문서: Hostinger "How to add a Node.js Web App in Hostinger" (hPanel → Node.js).
