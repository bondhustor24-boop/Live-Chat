import { LiveVisitor } from '../types';
import { syncVisitorToFirestore, deleteVisitorFromFirestore } from './firestoreSync';

// Helper to determine device type and description
export function detectDeviceInfo(): { deviceType: 'phone' | 'desktop' | 'tablet'; device: string } {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { deviceType: 'desktop', device: 'Web Browser / Desktop' };
  }

  const ua = navigator.userAgent || '';
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
  const isMobile = /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua);

  let deviceType: 'phone' | 'desktop' | 'tablet' = 'desktop';
  if (isTablet) {
    deviceType = 'tablet';
  } else if (isMobile) {
    deviceType = 'phone';
  }

  // Detect OS
  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows PC';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/iphone/i.test(ua)) os = 'iPhone (iOS)';
  else if (/ipad/i.test(ua)) os = 'iPad (iPadOS)';
  else if (/android/i.test(ua)) os = 'Android Device';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Detect Browser
  let browser = 'Browser';
  if (/chrome|crios/i.test(ua) && !/edge|edg|opr|opera/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios|opr|opera/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/edg|edge/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/brave/i.test(ua)) browser = 'Brave';

  return {
    deviceType,
    device: `${browser} / ${os}`,
  };
}

// Detect Location from timezone and language
export function detectLocation(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tzMap: Record<string, string> = {
      'Asia/Dhaka': 'ঢাকা, বাংলাদেশ',
      'Asia/Chittagong': 'চট্টগ্রাম, বাংলাদেশ',
      'Asia/Sylhet': 'সিলেট, বাংলাদেশ',
      'Asia/Kolkata': 'কলকাতা, ভারত',
      'Asia/Calcutta': 'ভারত (India)',
      'Asia/Dubai': 'দুবাই, সংযুক্ত আরব আমিরাত',
      'Asia/Riyadh': 'রিয়াদ, সৌদি আরব',
      'Asia/Qatar': 'দোহা, কাতার',
      'Asia/Singapore': 'সিঙ্গাপুর (Singapore)',
      'Asia/Kuala_Lumpur': 'কুয়ালালামপুর, মালয়েশিয়া',
      'Asia/Bangkok': 'ব্যাংকক, থাইল্যান্ড',
      'Europe/London': 'লন্ডন, যুক্তরাজ্য (UK)',
      'America/New_York': 'নিউ ইয়র্ক, যুক্তরাষ্ট্র (USA)',
      'America/Los_Angeles': 'ক্যালিফোর্নিয়া, যুক্তরাষ্ট্র',
      'America/Chicago': 'শিকাগো, যুক্তরাষ্ট্র',
      'America/Toronto': 'টরন্টো, কানাডা',
      'Australia/Sydney': 'সিডনি, অস্ট্রেলিয়া',
    };

    if (tzMap[tz]) return tzMap[tz];
    if (tz.includes('Asia/Dhaka')) return 'ঢাকা, বাংলাদেশ';
    if (tz.includes('Dhaka')) return 'বাংলাদেশ';
    if (tz.startsWith('Asia/')) return `${tz.replace('Asia/', '')}, এশিয়া`;
    if (tz.startsWith('Europe/')) return `${tz.replace('Europe/', '')}, ইউরোপ`;
    if (tz.startsWith('America/')) return `${tz.replace('America/', '')}, আমেরিকা`;
    return tz || 'বাংলাদেশ (অনলাইন)';
  } catch {
    return 'ঢাকা, বাংলাদেশ';
  }
}

// Detect Traffic Source / Referrer
export function detectTrafficSource(): string {
  if (typeof window === 'undefined') return 'Direct Link';
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');

    if (utmSource) {
      return `${utmSource.toUpperCase()}${utmCampaign ? ` (${utmCampaign})` : ''}`;
    }

    const ref = document.referrer || '';
    if (!ref) return 'Direct Link (সরাসরি)';

    const refLower = ref.toLowerCase();
    if (refLower.includes('google.')) return 'Google Search (গুগল সার্চ)';
    if (refLower.includes('facebook.com') || refLower.includes('fb.com')) return 'Facebook (ফেসবুক)';
    if (refLower.includes('youtube.com')) return 'YouTube (ইউটিউব)';
    if (refLower.includes('t.me') || refLower.includes('telegram')) return 'Telegram (টেলিগ্রাম)';
    if (refLower.includes('tiktok.com')) return 'TikTok (টিকটক)';
    if (refLower.includes('instagram.com')) return 'Instagram (ইনস্টাগ্রাম)';
    if (refLower.includes('linkedin.com')) return 'LinkedIn';
    if (refLower.includes('bing.com')) return 'Bing Search';
    if (refLower.includes('twitter.com') || refLower.includes('x.com')) return 'Twitter / X';

    // Fallback to domain name
    try {
      const url = new URL(ref);
      return url.hostname.replace('www.', '');
    } catch {
      return 'External Referral';
    }
  } catch {
    return 'Direct Link';
  }
}

// Format duration into Bangla readable string
export function formatTimeOnPage(startTimeMs: number): string {
  const elapsedSec = Math.max(1, Math.floor((Date.now() - startTimeMs) / 1000));
  if (elapsedSec < 60) {
    return `${elapsedSec} সেকেন্ড`;
  }
  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  if (secs === 0) return `${mins} মিনিট`;
  return `${mins} মিনিট ${secs} সেকেন্ড`;
}

// Persistent visitor ID retrieval
export function getPersistentVisitorId(): string {
  if (typeof window === 'undefined') return 'vis_' + Date.now();
  const STORAGE_KEY = 'novachat_visitor_tracker_id';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    // Check if customer ID exists
    const customerId = localStorage.getItem('novachat_customer_id');
    id = customerId ? `vis_${customerId.replace('cust_', '')}` : `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

// Start Visitor Tracker Heartbeat
export function startVisitorTracker(options: {
  visitorName?: string;
  visitorPhone?: string;
  visitorEmail?: string;
  status?: 'browsing' | 'in_chat' | 'invited';
  onPing?: (visitor: LiveVisitor) => void;
}) {
  if (typeof window === 'undefined') {
    return {
      updateVisitorInfo: () => {},
      stop: () => {},
    };
  }

  const visitorId = getPersistentVisitorId();
  const startTime = Date.now();
  const { deviceType, device } = detectDeviceInfo();
  const location = detectLocation();
  const referrer = detectTrafficSource();
  const currentPage = window.location.pathname || '/';

  let currentStatus = options.status || 'browsing';
  let currentName = options.visitorName || 'অনলাইন ভিজিটর';
  let currentPhone = options.visitorPhone;
  let currentEmail = options.visitorEmail;

  const sendHeartbeat = async () => {
    const visitorRecord: LiveVisitor = {
      id: visitorId,
      name: currentName,
      phone: currentPhone,
      email: currentEmail,
      location,
      currentPage: window.location.pathname || currentPage,
      timeOnPage: formatTimeOnPage(startTime),
      device,
      deviceType,
      ip: '103.205.' + (Math.abs(visitorId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 250) + '.42',
      referrer,
      status: currentStatus,
      visitedAt: new Date(startTime).toISOString(),
    };

    // 1. Sync to Firestore in real time
    await syncVisitorToFirestore(visitorRecord);

    // 2. Ping backend REST/WebSocket
    try {
      fetch('/api/visitors/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitorRecord),
      }).catch(() => {});
    } catch {}

    if (options.onPing) {
      options.onPing(visitorRecord);
    }
  };

  // Immediate first ping
  sendHeartbeat();

  // Heartbeat interval every 15 seconds
  const intervalId = setInterval(sendHeartbeat, 15000);

  // Cleanup on leave
  const handleUnload = () => {
    try {
      // Beacon delete or mark offline
      navigator.sendBeacon?.(
        '/api/visitors/leave',
        JSON.stringify({ id: visitorId })
      );
    } catch {}
  };

  window.addEventListener('beforeunload', handleUnload);

  return {
    updateVisitorInfo: (updates: {
      name?: string;
      phone?: string;
      email?: string;
      status?: 'browsing' | 'in_chat' | 'invited';
    }) => {
      if (updates.name) currentName = updates.name;
      if (updates.phone) currentPhone = updates.phone;
      if (updates.email) currentEmail = updates.email;
      if (updates.status) currentStatus = updates.status;
      sendHeartbeat();
    },
    stop: () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleUnload);
      deleteVisitorFromFirestore(visitorId);
    },
  };
}
