import { ChatSession, ChatMessage, Agent, CannedResponse, LiveVisitor, WidgetConfig } from '../types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent_1',
    name: 'আরিফ রহমান',
    email: 'arif@support.bd',
    role: 'লিড সাপোর্ট',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    department: 'গ্রাহক সহায়তা (Customer Support)',
    activeChatsCount: 2
  },
  {
    id: 'agent_2',
    name: 'তানভীর আহমেদ',
    email: 'tanvir@support.bd',
    role: 'সাপোর্ট এজেন্ট',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    department: 'কারিগরি সেলস (Technical Sales)',
    activeChatsCount: 1
  },
  {
    id: 'agent_3',
    name: 'ফারহানা ইসলাম',
    email: 'farhana@support.bd',
    role: 'সাপোর্ট এজেন্ট',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'away',
    department: 'বিলিং ও পেমেন্ট (Billing)',
    activeChatsCount: 0
  }
];

export const INITIAL_WIDGET_CONFIG: WidgetConfig = {
  primaryColor: '#2563eb', // Blue-600
  headerTitle: 'লাইভ সাপোর্ট চ্যাট',
  welcomeMessage: '👋 আসসালামু আলাইকুম! আপনাকে কীভাবে সাহায্য করতে পারি?',
  botName: 'নোভা এআই সহকারী',
  botAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  position: 'bottom-right',
  requirePreChatForm: true,
  enableAiAutoReply: false,
  aiSystemPrompt: 'আপনি নোভা সাপোর্ট সেন্টারের একজন বিনয়ী ও সহায়ক এআই অ্যাসিস্ট্যান্ট। বাংলায় অত্যন্ত প্রাঞ্জল ও দ্রুত উত্তর প্রদান করুন।',
  departments: ['গ্রাহক সহায়তা (Customer Support)', 'কারিগরি সেলস (Technical Sales)', 'বিলিং ও পেমেন্ট (Billing)', 'সাধারণ জিজ্ঞাসা (General)'],
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbwc3JsSAxjiMaln2A713d9TT0NZ3YQGIebEXrXIu8AgeLUGOWNMoJar_PihP2laJvFr/exec',
  websiteUrl: 'https://live-chat-swart-nine.vercel.app/',
  telegramBotToken: '',
  telegramChatId: '',
  telegramNotificationsEnabled: true
};

export const INITIAL_CANNED_RESPONSES: CannedResponse[] = [
  {
    id: 'canned_1',
    shortcut: '/greeting',
    title: 'স্বাগতম বার্তা',
    content: 'আসসালামু আলাইকুম! আমাদের লাইভ চ্যাটে আপনাকে স্বাগতম। আমি কীভাবে আপনাকে সাহায্য করতে পারি?',
    category: 'সাধারণ'
  },
  {
    id: 'canned_2',
    shortcut: '/pricing',
    title: 'প্রাইসিং ও প্যাকেজ তথ্য',
    content: 'আমাদের সার্ভিস প্যাকেজ ও মূল্য তালিকা দেখার জন্য অনুগ্রহ করে এই লিংকে ক্লিক করুন: https://example.com/pricing। আপনার পছন্দমত প্যাকেজ বেছে নিতে পারেন।',
    category: 'সেলস'
  },
  {
    id: 'canned_3',
    shortcut: '/refund',
    title: 'রিফান্ড ও ফেরত নীতি',
    content: 'আমাদের ১৪ দিনের ক্যাশব্যাক গ্যারান্টি রয়েছে। আপনার অর্ডার নম্বর বা ট্রানজেকশন আইডি প্রদান করলে দ্রুত রিফান্ড রিকোয়েস্ট প্রসেস করা হবে।',
    category: 'বিলিং'
  },
  {
    id: 'canned_4',
    shortcut: '/closing',
    title: 'ধন্যবাদান্তে চ্যাট সমাপ্তি',
    content: 'আপনাকে ধন্যবাদ! আপনার অন্য যেকোনো প্রয়োজনে আমাদের আবার জানাতে পারেন। ভালো থাকবেন!',
    category: 'সাধারণ'
  }
];

export const INITIAL_LIVE_VISITORS: LiveVisitor[] = [
  {
    id: 'vis_101',
    name: 'রাশেদুল করিম',
    email: 'rashel@gmail.com',
    location: 'ঢাকা, বাংলাদেশ',
    currentPage: '/pricing',
    timeOnPage: '৪ মিনিট ১২ সেকেন্ড',
    device: 'Chrome / Windows 11',
    ip: '103.205.132.42',
    referrer: 'Google Search',
    status: 'browsing'
  },
  {
    id: 'vis_102',
    name: 'মেহেদী হাসান',
    email: 'mehedi@yahoo.com',
    location: 'চট্টগ্রাম, বাংলাদেশ',
    currentPage: '/contact',
    timeOnPage: '২ মিনিট ৩০ সেকেন্ড',
    device: 'Safari / iPhone 14 Pro',
    ip: '118.179.22.10',
    referrer: 'Direct Link',
    status: 'browsing'
  },
  {
    id: 'vis_103',
    name: 'তানভীর আহমেদ',
    email: 'tanvir@gmail.com',
    location: 'সিলেট, বাংলাদেশ',
    currentPage: '/features',
    timeOnPage: '১ মিনিট ১৫ সেকেন্ড',
    device: 'Chrome / Android',
    ip: '103.112.54.18',
    referrer: 'Facebook Ads',
    status: 'browsing'
  },
  {
    id: 'vis_104',
    name: 'David Smith',
    email: 'david.smith@techcorp.io',
    location: 'London, UK',
    currentPage: '/enterprise',
    timeOnPage: '৬ মিনিট ৫০ সেকেন্ড',
    device: 'Firefox / macOS',
    ip: '82.165.197.1',
    referrer: 'LinkedIn',
    status: 'in_chat'
  },
  {
    id: 'vis_105',
    name: 'Sarah Jenkins',
    email: 'sarah.j@gmail.com',
    location: 'New York, USA',
    currentPage: '/demo',
    timeOnPage: '৩ মিনিট ১০ সেকেন্ড',
    device: 'Edge / Windows 10',
    ip: '198.51.100.45',
    referrer: 'Google Search',
    status: 'browsing'
  },
  {
    id: 'vis_106',
    name: 'জাহিদ হোসেন',
    email: 'zahid.uae@hotmail.com',
    location: 'Dubai, UAE',
    currentPage: '/support',
    timeOnPage: '৫ মিনিট ২০ সেকেন্ড',
    device: 'Chrome / iPad OS',
    ip: '185.120.12.9',
    referrer: 'Direct Link',
    status: 'invited'
  }
];

export const INITIAL_CHATS: ChatSession[] = [];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};
