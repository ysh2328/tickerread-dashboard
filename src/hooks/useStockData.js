import { useEffect, useState } from 'react';
import { fetchYahooData, getCachedStockData, hasCachedStockData } from '../lib/yahoo';

export function useStockData(sectors) {
  const [stockDataMap, setStockDataMap] = useState(() => {
    const initial = {};
    for (const ticker of new Set(Object.values(sectors).flatMap(s => s.tickers))) {
      if (hasCachedStockData(ticker)) initial[ticker] = getCachedStockData(ticker);
    }
    return initial;
  });
  const [sectorStats, setSectorStats] = useState({});

  useEffect(() => {
    const allTickers = [...new Set(Object.values(sectors).flatMap(s => s.tickers))];
    let cancelled = false;
    const batchSize = 4;

    const updateStats = (map) => {
      const nextStats = {};
      for (const [sectorName, { tickers }] of Object.entries(sectors)) {
        let sum = 0;
        let count = 0;
        let loaded = 0;
        for (const ticker of tickers) {
          const data = map[ticker];
          if (data && data.length >= 2) {
            loaded++;
            sum += (data[data.length - 1].close - data[data.length - 2].close) / data[data.length - 2].close * 100;
            count++;
          }
        }
        nextStats[sectorName] = { avgPct: count > 0 ? sum / count : null, loaded };
      }
      setSectorStats(nextStats);
    };

    const load = async () => {
      setStockDataMap(prev => {
        const next = {};
        for (const ticker of allTickers) {
          if (prev[ticker] !== undefined) next[ticker] = prev[ticker];
          else if (hasCachedStockData(ticker)) next[ticker] = getCachedStockData(ticker);
        }
        updateStats(next);
        return next;
      });

      for (let i = 0; i < allTickers.length; i += batchSize) {
        if (cancelled) break;
        const batch = allTickers.slice(i, i + batchSize);
        const missing = batch.filter(ticker => !hasCachedStockData(ticker));
        if (missing.length === 0) continue;
        const results = await Promise.all(missing.map(ticker => fetchYahooData(ticker)));
        if (cancelled) break;
        setStockDataMap(prev => {
          const next = { ...prev };
          missing.forEach((ticker, index) => {
            next[ticker] = results[index];
          });
          updateStats(next);
          return next;
        });
        if (i + batchSize < allTickers.length) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [sectors]);

  return { stockDataMap, sectorStats };
}
