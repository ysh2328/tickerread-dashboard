import { useEffect, useRef, useState, useMemo } from 'react';
import * as echarts from 'echarts';
import { createChart } from 'lightweight-charts';

// ─── S&P 500 섹터별 종목 (섹터당 30~40개, 시가총액 상위) ─────────────────────
const SP500_SECTORS = {
  'Technology': {
    color: '#0ea5e9',
    tickers: [
      'AAPL','MSFT','NVDA','AVGO','ORCL','CRM','AMD','QCOM','TXN','INTC',
      'AMAT','MU','ADI','KLAC','LRCX','NOW','PANW','SNPS','CDNS','MRVL',
      'FTNT','CSCO','IBM','HPQ','HPE','DELL','STX','WDC','KEYS','TERADYNE',
      'FFIV','JNPR','AKAM','CTSH','ACN','INFY','WIT',
    ],
  },
  'Healthcare': {
    color: '#22c55e',
    tickers: [
      'LLY','UNH','JNJ','ABBV','MRK','TMO','ABT','DHR','BMY','AMGN',
      'ISRG','SYK','VRTX','REGN','CI','ELV','HCA','MDT','ZTS','BSX',
      'BDX','EW','IQV','IDXX','ALGN','HOLX','PODD','DXCM','GEHC','RMD',
      'BAX','COO','TECH','MOH','CNC',
    ],
  },
  'Financials': {
    color: '#f59e0b',
    tickers: [
      'BRK-B','JPM','V','MA','BAC','WFC','GS','MS','AXP','BLK',
      'SPGI','CB','MMC','AON','PGR','TRV','MET','PRU','AFL','ALL',
      'USB','PNC','TFC','COF','DFS','SYF','AIG','HIG','WRB','RE',
      'CINF','GL','UNM','AIZ','FG',
    ],
  },
  'Consumer Disc.': {
    color: '#f97316',
    tickers: [
      'AMZN','TSLA','HD','MCD','NKE','LOW','SBUX','TJX','BKNG','CMG',
      'ORLY','AZO','ABNB','MAR','HLT','DHI','LEN','PHM','F','GM',
      'ROST','EBAY','ETSY','BBY','DG','DLTR','KMX','AN','GPC','POOL',
      'SNA','MHK','LEG','TPR','RL',
    ],
  },
  'Communication': {
    color: '#a855f7',
    tickers: [
      'META','GOOGL','GOOG','NFLX','DIS','CMCSA','T','VZ','TMUS','CHTR',
      'EA','TTWO','WBD','IPG','OMC','PARA','LYV','FOXA','FOX','NWS',
      'LUMN','CTL','SIRI','NYT','NWSA',
    ],
  },
  'Industrials': {
    color: '#64748b',
    tickers: [
      'CAT','RTX','HON','UPS','BA','GE','DE','LMT','NOC','GD',
      'EMR','ETN','MMM','ITW','PH','CMI','ROK','FDX','DAL','UAL',
      'LUV','AAL','JBLU','CSX','NSC','UNP','CP','CNI','WAB','GWW',
      'FAST','SWK','IR','RRX','XYL',
    ],
  },
  'Consumer Staples': {
    color: '#84cc16',
    tickers: [
      'WMT','PG','COST','KO','PEP','PM','MO','MDLZ','CL','GIS',
      'KHC','HSY','K','SJM','CPB','HRL','MKC','CAG','CHD','CLX',
      'EL','COTY','SPB','NWL','KDP','STZ','BF-B','TAP','SAM','CELH',
    ],
  },
  'Energy': {
    color: '#ef4444',
    tickers: [
      'XOM','CVX','COP','EOG','SLB','PSX','VLO','MPC','OXY','HAL',
      'BKR','DVN','HES','APA','MRO','OKE','WMB','KMI','ET','EPD',
      'MMP','TRGP','LNG','RRC','EQT','AR','SWN','CQP','MTDR','CIVI',
    ],
  },
  'Utilities': {
    color: '#06b6d4',
    tickers: [
      'NEE','DUK','SO','D','AEP','EXC','SRE','XEL','PCG','ED',
      'WEC','ES','FE','ETR','PPL','CMS','NI','AES','CNP','LNT',
      'AWK','PNW','EVRG','OGE','NWE','AVA','POR','HE','OTTR','SJW',
    ],
  },
  'Real Estate': {
    color: '#ec4899',
    tickers: [
      'AMT','PLD','CCI','EQIX','PSA','O','WELL','DLR','SPG','AVB',
      'EQR','VICI','WY','ARE','MAA','UDR','ESS','CPT','BXP','KIM',
      'REG','FRT','VTR','PEAK','HR','HIW','DEI','PDM','CUZ','EQC',
    ],
  },
  'Materials': {
    color: '#8b5cf6',
    tickers: [
      'LIN','SHW','APD','FCX','NEM','ECL','NUE','VMC','MLM','CF',
      'MOS','ALB','IFF','PPG','EMN','CE','WRK','PKG','IP','AVY',
      'RPM','SEE','SON','GPK','ATR','BALL','SLGN','BERY','GEF','REYN',
    ],
  },
};

// ─── Russell 2000 섹터별 대표 종목 ───────────────────────────────────────────
const RUSSELL_SECTORS = {
  'R2K Financials': {
    color: '#f59e0b',
    tickers: [
      'STBA','TOWN','NBTB','FFIN','BOKF','SFNC','HOMB','FBIZ','FBNC','BHLB',
      'HAFC','HOPE','BANR','CVBF','TRMK','IBCP','CZNC','NWBI','RRBI','UVSP',
    ],
  },
  'R2K Healthcare': {
    color: '#22c55e',
    tickers: [
      'ACAD','INVA','FOLD','RARE','PTGX','CRVS','APLS','RCUS','ARWR','FATE',
      'NVAX','IOVA','MGNX','SRPT','AGEN','BLUE','KPTI','MNKD','OCGN','FREQ',
    ],
  },
  'R2K Industrials': {
    color: '#64748b',
    tickers: [
      'ATKR','ARCB','WERN','HTLD','MRTN','USAK','ODFL','SAIA','ECHO','HUBG',
      'MATX','ULCC','SKYW','MESA','SAVE','HA','ALGT','SUN','GBX','TGI',
    ],
  },
  'R2K Technology': {
    color: '#0ea5e9',
    tickers: [
      'AMBA','COHU','FORM','ICHR','KLIC','LSCC','MCHP','ONTO','PLAB','RMBS',
      'SMTC','SYNA','UCTT','VLDR','ALGM','AEHR','CEVA','DIOD','ERII','FARO',
    ],
  },
  'R2K Consumer': {
    color: '#f97316',
    tickers: [
      'BOOT','CAKE','CBRL','CATO','DIN','EAT','JACK','TXRH','BJRI','DENN',
      'FRED','GDEN','GPMT','HGV','KURA','LOCO','NAVI','PLCE','RICK','SBH',
    ],
  },
  'R2K Energy': {
    color: '#ef4444',
    tickers: [
      'AMPY','BATL','CIVI','DINO','DKL','ESTE','FLNG','GPOR','HNRG','IMVT',
      'KINS','LONE','MGY','NGL','PAGP','PDCE','REX','SM','SBOW','TALO',
    ],
  },
  'R2K Real Estate': {
    color: '#ec4899',
    tickers: [
      'AHH','AIV','ALEX','BRT','CLPR','CSR','CUBE','EFC','ELME','EPR',
      'FCPT','FOR','GTY','IIPR','INN','JBGS','KRG','LAND','LTC','NXRT',
    ],
  },
  'R2K Materials': {
    color: '#8b5cf6',
    tickers: [
      'ASIX','BCPC','CATO','CLW','GEVO','HWKN','IOSP','KWR','LTHM','MTRN',
      'MYNZ','NGVT','OMN','PRLB','RYAM','SXC','TREC','USLM','WDFC','ZEUS',
    ],
  },
};

const CHARTS_PER_PAGE = 12;
const STOCK_CACHE = new Map();

// ─── Yahoo Finance fetch ──────────────────────────────────────────────────────
async function fetchYahooData(ticker) {
  if (STOCK_CACHE.has(ticker)) return STOCK_CACHE.get(ticker);
  try {
    const res = await fetch(
      `/yahoo/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5y`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const r = json?.chart?.result?.[0];
    if (!r?.timestamp) return [];
    const { timestamp: ts, indicators: { quote: [q] } } = r;
    const out = [];
    const seen = new Set();
    for (let i = 0; i < ts.length; i++) {
      if (seen.has(ts[i])) continue;
      if (q.open[i] != null && q.high[i] != null && q.low[i] != null && q.close[i] != null) {
        out.push({ time: ts[i], open: q.open[i], high: q.high[i], low: q.low[i], close: q.close[i] });
        seen.add(ts[i]);
      }
    }
    STOCK_CACHE.set(ticker, out);
    return out;
  } catch (e) {
    console.warn(`fetch 실패 (${ticker}):`, e.message);
    STOCK_CACHE.set(ticker, null);
    return null;
  }
}

// ─── 주봉 변환 ────────────────────────────────────────────────────────────────
function toWeekly(daily) {
  const map = new Map();
  for (const d of daily) {
    const date = new Date(d.time * 1000);
    const dow = date.getUTCDay();
    const diff = date.getUTCDate() - dow + (dow === 0 ? -6 : 1);
    const mon = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff) / 1000;
    if (!map.has(mon)) {
      map.set(mon, { time: mon, open: d.open, high: d.high, low: d.low, close: d.close });
    } else {
      const w = map.get(mon);
      w.high = Math.max(w.high, d.high);
      w.low = Math.min(w.low, d.low);
      w.close = d.close;
    }
  }
  return [...map.values()].sort((a, b) => a.time - b.time);
}

// ─── 지표 계산 ────────────────────────────────────────────────────────────────
function calcSMA(data, period) {
  const out = [];
  for (let i = period - 1; i < data.length; i++) {
    let s = 0;
    for (let j = 0; j < period; j++) s += data[i - j].close;
    out.push({ time: data[i].time, value: s / period });
  }
  return out;
}

function calcIchimoku(data) {
  const hl = (s, e) => {
    if (s < 0) return null;
    let hi = -Infinity, lo = Infinity;
    for (let i = s; i <= e; i++) {
      hi = Math.max(hi, data[i].high);
      lo = Math.min(lo, data[i].low);
    }
    return (hi + lo) / 2;
  };
  const tenkan = [], kijun = [], chikou = [], senkouA = [], senkouB = [];
  const step = data.length > 1 ? data[1].time - data[0].time : 86400;
  for (let i = 0; i < data.length; i++) {
    const t = data[i].time;
    const tV = hl(i - 8, i);
    const kV = hl(i - 25, i);
    const sB = hl(i - 51, i);
    if (tV != null) tenkan.push({ time: t, value: tV });
    if (kV != null) kijun.push({ time: t, value: kV });
    chikou.push({ time: t - 26 * step, value: data[i].close });
    if (tV != null && kV != null) senkouA.push({ time: t + 26 * step, value: (tV + kV) / 2 });
    if (sB != null) senkouB.push({ time: t + 26 * step, value: sB });
  }
  const sort = arr => arr.sort((a, b) => a.time - b.time);
  return { tenkan: sort(tenkan), kijun: sort(kijun), chikou: sort(chikou), senkouA: sort(senkouA), senkouB: sort(senkouB) };
}

// ─── 개별 차트 (흰 배경 + 구름대 색칠) ───────────────────────────────────────
const BARS = 80;

// 구름대 색칠 Primitive ─ 올바른 paneViews 3단계 구조
class CloudRenderer {
  constructor(primitive) { this._p = primitive; }
  draw(target) {
    target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr }) => {
      const { _chart: chart, _series: series, _sA: sA, _sB: sB } = this._p;
      if (!chart || !series) return;
      const ts = chart.timeScale();
      const mapA = new Map(sA.map(d => [d.time, d.value]));
      const mapB = new Map(sB.map(d => [d.time, d.value]));
      const times = [...new Set([...mapA.keys(), ...mapB.keys()])]
        .filter(t => mapA.has(t) && mapB.has(t)).sort((a, b) => a - b);
      if (times.length < 2) return;
      for (let i = 0; i < times.length - 1; i++) {
        const t1 = times[i], t2 = times[i + 1];
        const aV1 = mapA.get(t1), bV1 = mapB.get(t1);
        const aV2 = mapA.get(t2), bV2 = mapB.get(t2);
        const x1 = ts.timeToCoordinate(t1), x2 = ts.timeToCoordinate(t2);
        const yA1 = series.priceToCoordinate(aV1), yB1 = series.priceToCoordinate(bV1);
        const yA2 = series.priceToCoordinate(aV2), yB2 = series.priceToCoordinate(bV2);
        if ([x1,x2,yA1,yB1,yA2,yB2].some(v => v == null)) continue;
        const aboveStart = aV1 >= bV1, aboveEnd = aV2 >= bV2;
        const color = (aboveStart && aboveEnd)   ? 'rgba(220,38,38,0.2)'
                    : (!aboveStart && !aboveEnd)  ? 'rgba(37,99,235,0.2)' : null;
        if (!color) continue;
        ctx.beginPath();
        ctx.moveTo(x1 * hpr, yA1 * vpr);
        ctx.lineTo(x2 * hpr, yA2 * vpr);
        ctx.lineTo(x2 * hpr, yB2 * vpr);
        ctx.lineTo(x1 * hpr, yB1 * vpr);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }
    });
  }
}

class CloudPaneView {
  constructor(primitive) { this._renderer = new CloudRenderer(primitive); }
  renderer() { return this._renderer; }
  zOrder() { return 'bottom'; } // 캔들 아래에 그리기
}

class CloudPrimitive {
  constructor(sA, sB) {
    this._sA = sA; this._sB = sB;
    this._chart = null; this._series = null;
    this._paneViews = [new CloudPaneView(this)];
  }
  attached({ chart, series }) { this._chart = chart; this._series = series; }
  detached() { this._chart = null; this._series = null; }
  updateAllViews() {}
  paneViews() { return this._paneViews; }
}

function IchimokuChart({ symbol, dailyData, timeframe }) {
  const ref = useRef();
  const data = useMemo(
    () => timeframe === 'W' ? toWeekly(dailyData) : dailyData,
    [dailyData, timeframe]
  );

  useEffect(() => {
    if (!ref.current || data.length < 60) return;
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: ref.current.clientHeight,
      layout: { background: { color: '#ffffff' }, textColor: '#374151' },
      grid: { vertLines: { color: '#f1f5f9' }, horzLines: { color: '#f1f5f9' } },
      timeScale: { timeVisible: false, borderColor: '#e2e8f0', rightOffset: 2 },
      rightPriceScale: { borderColor: '#e2e8f0' },
      crosshair: { mode: 1 },
      handleScroll: true,
      handleScale: true,
    });

    // 캔들 (빨강=상승, 파랑=하락)
    chart.addCandlestickSeries({
      upColor: '#ef4444', downColor: '#3b82f6',
      borderUpColor: '#ef4444', borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444', wickDownColor: '#3b82f6',
    }).setData(data);

    const len = data.length;
    const step = data[len - 1].time - data[len - 2].time;
    const lo = { lastValueVisible: false, priceLineVisible: false };

    // 미래 앵커
    chart.addLineSeries({ color: 'transparent', lineWidth: 1, ...lo })
      .setData([{ time: data[len - 1].time + 28 * step, value: data[len - 1].close }]);

    // 이동평균 (사진 색상: 파랑=20, 빨강=60, 보라=200)
    chart.addLineSeries({ color: '#2563eb', lineWidth: 1.5, ...lo }).setData(calcSMA(data, 20));
    chart.addLineSeries({ color: '#dc2626', lineWidth: 1.5, ...lo }).setData(calcSMA(data, 60));
    chart.addLineSeries({ color: '#7c3aed', lineWidth: 1.5, ...lo }).setData(calcSMA(data, 200));

    // 일목균형표
    const ich = calcIchimoku(data);
    chart.addLineSeries({ color: '#dc2626', lineWidth: 1, ...lo }).setData(ich.tenkan);   // 전환선 빨강
    chart.addLineSeries({ color: '#2563eb', lineWidth: 1, ...lo }).setData(ich.kijun);    // 기준선 파랑
    chart.addLineSeries({ color: '#7c3aed', lineWidth: 1, lineStyle: 2, ...lo }).setData(ich.chikou); // 후행 보라

    // 선행스팬 + 구름대 색칠
    const sAS = chart.addLineSeries({ color: '#ef4444', lineWidth: 1, lineStyle: 2, ...lo });
    sAS.setData(ich.senkouA);
    chart.addLineSeries({ color: '#3b82f6', lineWidth: 1, lineStyle: 2, ...lo }).setData(ich.senkouB);
    sAS.attachPrimitive(new CloudPrimitive(ich.senkouA, ich.senkouB));

    // 화면 범위 고정
    chart.timeScale().setVisibleRange({
      from: data[Math.max(0, len - 1 - BARS)].time,
      to: data[len - 1].time + 26 * step,
    });

    const onResize = () => {
      if (ref.current) chart.applyOptions({ width: ref.current.clientWidth });
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.remove(); };
  }, [data]);

  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const pct = last && prev ? ((last.close - prev.close) / prev.close * 100) : null;
  const up = pct >= 0;

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{
        padding: '5px 10px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0, background: '#fafafa',
      }}>
        <span style={{ fontWeight: '700', fontSize: '12px', color: '#1e293b' }}>{symbol}</span>
        {pct != null && (
          <span style={{ fontSize: '11px', fontWeight: '600', color: up ? '#dc2626' : '#2563eb' }}>
            {last.close.toFixed(2)} {up ? '▲' : '▼'}{Math.abs(pct).toFixed(2)}%
          </span>
        )}
      </div>
      <div ref={ref} style={{ flex: 1, minHeight: 0 }} />
    </div>
  );
}

function getChangePct(data) {
  if (!data || data.length < 2) return null;
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  return (last.close - prev.close) / prev.close * 100;
}

function heatColor(pct) {
  if (pct == null) return '#eef2f7';
  const alpha = Math.min(0.18 + Math.abs(pct) * 0.09, 0.88);
  return pct >= 0 ? `rgba(220,38,38,${alpha})` : `rgba(37,99,235,${alpha})`;
}

function SectorHeatmap({ sectors, stockDataMap, sectorStats, onSelect }) {
  const ref = useRef(null);

  const treeData = useMemo(() => Object.entries(sectors).map(([name, { tickers }]) => {
    const children = tickers.map((ticker, index) => {
      const pct = getChangePct(stockDataMap[ticker]);
      const weight = Math.max(1, tickers.length - index);
      return {
        name: ticker,
        value: weight,
        sector: name,
        pct,
        itemStyle: { color: heatColor(pct), borderColor: '#ffffff', borderWidth: 1 },
        label: {
          color: pct == null ? '#94a3b8' : '#ffffff',
          formatter: pct == null ? ticker : `${ticker}\n${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
        },
      };
    });
    const pct = sectorStats[name]?.avgPct ?? null;
    return {
      name,
      sector: name,
      value: children.reduce((sum, item) => sum + item.value, 0),
      pct,
      children,
      itemStyle: { borderColor: '#ffffff', borderWidth: 3, gapWidth: 3 },
    };
  }), [sectors, stockDataMap, sectorStats]);

  useEffect(() => {
    if (!ref.current) return undefined;
    const chart = echarts.init(ref.current, null, { renderer: 'canvas' });
    chart.setOption({
      animationDurationUpdate: 250,
      tooltip: {
        confine: true,
        formatter: (info) => {
          const pct = info.data?.pct;
          const loaded = sectorStats[info.data?.sector]?.loaded ?? 0;
          const total = sectors[info.data?.sector]?.tickers.length ?? 0;
          const change = pct == null ? '로딩 중' : `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
          return `<b>${info.name}</b><br/>${change}<br/>${loaded}/${total} loaded`;
        },
      },
      series: [{
        type: 'treemap',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        data: treeData,
        top: 8,
        bottom: 8,
        left: 8,
        right: 8,
        visibleMin: 8,
        upperLabel: {
          show: true,
          height: 24,
          color: '#0f172a',
          fontSize: 12,
          fontWeight: 800,
          backgroundColor: 'rgba(255,255,255,0.82)',
        },
        label: {
          show: true,
          fontSize: 11,
          fontWeight: 800,
          lineHeight: 14,
          overflow: 'truncate',
        },
        levels: [
          { itemStyle: { borderColor: '#e2e8f0', borderWidth: 1, gapWidth: 4 } },
          { itemStyle: { borderColor: '#ffffff', borderWidth: 2, gapWidth: 2 } },
        ],
      }],
    });
    chart.on('click', (params) => {
      const sector = params.data?.sector;
      if (sector) onSelect(sector);
    });
    const resize = new ResizeObserver(() => chart.resize());
    resize.observe(ref.current);
    return () => {
      resize.disconnect();
      chart.dispose();
    };
  }, [treeData, sectorStats, sectors, onSelect]);

  return (
    <div style={{ padding: '10px', height: 'calc(100vh - 66px)', minHeight: '620px' }}>
      <div
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
          background: '#fff',
          border: '1px solid #e2e8f0',
        }}
      />
    </div>
  );
}

// ─── 섹터 상세 차트 그리드 ────────────────────────────────────────────────────
function SectorDetail({ sectorName, sectors, stockDataMap, timeframe, setTimeframe, onBack }) {
  const [page, setPage] = useState(0);
  const { color, tickers } = sectors[sectorName];
  const totalPages = Math.ceil(tickers.length / CHARTS_PER_PAGE);
  const pageTickers = tickers.slice(page * CHARTS_PER_PAGE, (page + 1) * CHARTS_PER_PAGE);

  return (
    <div style={{ height: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 컨트롤 바 */}
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: '12px',
        background: '#fff', flexShrink: 0, flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: '1px solid #e2e8f0', color: '#64748b',
          padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
        }}>← 섹터맵</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{sectorName}</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{tickers.length}개 종목</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {['D', 'W'].map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} style={{
              padding: '5px 14px', cursor: 'pointer', border: `1px solid ${timeframe === tf ? color : '#e2e8f0'}`,
              borderRadius: '5px', fontWeight: '700', fontSize: '11px',
              background: timeframe === tf ? color : '#fff',
              color: timeframe === tf ? '#fff' : '#64748b',
              transition: 'all 0.15s',
            }}>
              {tf === 'D' ? '일봉' : '주봉'}
            </button>
          ))}

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '8px' }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{
                background: '#f1f5f9', border: 'none', borderRadius: '5px',
                color: page === 0 ? '#cbd5e1' : '#374151',
                padding: '5px 10px', cursor: page === 0 ? 'default' : 'pointer', fontSize: '14px',
              }}>‹</button>
              <span style={{ fontSize: '11px', color: '#94a3b8', padding: '0 4px' }}>{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{
                background: '#f1f5f9', border: 'none', borderRadius: '5px',
                color: page === totalPages - 1 ? '#cbd5e1' : '#374151',
                padding: '5px 10px', cursor: page === totalPages - 1 ? 'default' : 'pointer', fontSize: '14px',
              }}>›</button>
            </div>
          )}
        </div>
      </div>

      {/* 차트 그리드 4x3 */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '6px', padding: '8px', minHeight: 0,
      }}>
        {pageTickers.map(ticker => {
          const d = stockDataMap[ticker];
          if (d && d.length >= 60) {
            return <IchimokuChart key={ticker} symbol={ticker} dailyData={d} timeframe={timeframe} />;
          }
          return (
            <div key={ticker} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{ticker}</div>
              <div style={{ fontSize: '10px', color: '#cbd5e1' }}>
                {d === undefined ? '로딩 중...' : d === null ? '불러오기 실패' : '데이터 부족'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 데이터 로더 훅 ───────────────────────────────────────────────────────────
function useStockData(sectors) {
  const [stockDataMap, setStockDataMap] = useState(() => {
    const initial = {};
    for (const ticker of new Set(Object.values(sectors).flatMap(s => s.tickers))) {
      if (STOCK_CACHE.has(ticker)) initial[ticker] = STOCK_CACHE.get(ticker);
    }
    return initial;
  });
  const [sectorStats, setSectorStats] = useState({});

  useEffect(() => {
    const allTickers = [...new Set(Object.values(sectors).flatMap(s => s.tickers))];
    let cancelled = false;
    const BATCH = 4;

    const updateStats = (map) => {
      const ns = {};
      for (const [sName, { tickers }] of Object.entries(sectors)) {
        let sum = 0, count = 0, loaded = 0;
        for (const tk of tickers) {
          const d = map[tk];
          if (d && d.length >= 2) {
            loaded++;
            sum += (d[d.length - 1].close - d[d.length - 2].close) / d[d.length - 2].close * 100;
            count++;
          }
        }
        ns[sName] = { avgPct: count > 0 ? sum / count : null, loaded };
      }
      setSectorStats(ns);
    };

    const load = async () => {
      setStockDataMap(prev => {
        const next = {};
        for (const ticker of allTickers) {
          if (prev[ticker] !== undefined) next[ticker] = prev[ticker];
          else if (STOCK_CACHE.has(ticker)) next[ticker] = STOCK_CACHE.get(ticker);
        }
        updateStats(next);
        return next;
      });
      for (let i = 0; i < allTickers.length; i += BATCH) {
        if (cancelled) break;
        const batch = allTickers.slice(i, i + BATCH);
        const missing = batch.filter(t => !STOCK_CACHE.has(t));
        if (missing.length === 0) continue;
        const results = await Promise.all(missing.map(t => fetchYahooData(t)));
        if (cancelled) break;
        setStockDataMap(prev => {
          const next = { ...prev };
          missing.forEach((t, idx) => { next[t] = results[idx]; });
          updateStats(next);
          return next;
        });
        if (i + BATCH < allTickers.length) await new Promise(r => setTimeout(r, 150));
      }
    };

    load();
    return () => { cancelled = true; };
  }, [sectors]);

  return { stockDataMap, sectorStats };
}

// ─── 메인 App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('sp500');           // 'sp500' | 'russell'
  const [timeframe, setTimeframe] = useState('W');
  const [selectedSector, setSelectedSector] = useState(null);

  const sectors = tab === 'sp500' ? SP500_SECTORS : RUSSELL_SECTORS;

  const { stockDataMap, sectorStats } = useStockData(sectors);

  const allTickers = [...new Set(Object.values(sectors).flatMap(s => s.tickers))];
  const totalLoaded = allTickers.filter(t => stockDataMap[t] && stockDataMap[t].length > 0).length;

  if (selectedSector && sectors[selectedSector]) {
    return (
      <SectorDetail
        sectorName={selectedSector}
        sectors={sectors}
        stockDataMap={stockDataMap}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        onBack={() => setSelectedSector(null)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 헤더 */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
      }}>
        <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
          Ichimoku Sector Dashboard
        </h1>

        {/* S&P 500 / Russell 탭 */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px', gap: '2px' }}>
          {[['sp500', 'S&P 500'], ['russell', 'Russell 2000']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setSelectedSector(null); }} style={{
              padding: '6px 16px', cursor: 'pointer', border: 'none', borderRadius: '6px',
              fontWeight: '700', fontSize: '12px',
              background: tab === key ? '#fff' : 'transparent',
              color: tab === key ? '#0f172a' : '#94a3b8',
              boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* 일봉/주봉 */}
          {['D', 'W'].map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} style={{
              padding: '6px 16px', cursor: 'pointer',
              border: `1px solid ${timeframe === tf ? '#2563eb' : '#e2e8f0'}`,
              borderRadius: '6px', fontWeight: '700', fontSize: '11px',
              background: timeframe === tf ? '#2563eb' : '#fff',
              color: timeframe === tf ? '#fff' : '#64748b',
              transition: 'all 0.15s',
            }}>
              {tf === 'D' ? '일봉' : '주봉'}
            </button>
          ))}
          <span style={{ fontSize: '10px', color: '#cbd5e1', marginLeft: '4px' }}>
            {totalLoaded}/{allTickers.length} loaded
          </span>
        </div>
      </div>

      <SectorHeatmap
        sectors={sectors}
        stockDataMap={stockDataMap}
        sectorStats={sectorStats}
        onSelect={setSelectedSector}
      />
    </div>
  );
}
