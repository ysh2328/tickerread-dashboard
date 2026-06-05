const STOCK_CACHE = new Map();

export function getCachedStockData(ticker) {
  return STOCK_CACHE.get(ticker);
}

export function hasCachedStockData(ticker) {
  return STOCK_CACHE.has(ticker);
}

export async function fetchYahooData(ticker) {
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
    console.warn(`fetch failed (${ticker}):`, e.message);
    STOCK_CACHE.set(ticker, null);
    return null;
  }
}
