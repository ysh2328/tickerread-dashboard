export function toWeekly(daily) {
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

export function calcSMA(data, period) {
  const out = [];
  for (let i = period - 1; i < data.length; i++) {
    let s = 0;
    for (let j = 0; j < period; j++) s += data[i - j].close;
    out.push({ time: data[i].time, value: s / period });
  }
  return out;
}

export function calcIchimoku(data) {
  const hl = (s, e) => {
    if (s < 0) return null;
    let hi = -Infinity;
    let lo = Infinity;
    for (let i = s; i <= e; i++) {
      hi = Math.max(hi, data[i].high);
      lo = Math.min(lo, data[i].low);
    }
    return (hi + lo) / 2;
  };
  const tenkan = [];
  const kijun = [];
  const chikou = [];
  const senkouA = [];
  const senkouB = [];
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

export function getChangePct(data) {
  if (!data || data.length < 2) return null;
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  return (last.close - prev.close) / prev.close * 100;
}

export function heatColor(pct) {
  if (pct == null) return '#eef2f7';
  const alpha = Math.min(0.18 + Math.abs(pct) * 0.09, 0.88);
  return pct >= 0 ? `rgba(220,38,38,${alpha})` : `rgba(37,99,235,${alpha})`;
}
