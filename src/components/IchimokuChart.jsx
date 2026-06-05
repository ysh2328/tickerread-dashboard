import { useEffect, useMemo, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { calcIchimoku, calcSMA, toWeekly } from '../lib/indicators';
import { CloudPrimitive } from './CloudPrimitive';

const BARS = 80;

export default function IchimokuChart({ symbol, dailyData, timeframe }) {
  const ref = useRef();
  const data = useMemo(
    () => timeframe === 'W' ? toWeekly(dailyData) : dailyData,
    [dailyData, timeframe]
  );

  useEffect(() => {
    if (!ref.current || data.length < 60) return undefined;
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

    chart.addCandlestickSeries({
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderUpColor: '#ef4444',
      borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    }).setData(data);

    const len = data.length;
    const step = data[len - 1].time - data[len - 2].time;
    const lineOptions = { lastValueVisible: false, priceLineVisible: false };

    chart.addLineSeries({ color: 'transparent', lineWidth: 1, ...lineOptions })
      .setData([{ time: data[len - 1].time + 28 * step, value: data[len - 1].close }]);

    chart.addLineSeries({ color: '#2563eb', lineWidth: 1.5, ...lineOptions }).setData(calcSMA(data, 20));
    chart.addLineSeries({ color: '#dc2626', lineWidth: 1.5, ...lineOptions }).setData(calcSMA(data, 60));
    chart.addLineSeries({ color: '#7c3aed', lineWidth: 1.5, ...lineOptions }).setData(calcSMA(data, 200));

    const ichimoku = calcIchimoku(data);
    chart.addLineSeries({ color: '#dc2626', lineWidth: 1, ...lineOptions }).setData(ichimoku.tenkan);
    chart.addLineSeries({ color: '#2563eb', lineWidth: 1, ...lineOptions }).setData(ichimoku.kijun);
    chart.addLineSeries({ color: '#7c3aed', lineWidth: 1, lineStyle: 2, ...lineOptions }).setData(ichimoku.chikou);

    const senkouA = chart.addLineSeries({ color: '#ef4444', lineWidth: 1, lineStyle: 2, ...lineOptions });
    senkouA.setData(ichimoku.senkouA);
    chart.addLineSeries({ color: '#3b82f6', lineWidth: 1, lineStyle: 2, ...lineOptions }).setData(ichimoku.senkouB);
    senkouA.attachPrimitive(new CloudPrimitive(ichimoku.senkouA, ichimoku.senkouB));

    chart.timeScale().setVisibleRange({
      from: data[Math.max(0, len - 1 - BARS)].time,
      to: data[len - 1].time + 26 * step,
    });

    const onResize = () => {
      if (ref.current) chart.applyOptions({ width: ref.current.clientWidth });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.remove();
    };
  }, [data]);

  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const pct = last && prev ? ((last.close - prev.close) / prev.close * 100) : null;
  const up = pct >= 0;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <div style={{
        padding: '5px 10px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        background: '#fafafa',
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
