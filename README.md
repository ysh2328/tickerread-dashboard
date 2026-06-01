# Ichimoku Sector Dashboard

S&P 500 / Russell 2000 섹터를 트리맵으로 보고, 섹터를 클릭하면 해당 섹터 종목을 12개씩 일목균형표 차트 그리드로 보여주는 React 앱입니다.

## 실행

개발 서버:

```bash
npm run dev -- --host 0.0.0.0
```

운영 방식:

```bash
npm run build
PORT=4173 npm start
```

현재 서버에서 테스트:

```text
http://192.168.0.2:4173
```

## 배포 메모

이 앱은 Yahoo Finance 데이터를 `/yahoo/...` 경로로 프록시해서 가져옵니다. 그래서 `dist` 폴더만 정적 호스팅에 올리면 차트 데이터가 동작하지 않습니다.

실제 배포는 다음 중 하나가 필요합니다.

- Node 프로세스를 실행할 수 있는 서버에서 `npm run build` 후 `npm start`
- Nginx/Apache가 정적 파일을 서빙하고 `/yahoo`를 `https://query1.finance.yahoo.com`로 프록시
- Vercel/Netlify Functions 같은 서버리스 프록시 추가
- 안정적인 유료/공식 주식 데이터 API로 교체

Yahoo Finance 엔드포인트는 비공식 사용에 가깝고 IP 단위 `Too Many Requests`가 발생할 수 있습니다. 장기 운영에는 Financial Modeling Prep, Finnhub, Polygon 같은 API로 바꾸는 편이 안전합니다.
