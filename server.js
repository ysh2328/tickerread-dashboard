import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '0.0.0.0';
const root = resolve('dist');
const yahooCache = new Map();
const yahooCacheTtlMs = 5 * 60 * 1000;
const yahooCacheMaxEntries = Number(process.env.YAHOO_CACHE_MAX_ENTRIES || 500);
const yahooTimeoutMs = Number(process.env.YAHOO_TIMEOUT_MS || 12000);
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 900);
const clientHits = new Map();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function clientKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function isRateLimited(req) {
  if (rateLimitMax <= 0) return false;
  const now = Date.now();
  const key = clientKey(req);
  const bucket = clientHits.get(key) || [];
  const recent = bucket.filter(ts => now - ts < rateLimitWindowMs);
  recent.push(now);
  clientHits.set(key, recent);
  if (clientHits.size > 1000) {
    for (const [client, hits] of clientHits) {
      if (!hits.some(ts => now - ts < rateLimitWindowMs)) clientHits.delete(client);
    }
  }
  return recent.length > rateLimitMax;
}

function getYahooCache(target) {
  const cached = yahooCache.get(target);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    yahooCache.delete(target);
    return null;
  }
  yahooCache.delete(target);
  yahooCache.set(target, cached);
  return cached;
}

function setYahooCache(target, value) {
  if (yahooCacheMaxEntries <= 0) return;
  if (yahooCache.has(target)) yahooCache.delete(target);
  while (yahooCache.size >= yahooCacheMaxEntries) {
    const oldest = yahooCache.keys().next().value;
    if (!oldest) break;
    yahooCache.delete(oldest);
  }
  yahooCache.set(target, value);
}

async function proxyYahoo(req, res, url) {
  if (isRateLimited(req)) {
    send(res, 429, JSON.stringify({ error: 'Too many requests' }), {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    });
    return;
  }

  const match = url.pathname.match(/^\/yahoo\/v8\/finance\/chart\/([^/]+)$/);
  if (!match || url.searchParams.get('interval') !== '1d' || url.searchParams.get('range') !== '5y') {
    send(res, 400, JSON.stringify({ error: 'Unsupported Yahoo request' }), {
      'content-type': 'application/json; charset=utf-8',
    });
    return;
  }

  let ticker;
  try {
    ticker = decodeURIComponent(match[1]);
  } catch {
    send(res, 400, JSON.stringify({ error: 'Invalid ticker' }), {
      'content-type': 'application/json; charset=utf-8',
    });
    return;
  }

  if (!/^[A-Za-z0-9.^=_-]{1,32}$/.test(ticker)) {
    send(res, 400, JSON.stringify({ error: 'Invalid ticker' }), {
      'content-type': 'application/json; charset=utf-8',
    });
    return;
  }

  const target = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5y`;
  const cached = getYahooCache(target);
  if (cached) {
    res.writeHead(200, {
      'content-type': cached.contentType,
      'cache-control': 'public, max-age=300',
    });
    res.end(cached.body);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), yahooTimeoutMs);
  try {
    const upstream = await fetch(target, {
      headers: {
        'user-agent': req.headers['user-agent'] || 'dashboard-app',
        'accept': 'application/json,text/plain,*/*',
      },
      signal: controller.signal,
    });
    const body = Buffer.from(await upstream.arrayBuffer());
    const contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';
    if (upstream.ok) {
      setYahooCache(target, {
        body,
        contentType,
        expiresAt: Date.now() + yahooCacheTtlMs,
      });
    }
    res.writeHead(upstream.status, {
      'content-type': contentType,
      'cache-control': upstream.ok ? 'public, max-age=300' : 'no-store',
    });
    res.end(body);
  } catch (error) {
    send(res, 502, JSON.stringify({ error: error.message }), {
      'content-type': 'application/json; charset=utf-8',
    });
  } finally {
    clearTimeout(timeout);
  }
}

function serveStatic(req, res, url) {
  let decoded;
  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    send(res, 400, 'Bad Request');
    return;
  }

  const requested = decoded === '/' ? '/index.html' : decoded;
  const filePath = normalize(resolve(root, `.${requested}`));
  if (filePath !== root && !filePath.startsWith(`${root}/`)) {
    send(res, 403, 'Forbidden');
    return;
  }

  const finalPath = existsSync(filePath) && statSync(filePath).isFile()
    ? filePath
    : join(root, 'index.html');

  if (!existsSync(finalPath)) {
    send(res, 404, 'Build output not found. Run npm run build first.');
    return;
  }

  res.writeHead(200, {
    'content-type': mime[extname(finalPath)] || 'application/octet-stream',
    'cache-control': finalPath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  createReadStream(finalPath).pipe(res);
}

createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname.startsWith('/yahoo/')) {
      proxyYahoo(req, res, url);
      return;
    }
    serveStatic(req, res, url);
  } catch {
    send(res, 400, 'Bad Request');
  }
}).listen(port, host, () => {
  console.log(`dashboard-app listening on http://${host}:${port}`);
});
