import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Storage paths
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface ScanEvent {
  id: string;
  linkId: string;
  timestamp: string;
  device: 'mobile' | 'desktop' | 'tablet' | 'other';
  os: string;
  browser: string;
  referrer: string;
  ipHash: string;
  userAgent: string;
}

interface DynamicLink {
  id: string;
  shortCode: string;
  title: string;
  targetUrl: string;
  createdAt: string;
  updatedAt: string;
  totalScans: number;
  qrConfig?: Record<string, unknown>;
}

interface Database {
  links: DynamicLink[];
  scans: ScanEvent[];
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function generateRandomCode(length = 6): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// User Agent parser helper
function parseUserAgent(ua: string | undefined): { device: 'mobile' | 'desktop' | 'tablet' | 'other'; os: string; browser: string } {
  if (!ua) {
    return { device: 'other', os: 'Unknown OS', browser: 'Unknown Browser' };
  }

  const uaLower = ua.toLowerCase();

  // Device
  let device: 'mobile' | 'desktop' | 'tablet' | 'other' = 'desktop';
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|phone|iemobile/i.test(ua)) {
    device = 'mobile';
  } else if (/android/i.test(ua)) {
    device = 'tablet';
  }

  // OS
  let os = 'Other';
  if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser
  let browser = 'Other';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';
  else if (/yabrowser/i.test(ua)) browser = 'Yandex Browser';

  return { device, os, browser };
}

// Initial seed data with a helpful starter link and initial scans
function getInitialData(): Database {
  const now = new Date();
  const demoId = 'link-demo-1';
  const demoShortCode = 'welcome';

  // Generate realistic seed scans over the past 7 days
  const seedScans: ScanEvent[] = [];
  const devices: ('mobile' | 'desktop' | 'tablet')[] = ['mobile', 'mobile', 'desktop', 'mobile', 'desktop', 'tablet'];
  const osList = ['iOS', 'Android', 'Android', 'iOS', 'Windows 10/11', 'macOS'];
  const browsers = ['Safari', 'Chrome', 'Chrome', 'Safari', 'Chrome', 'Firefox'];

  for (let i = 24; i >= 0; i--) {
    const scanDate = new Date(now.getTime() - i * 5 * 60 * 60 * 1000);
    const randDevIndex = Math.floor(Math.random() * devices.length);
    seedScans.push({
      id: `scan-${Date.now()}-${i}`,
      linkId: demoId,
      timestamp: scanDate.toISOString(),
      device: devices[randDevIndex],
      os: osList[randDevIndex],
      browser: browsers[randDevIndex],
      referrer: i % 3 === 0 ? 'https://t.me' : i % 2 === 0 ? 'Direct Scan' : 'https://instagram.com',
      ipHash: `hash-${Math.floor(Math.random() * 8)}`,
      userAgent: 'Seed UA',
    });
  }

  const initialLinks: DynamicLink[] = [
    {
      id: demoId,
      shortCode: demoShortCode,
      title: 'Демо: Мой веб-сайт',
      targetUrl: 'https://google.com',
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
      totalScans: seedScans.length,
      qrConfig: {
        dotsType: 'rounded',
        dotsColor: '#2563eb',
        colorType: 'single',
        cornersSquareType: 'extra-rounded',
        cornersSquareColor: '#1d4ed8',
      },
    },
  ];

  return { links: initialLinks, scans: seedScans };
}

function loadDatabase(): Database {
  ensureDataDir();
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading database, resetting to seed data:', err);
  }
  const init = getInitialData();
  saveDatabase(init);
  return init;
}

function saveDatabase(db: Database): void {
  ensureDataDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let database: Database = loadDatabase();

async function startServer() {
  // ----------------------------------------------------
  // Dynamic QR Redirect route: /r/:shortCode
  // ----------------------------------------------------
  app.get('/r/:shortCode', (req: Request, res: Response) => {
    const { shortCode } = req.params;
    const link = database.links.find(
      (l) => l.shortCode.toLowerCase() === shortCode.toLowerCase()
    );

    if (!link) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>QR-код не найден</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
              .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 440px; text-align: center; }
              h1 { font-size: 20px; margin-bottom: 8px; color: #ef4444; }
              p { color: #64748b; font-size: 14px; line-height: 1.5; }
              a { display: inline-block; margin-top: 16px; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>QR-код не найден или удален</h1>
              <p>Короткая ссылка <strong>/r/${shortCode}</strong> не привязана к целевому адресу.</p>
              <a href="/">Перейти к генератору QR-кодов</a>
            </div>
          </body>
        </html>
      `);
    }

    // Record scan event
    const ua = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'Прямой переход / QR-сканер';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ipHash = String(ip).split(',')[0].trim();

    const { device, os, browser } = parseUserAgent(ua);

    const scan: ScanEvent = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      linkId: link.id,
      timestamp: new Date().toISOString(),
      device,
      os,
      browser,
      referrer: Array.isArray(referrer) ? referrer[0] : referrer,
      ipHash: Buffer.from(ipHash).toString('base64').substring(0, 10),
      userAgent: ua,
    };

    link.totalScans = (link.totalScans || 0) + 1;
    link.updatedAt = new Date().toISOString();
    database.scans.push(scan);
    saveDatabase(database);

    // Redirect to targetUrl
    let target = link.targetUrl;
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }
    return res.redirect(302, target);
  });

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // GET /api/links - List all dynamic links
  app.get('/api/links', (req: Request, res: Response) => {
    res.json({ success: true, links: database.links });
  });

  // POST /api/links - Create new dynamic link
  app.post('/api/links', (req: Request, res: Response) => {
    const { title, targetUrl, customCode, qrConfig } = req.body;

    if (!targetUrl || typeof targetUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'targetUrl is required' });
    }

    let shortCode = (customCode || '').trim();
    if (shortCode) {
      // Validate uniqueness
      const exists = database.links.some(
        (l) => l.shortCode.toLowerCase() === shortCode.toLowerCase()
      );
      if (exists) {
        return res.status(400).json({ success: false, error: 'Этот короткий код уже занят' });
      }
    } else {
      shortCode = generateRandomCode(6);
    }

    const newLink: DynamicLink = {
      id: `link-${Date.now()}-${generateRandomCode(4)}`,
      shortCode,
      title: title?.trim() || 'Без названия',
      targetUrl: targetUrl.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalScans: 0,
      qrConfig: qrConfig || {},
    };

    database.links.unshift(newLink);
    saveDatabase(database);

    res.status(201).json({ success: true, link: newLink });
  });

  // GET /api/links/:id - Get link and its stats
  app.get('/api/links/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const link = database.links.find((l) => l.id === id || l.shortCode === id);
    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }
    res.json({ success: true, link });
  });

  // PUT /api/links/:id - Update targetUrl or title or qrConfig
  app.put('/api/links/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const link = database.links.find((l) => l.id === id);
    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    const { title, targetUrl, qrConfig } = req.body;
    if (title !== undefined) link.title = title.trim();
    if (targetUrl !== undefined) link.targetUrl = targetUrl.trim();
    if (qrConfig !== undefined) link.qrConfig = { ...link.qrConfig, ...qrConfig };

    link.updatedAt = new Date().toISOString();
    saveDatabase(database);

    res.json({ success: true, link });
  });

  // DELETE /api/links/:id - Remove dynamic link and its scans
  app.delete('/api/links/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLen = database.links.length;
    database.links = database.links.filter((l) => l.id !== id);
    if (database.links.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }
    database.scans = database.scans.filter((s) => s.linkId !== id);
    saveDatabase(database);

    res.json({ success: true, message: 'Deleted successfully' });
  });

  // GET /api/links/:id/stats - Detailed analytics for a dynamic link
  app.get('/api/links/:id/stats', (req: Request, res: Response) => {
    const { id } = req.params;
    const link = database.links.find((l) => l.id === id);
    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    const scans = database.scans
      .filter((s) => s.linkId === link.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalScans = scans.length;
    const uniqueIps = new Set(scans.map((s) => s.ipHash)).size;

    // Timeline: past 7 days (or 14 days) grouped by date
    const daysMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      daysMap.set(key, 0);
    }

    scans.forEach((scan) => {
      const d = new Date(scan.timestamp);
      const key = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      if (daysMap.has(key)) {
        daysMap.set(key, (daysMap.get(key) || 0) + 1);
      }
    });

    const timeline = Array.from(daysMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // Device breakdown
    const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0, other: 0 };
    scans.forEach((s) => {
      deviceCounts[s.device] = (deviceCounts[s.device] || 0) + 1;
    });

    const deviceLabels: Record<string, string> = {
      mobile: 'Смартфоны',
      desktop: 'Компьютеры',
      tablet: 'Планшеты',
      other: 'Другое',
    };

    const deviceBreakdown = Object.entries(deviceCounts)
      .filter(([, count]) => count > 0)
      .map(([dev, count]) => ({
        name: deviceLabels[dev] || dev,
        value: count,
        percentage: totalScans > 0 ? Math.round((count / totalScans) * 100) : 0,
      }));

    // OS Breakdown
    const osCounts: Record<string, number> = {};
    scans.forEach((s) => {
      osCounts[s.os] = (osCounts[s.os] || 0) + 1;
    });
    const osBreakdown = Object.entries(osCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalScans > 0 ? Math.round((value / totalScans) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    // Browser Breakdown
    const browserCounts: Record<string, number> = {};
    scans.forEach((s) => {
      browserCounts[s.browser] = (browserCounts[s.browser] || 0) + 1;
    });
    const browserBreakdown = Object.entries(browserCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalScans > 0 ? Math.round((value / totalScans) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    res.json({
      success: true,
      stats: {
        link,
        scans: scans.slice(0, 50),
        totalScans,
        uniqueVisitors: uniqueIps,
        timeline,
        deviceBreakdown,
        osBreakdown,
        browserBreakdown,
      },
    });
  });

  // POST /api/links/:id/simulate-scan - Test/simulate scan
  app.post('/api/links/:id/simulate-scan', (req: Request, res: Response) => {
    const { id } = req.params;
    const link = database.links.find((l) => l.id === id);
    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    const { device = 'mobile', os = 'iOS', browser = 'Safari', referrer = 'Прямое сканирование QR' } = req.body;

    const scan: ScanEvent = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      linkId: link.id,
      timestamp: new Date().toISOString(),
      device: device as 'mobile' | 'desktop' | 'tablet' | 'other',
      os,
      browser,
      referrer,
      ipHash: `sim-${Math.floor(Math.random() * 999)}`,
      userAgent: `Simulated User Agent (${device}; ${os}; ${browser})`,
    };

    link.totalScans = (link.totalScans || 0) + 1;
    link.updatedAt = new Date().toISOString();
    database.scans.push(scan);
    saveDatabase(database);

    res.json({ success: true, scan, totalScans: link.totalScans });
  });

  // GET /api/overview - Aggregate totals for dashboard
  app.get('/api/overview', (req: Request, res: Response) => {
    const totalLinks = database.links.length;
    const totalScans = database.scans.length;
    const uniqueVisitors = new Set(database.scans.map((s) => s.ipHash)).size;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scansToday = database.scans.filter((s) => new Date(s.timestamp) >= today).length;

    res.json({
      success: true,
      data: {
        totalLinks,
        totalScans,
        uniqueVisitors,
        scansToday,
      },
    });
  });

  // ----------------------------------------------------
  // Vite Integration (SPA Middleware / Static serving)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QR Code Server running at http://localhost:${PORT}`);
  });
}

startServer();
