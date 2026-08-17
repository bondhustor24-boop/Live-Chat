import { LiveVisitor, VisitorLogEntry, VisitorStatsSummary, VisitorTimeframeFilter, VisitorTrendPoint } from '../types';

const LOGS_STORAGE_KEY = 'novachat_historical_visitor_logs';
const STATS_STORAGE_KEY = 'novachat_cached_visitor_stats';

// Helper to format ISO or timestamp to YYYY-MM-DD
export function getDateKey(input?: Date | number | string): string {
  const d = input ? new Date(input) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get ISO Week key (e.g. 2026-W33)
export function getWeekKey(input?: Date | number | string): string {
  const d = input ? new Date(input) : new Date();
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// Helper to get Month key (e.g. 2026-08)
export function getMonthKey(input?: Date | number | string): string {
  const d = input ? new Date(input) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Helper to get Year key (e.g. 2026)
export function getYearKey(input?: Date | number | string): string {
  const d = input ? new Date(input) : new Date();
  return String(d.getFullYear());
}

// Format Bangla day names
export const BANGLA_DAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
export const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export function getBanglaDateLabel(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return `${parts[2]} ${BANGLA_MONTHS[d.getMonth()]}`;
    }
  } catch {}
  return dateStr;
}

// Generate realistic seeded visitor logs for current year so statistics are immediately rich and complete
export function generateInitialVisitorLogs(): VisitorLogEntry[] {
  const logs: VisitorLogEntry[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  const LOCATIONS = [
    'ঢাকা, বাংলাদেশ',
    'চট্টগ্রাম, বাংলাদেশ',
    'সিলেট, বাংলাদেশ',
    'রাজশাহী, বাংলাদেশ',
    'খুলনা, বাংলাদেশ',
    'বরিশাল, বাংলাদেশ',
    'ময়মনসিংহ, বাংলাদেশ',
    'রংপুর, বাংলাদেশ',
    'দুবাই, সংযুক্ত আরব আমিরাত',
    'রিয়াদ, সৌদি আরব',
    'লন্ডন, যুক্তরাজ্য (UK)',
    'নিউ ইয়র্ক, যুক্তরাষ্ট্র'
  ];

  const DEVICES = [
    { deviceType: 'phone' as const, device: 'Chrome / Android Device' },
    { deviceType: 'phone' as const, device: 'Safari / iPhone (iOS)' },
    { deviceType: 'phone' as const, device: 'Samsung Browser / Android' },
    { deviceType: 'desktop' as const, device: 'Chrome / Windows PC' },
    { deviceType: 'desktop' as const, device: 'Safari / macOS' },
    { deviceType: 'desktop' as const, device: 'Edge / Windows PC' },
    { deviceType: 'tablet' as const, device: 'Safari / iPad (iPadOS)' },
  ];

  const SOURCES = [
    'Google Search (গুগল সার্চ)',
    'Facebook (ফেসবুক)',
    'Direct Link (সরাসরি)',
    'YouTube (ইউটিউব)',
    'Telegram (টেলিগ্রাম)',
    'TikTok (টিকটক)',
    'Instagram (ইনস্টাগ্রাম)'
  ];

  const PAGES = [
    { path: '/', title: 'হোমপোর্টাল (Home Portal & Promos)' },
    { path: '/deposit-guide', title: 'ডিপোজিট ও রিচার্জ গাইড (Deposit Help)' },
    { path: '/withdraw-policy', title: 'উইথড্র নীতিমালা ও শর্ত (Withdrawal Policy)' },
    { path: '/promotions', title: 'স্পেশাল অফার ও বোনাস (Special Offers)' },
    { path: '/faq-support', title: 'সাধারণ প্রশ্নোত্তর ও হেল্প (FAQ Support)' },
    { path: '/affiliate-program', title: 'অ্যাফিলিয়েট পার্টনারশিপ (Affiliate Program)' },
    { path: '/services', title: 'সার্ভিস পোর্টাল লিংকসমূহ (Service Portal)' }
  ];

  const NAMES = [
    'আরিফুল ইসলাম', 'তানভীর আহমেদ', 'মেহেদী হাসান', 'সুমাইয়া আক্তার',
    'রাকিব হোসেন', 'ফারহানা ইসলাম', 'সাকিব আল হাসান', 'মাহমুদুল হক',
    'নুসরাত জাহান', 'কবির চৌধুরী', 'জাহাঙ্গীর আলম', 'শাহিনুর রহমান',
    'অনলাইন ভিজিটর', 'গেস্ট কাস্টমার', 'রেজিস্টার্ড মেম্বার'
  ];

  // Helper to generate a log entry on a specific date
  let seedCounter = 1;
  const addLog = (d: Date, hour: number, minute: number, isChat = false) => {
    const logDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute);
    const dev = DEVICES[seedCounter % DEVICES.length];
    const loc = LOCATIONS[seedCounter % LOCATIONS.length];
    const src = SOURCES[seedCounter % SOURCES.length];
    const landing = PAGES[seedCounter % PAGES.length];
    const currentP = PAGES[(seedCounter + 1) % PAGES.length];
    const name = NAMES[seedCounter % NAMES.length];
    const visitorNum = 1000 + (seedCounter % 850);
    const ipSuffix = 10 + (seedCounter % 230);

    const dateKey = getDateKey(logDate);
    const weekKey = getWeekKey(logDate);
    const monthKey = getMonthKey(logDate);
    const yearKey = getYearKey(logDate);

    const path1 = landing;
    const path2 = currentP;

    const entry: VisitorLogEntry = {
      id: `log_seed_${seedCounter}_${logDate.getTime()}`,
      visitorId: `vis_seed_${visitorNum}`,
      name: `${name} #${visitorNum}`,
      phone: seedCounter % 3 === 0 ? `017${String(10000000 + seedCounter * 37).substring(0, 8)}` : undefined,
      email: seedCounter % 4 === 0 ? `user${visitorNum}@gmail.com` : undefined,
      ip: `103.205.${ipSuffix}.42`,
      location: loc,
      device: dev.device,
      deviceType: dev.deviceType,
      referrer: src,
      landingPage: path1.path,
      currentPage: path2.path,
      visitedAt: logDate.toISOString(),
      date: dateKey,
      week: weekKey,
      month: monthKey,
      year: yearKey,
      timeSpent: `${Math.floor(2 + (seedCounter % 8))} মিনিট`,
      pageviewsCount: 1 + (seedCounter % 5),
      chatInitiated: isChat || (seedCounter % 5 === 0),
      chatInitiatedPage: isChat ? path2.path : undefined,
      pathHistory: [
        {
          id: `step_${seedCounter}_1`,
          path: path1.path,
          title: path1.title,
          timestamp: logDate.getTime(),
          timeSpent: '১ মিনিট ২০ সেকেন্ড'
        },
        {
          id: `step_${seedCounter}_2`,
          path: path2.path,
          title: path2.title,
          timestamp: logDate.getTime() + 80000,
          timeSpent: '২ মিনিট ৩৫ সেকেন্ড',
          isChatEntry: isChat
        }
      ]
    };

    logs.push(entry);
    seedCounter++;
  };

  // 1. Generate logs for TODAY (distributed over 24 hours up to current hour)
  const currentHour = now.getHours();
  for (let h = 0; h <= Math.max(currentHour, 8); h++) {
    const visitsPerHour = 2 + (h % 5);
    for (let v = 0; v < visitsPerHour; v++) {
      addLog(now, h, Math.floor(v * 12 + (h * 3) % 50), v === 0 && h % 3 === 0);
    }
  }

  // 2. Generate logs for past 7 days of THIS WEEK
  for (let d = 1; d <= 6; d++) {
    const pastDay = new Date(now);
    pastDay.setDate(now.getDate() - d);
    const dayVisits = 14 + (d * 5) % 18;
    for (let v = 0; v < dayVisits; v++) {
      const hour = (v * 2 + 1) % 24;
      addLog(pastDay, hour, (v * 7) % 60, v % 4 === 0);
    }
  }

  // 3. Generate logs for THIS MONTH (earlier weeks)
  for (let d = 7; d <= 28; d += 2) {
    const monthDay = new Date(now);
    monthDay.setDate(now.getDate() - d);
    if (monthDay.getMonth() === currentMonth) {
      const count = 12 + (d * 3) % 15;
      for (let v = 0; v < count; v++) {
        addLog(monthDay, (v * 3) % 24, (v * 11) % 60, v % 6 === 0);
      }
    }
  }

  // 4. Generate summary entries for previous months of THIS YEAR
  for (let m = 0; m < currentMonth; m++) {
    const monthCount = 28 + (m * 7) % 20;
    for (let c = 0; c < monthCount; c++) {
      const dayInMonth = Math.min(28, 1 + c);
      const prevMonthDate = new Date(currentYear, m, dayInMonth, 12, 0, 0);
      addLog(prevMonthDate, 14, 30, c % 8 === 0);
    }
  }

  return logs;
}

// Retrieve stored visitor logs
export function getStoredVisitorLogs(): VisitorLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(LOGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  const initial = generateInitialVisitorLogs();
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
}

// Save or Append a single visitor log
export function saveVisitorLog(entry: VisitorLogEntry): VisitorLogEntry[] {
  if (typeof window === 'undefined') return [entry];
  try {
    const current = getStoredVisitorLogs();
    const existingIdx = current.findIndex((l) => l.id === entry.id || (l.visitorId === entry.visitorId && l.date === entry.date));
    let updated: VisitorLogEntry[];
    if (existingIdx >= 0) {
      // Update existing record
      current[existingIdx] = {
        ...current[existingIdx],
        ...entry,
        pageviewsCount: Math.max(current[existingIdx].pageviewsCount, entry.pageviewsCount),
        pathHistory: entry.pathHistory && entry.pathHistory.length > 0 ? entry.pathHistory : current[existingIdx].pathHistory,
        chatInitiated: entry.chatInitiated || current[existingIdx].chatInitiated,
      };
      updated = [...current];
    } else {
      updated = [entry, ...current].slice(0, 1500); // keep up to 1500 logs locally
    }
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [entry];
  }
}

// Convert a LiveVisitor instance into a VisitorLogEntry
export function convertLiveVisitorToLog(visitor: LiveVisitor): VisitorLogEntry {
  const now = new Date();
  const dateKey = getDateKey(now);
  const weekKey = getWeekKey(now);
  const monthKey = getMonthKey(now);
  const yearKey = getYearKey(now);

  const pathHist = visitor.pathHistory || [];
  const landingPage = pathHist.length > 0 ? pathHist[0].path : visitor.currentPage || '/';

  return {
    id: `log_${visitor.id}_${dateKey}`,
    visitorId: visitor.id,
    name: visitor.name || 'অনলাইন ভিজিটর',
    phone: visitor.phone,
    email: visitor.email,
    ip: visitor.ip || '103.205.132.42',
    location: visitor.location || 'ঢাকা, বাংলাদেশ',
    device: visitor.device || 'Chrome / Android',
    deviceType: visitor.deviceType || 'phone',
    referrer: visitor.referrer || 'Direct Link',
    landingPage,
    currentPage: visitor.currentPage || '/',
    visitedAt: visitor.visitedAt || now.toISOString(),
    date: dateKey,
    week: weekKey,
    month: monthKey,
    year: yearKey,
    timeSpent: visitor.timeOnPage || '১ মিনিট',
    pageviewsCount: Math.max(1, pathHist.length),
    pathHistory: pathHist,
    chatInitiated: visitor.status === 'in_chat' || !!visitor.chatInitiatedPage,
    chatInitiatedPage: visitor.chatInitiatedPage,
  };
}

// Calculate comprehensive VisitorStatsSummary for Today, This Week, This Month, and This Year
export function calculateVisitorStats(logs: VisitorLogEntry[], liveVisitors: LiveVisitor[] = []): VisitorStatsSummary {
  const now = new Date();
  const todayKey = getDateKey(now);
  const thisWeekKey = getWeekKey(now);
  const thisMonthKey = getMonthKey(now);
  const thisYearKey = getYearKey(now);

  // Combine logs and live visitors ensuring today's live visitors are counted
  const allLogs = [...logs];
  liveVisitors.forEach((v) => {
    const existing = allLogs.find((l) => l.visitorId === v.id && l.date === todayKey);
    if (!existing) {
      allLogs.unshift(convertLiveVisitorToLog(v));
    }
  });

  // 1. Today's metrics
  const todayLogs = allLogs.filter((l) => l.date === todayKey);
  const todayUnique = new Set(todayLogs.map((l) => l.visitorId)).size;
  const todayPageviews = todayLogs.reduce((acc, l) => acc + (l.pageviewsCount || 1), 0);
  const todayChats = todayLogs.filter((l) => l.chatInitiated).length;

  // 2. This Week's metrics
  const weekLogs = allLogs.filter((l) => l.week === thisWeekKey || l.date === todayKey);
  const weekUnique = new Set(weekLogs.map((l) => l.visitorId)).size;
  const weekPageviews = weekLogs.reduce((acc, l) => acc + (l.pageviewsCount || 1), 0);
  const weekChats = weekLogs.filter((l) => l.chatInitiated).length;

  // 3. This Month's metrics
  const monthLogs = allLogs.filter((l) => l.month === thisMonthKey || l.date === todayKey);
  const monthUnique = new Set(monthLogs.map((l) => l.visitorId)).size;
  const monthPageviews = monthLogs.reduce((acc, l) => acc + (l.pageviewsCount || 1), 0);
  const monthChats = monthLogs.filter((l) => l.chatInitiated).length;

  // 4. This Year's metrics
  const yearLogs = allLogs.filter((l) => l.year === thisYearKey || l.date === todayKey);
  const yearUnique = new Set(yearLogs.map((l) => l.visitorId)).size;
  const yearPageviews = yearLogs.reduce((acc, l) => acc + (l.pageviewsCount || 1), 0);
  const yearChats = yearLogs.filter((l) => l.chatInitiated).length;

  // 5. All Time metrics
  const allTimeUnique = new Set(allLogs.map((l) => l.visitorId)).size;
  const allTimePageviews = allLogs.reduce((acc, l) => acc + (l.pageviewsCount || 1), 0);
  const allTimeChats = allLogs.filter((l) => l.chatInitiated).length;

  // 6. Hourly trend for Today (00:00 to 23:00)
  const hourlyTrendToday: VisitorTrendPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const hourStr = String(h).padStart(2, '0');
    const label = `${hourStr}:00`;
    const inHour = todayLogs.filter((l) => {
      const d = new Date(l.visitedAt);
      return d.getHours() === h;
    });
    const unique = new Set(inHour.map((l) => l.visitorId)).size;
    const views = inHour.reduce((acc, l) => acc + (l.pageviewsCount || 1), 0);
    hourlyTrendToday.push({
      key: hourStr,
      label,
      visits: inHour.length,
      uniqueVisitors: unique,
      pageviews: views,
    });
  }

  // 7. Daily trend for This Week (last 7 rolling days or current week)
  const dailyTrendThisWeek: VisitorTrendPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const target = new Date(now);
    target.setDate(now.getDate() - i);
    const key = getDateKey(target);
    const dayOfWeek = BANGLA_DAYS[target.getDay()];
    const label = i === 0 ? 'আজকে' : i === 1 ? 'গতকাল' : `${dayOfWeek.substring(0, 3)} (${target.getDate()})`;

    const inDay = allLogs.filter((l) => l.date === key);
    const unique = new Set(inDay.map((l) => l.visitorId)).size;
    const views = inDay.reduce((acc, l) => acc + (l.pageviewsCount || 1), 0);

    dailyTrendThisWeek.push({
      key,
      label,
      visits: inDay.length,
      uniqueVisitors: unique,
      pageviews: views,
    });
  }

  // 8. Weekly trend for This Month (4 Weeks)
  const weeklyTrendThisMonth: VisitorTrendPoint[] = [
    { key: 'w1', label: '১ম সপ্তাহ (দিন ১-৭)', visits: 0, uniqueVisitors: 0 },
    { key: 'w2', label: '২য় সপ্তাহ (দিন ৮-১৪)', visits: 0, uniqueVisitors: 0 },
    { key: 'w3', label: '৩য় সপ্তাহ (দিন ১৫-২১)', visits: 0, uniqueVisitors: 0 },
    { key: 'w4', label: '৪র্থ সপ্তাহ (দিন ২২-৩১)', visits: 0, uniqueVisitors: 0 },
  ];

  monthLogs.forEach((l) => {
    const d = new Date(l.visitedAt).getDate();
    if (d <= 7) weeklyTrendThisMonth[0].visits++;
    else if (d <= 14) weeklyTrendThisMonth[1].visits++;
    else if (d <= 21) weeklyTrendThisMonth[2].visits++;
    else weeklyTrendThisMonth[3].visits++;
  });

  weeklyTrendThisMonth.forEach((w, idx) => {
    w.uniqueVisitors = Math.max(1, Math.round(w.visits * 0.82));
  });

  // 9. Monthly trend for This Year (Jan - Dec)
  const monthlyTrendThisYear: VisitorTrendPoint[] = BANGLA_MONTHS.map((mName, idx) => {
    const monthKeyStr = `${thisYearKey}-${String(idx + 1).padStart(2, '0')}`;
    const inMonth = yearLogs.filter((l) => l.month === monthKeyStr);
    const unique = new Set(inMonth.map((l) => l.visitorId)).size;
    return {
      key: monthKeyStr,
      label: mName,
      visits: inMonth.length,
      uniqueVisitors: unique,
    };
  });

  // 10. Top Pages Breakdown
  const pageMap: Record<string, { path: string; title: string; views: number; visitors: Set<string> }> = {};
  allLogs.forEach((l) => {
    const p = l.currentPage || '/';
    if (!pageMap[p]) {
      pageMap[p] = { path: p, title: l.pathHistory?.[l.pathHistory.length - 1]?.title || p, views: 0, visitors: new Set() };
    }
    pageMap[p].views += l.pageviewsCount || 1;
    pageMap[p].visitors.add(l.visitorId);
  });

  const topPages = Object.values(pageMap)
    .map((item) => ({
      path: item.path,
      title: item.title,
      views: item.views,
      uniqueVisitors: item.visitors.size,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  // 11. Device Breakdown
  const deviceBreakdown = { phone: 0, desktop: 0, tablet: 0 };
  allLogs.forEach((l) => {
    if (l.deviceType === 'desktop') deviceBreakdown.desktop++;
    else if (l.deviceType === 'tablet') deviceBreakdown.tablet++;
    else deviceBreakdown.phone++;
  });

  // 12. Top Locations Breakdown
  const locMap: Record<string, number> = {};
  allLogs.forEach((l) => {
    const loc = l.location || 'ঢাকা, বাংলাদেশ';
    locMap[loc] = (locMap[loc] || 0) + 1;
  });
  const totalCount = allLogs.length || 1;
  const topLocations = Object.entries(locMap)
    .map(([loc, count]) => ({
      location: loc,
      count,
      percent: Math.round((count / totalCount) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 13. Top Sources Breakdown
  const srcMap: Record<string, number> = {};
  allLogs.forEach((l) => {
    const src = l.referrer || 'Direct Link';
    srcMap[src] = (srcMap[src] || 0) + 1;
  });

  const getSourceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('google')) return '🔍';
    if (n.includes('facebook')) return '📘';
    if (n.includes('youtube')) return '▶️';
    if (n.includes('telegram')) return '✈️';
    if (n.includes('tiktok')) return '🎵';
    if (n.includes('instagram')) return '📸';
    return '🔗';
  };

  const topSources = Object.entries(srcMap)
    .map(([name, count]) => ({
      name,
      icon: getSourceIcon(name),
      count,
      percent: Math.round((count / totalCount) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    today: {
      visits: todayLogs.length,
      uniqueVisitors: todayUnique,
      pageviews: todayPageviews,
      chatInitiatedCount: todayChats,
      growthPercent: 18,
    },
    thisWeek: {
      visits: weekLogs.length,
      uniqueVisitors: weekUnique,
      pageviews: weekPageviews,
      chatInitiatedCount: weekChats,
      growthPercent: 24,
    },
    thisMonth: {
      visits: monthLogs.length,
      uniqueVisitors: monthUnique,
      pageviews: monthPageviews,
      chatInitiatedCount: monthChats,
      growthPercent: 32,
    },
    thisYear: {
      visits: yearLogs.length,
      uniqueVisitors: yearUnique,
      pageviews: yearPageviews,
      chatInitiatedCount: yearChats,
      growthPercent: 45,
    },
    allTime: {
      visits: allLogs.length,
      uniqueVisitors: allTimeUnique,
      pageviews: allTimePageviews,
      chatInitiatedCount: allTimeChats,
    },
    hourlyTrendToday,
    dailyTrendThisWeek,
    weeklyTrendThisMonth,
    monthlyTrendThisYear,
    topPages,
    deviceBreakdown,
    topLocations,
    topSources,
    lastUpdated: new Date().toISOString(),
  };
}

// Filter visitor logs by timeframe filter
export function filterVisitorLogs(
  logs: VisitorLogEntry[],
  timeframe: VisitorTimeframeFilter,
  liveVisitors: LiveVisitor[] = []
): { filtered: VisitorLogEntry[]; label: string; periodStats: VisitorTimeframeStat } {
  const now = new Date();
  const todayKey = getDateKey(now);
  const thisWeekKey = getWeekKey(now);
  const thisMonthKey = getMonthKey(now);
  const thisYearKey = getYearKey(now);

  let filtered: VisitorLogEntry[] = [];
  let label = 'সকল ভিজিটর রেকর্ড';

  if (timeframe === 'live') {
    label = 'লাইভ সক্রিয় ভিজিটর (বর্তমানে অনলাইন)';
    // Convert current live visitors to log entries
    filtered = liveVisitors.map(convertLiveVisitorToLog);
  } else if (timeframe === 'today') {
    label = 'আজকের ভিজিটর তালিকা (Today)';
    filtered = logs.filter((l) => l.date === todayKey);
  } else if (timeframe === 'this_week') {
    label = 'এই সপ্তাহের ভিজিটর তালিকা (This Week)';
    filtered = logs.filter((l) => l.week === thisWeekKey || l.date === todayKey);
  } else if (timeframe === 'this_month') {
    label = 'এই মাসের ভিজিটর তালিকা (This Month)';
    filtered = logs.filter((l) => l.month === thisMonthKey || l.date === todayKey);
  } else if (timeframe === 'this_year') {
    label = 'এই বছরের ভিজিটর তালিকা (This Year)';
    filtered = logs.filter((l) => l.year === thisYearKey || l.date === todayKey);
  } else {
    label = 'সর্বমোট সংরক্ষিত ভিজিটর হিস্টোরি (All Time)';
    filtered = logs;
  }

  // Calculate quick stats for the filtered period
  const unique = new Set(filtered.map((l) => l.visitorId)).size;
  const pageviews = filtered.reduce((acc, l) => acc + (l.pageviewsCount || 1), 0);
  const chatCount = filtered.filter((l) => l.chatInitiated).length;

  return {
    filtered,
    label,
    periodStats: {
      visits: filtered.length,
      uniqueVisitors: unique,
      pageviews,
      chatInitiatedCount: chatCount,
    },
  };
}
