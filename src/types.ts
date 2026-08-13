export type UserRole = 'customer' | 'agent' | 'system' | 'bot';

export type ChatStatus = 'unassigned' | 'active' | 'waiting' | 'resolved';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderRole: UserRole;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isInternalNote?: boolean;
  attachments?: {
    name: string;
    url: string;
    type: 'image' | 'file';
    size?: string;
  }[];
  quickReplies?: string[];
  readStatus?: 'sent' | 'delivered' | 'read';
  createdAt?: string;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: string;
  ipAddress?: string;
  browser?: string;
  os?: string;
  currentPageUrl?: string;
  timeOnSite?: string;
  visitsCount?: number;
  tags?: string[];
  notes?: string;
  customData?: Record<string, string>;
}

export interface ChatSession {
  id: string;
  customerId: string;
  customer: CustomerInfo;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentAvatar?: string;
  department: string;
  status: ChatStatus;
  priority: Priority;
  subject?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCountCustomer: number;
  unreadCountAgent: number;
  isStarred?: boolean;
  satisfactionRating?: number; // 1 to 5
  satisfactionFeedback?: string;
  isBlocked?: boolean;
}

export interface BlockedUser {
  id: string;
  chatId?: string;
  phone?: string;
  ipAddress?: string;
  customerName?: string;
  reason?: string;
  blockedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'Super Admin' | 'Admin' | 'Agent';
  email?: string;
  department?: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'Agent' | 'Lead' | 'Admin' | string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  department: string;
  activeChatsCount: number;
}

export interface CannedResponse {
  id: string;
  shortcut: string; // e.g. "/pricing"
  title: string;
  content: string;
  category: string;
}

export interface LiveVisitor {
  id: string;
  name: string;
  email?: string;
  location: string;
  currentPage: string;
  timeOnPage: string;
  device: string;
  ip: string;
  referrer: string;
  status: 'browsing' | 'in_chat' | 'invited';
}

export interface WidgetConfig {
  primaryColor: string;
  headerTitle: string;
  welcomeMessage: string;
  botName: string;
  botAvatar: string;
  position: 'bottom-right' | 'bottom-left';
  requirePreChatForm: boolean;
  enableAiAutoReply: boolean;
  aiSystemPrompt: string;
  departments: string[];
  appsScriptUrl?: string;
  websiteUrl?: string;
}
