import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts/core';
import { TreemapChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { getChangePct, heatColor } from '../lib/indicators';

echarts.use([TreemapChart, TooltipComponent, CanvasRenderer]);

export default function SectorHeatmap({ sectors, stockDataMap, sectorStats, onSelect }) {
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
