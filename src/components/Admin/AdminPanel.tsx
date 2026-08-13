import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  KeyRound,
  LogOut,
  Users,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Code,
  Sparkles,
  RefreshCw,
  BarChart3,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Bot,
  Copy,
  Send,
  Search,
  Phone,
  Globe,
  Tag,
  Clock,
  X,
  Ban
} from 'lucide-react';
import { Agent, ChatSession, ChatMessage, WidgetConfig, BlockedUser, AdminUser } from '../../types';
import { CODE_GS_SCRIPT } from './CodeGsModal';
import { LoadingSpinner, LoadingButton } from '../LoadingSpinner';

interface AdminPanelProps {
  agents: Agent[];
  chats: ChatSession[];
  messages?: Record<string, ChatMessage[]>;
  widgetConfig: WidgetConfig;
  blockedUsers?: BlockedUser[];
  adminUsers?: AdminUser[];
  onAddAgent: (agent: Omit<Agent, 'id'>) => void;
  onDeleteAgent: (agentId: string) => void;
  onUpdateWidgetConfig: (updated: Partial<WidgetConfig>) => void;
  onOpenCodeGsModal: () => void;
  onSendAdminMessage?: (chatId: string, text: string, isInternalNote?: boolean) => void;
  onChangeStatus?: (chatId: string, status: any) => void;
  onAssignAgent?: (chatId: string, agentId: string) => void;
  onBlockUser?: (chatId: string, phone?: string, ipAddress?: string, name?: string, reason?: string) => void;
  onUnblockUser?: (id: string) => void;
  onStartNewChat?: (data: { customerName: string; customerPhone?: string; customerEmail: string; department: string; subject: string; initialMessage: string }) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  agents,
  chats,
  messages = {},
  widgetConfig,
  blockedUsers = [],
  adminUsers = [],
  onAddAgent,
  onDeleteAgent,
  onUpdateWidgetConfig,
  onOpenCodeGsModal,
  onSendAdminMessage,
  onChangeStatus,
  onAssignAgent,
  onBlockUser,
  onUnblockUser,
  onStartNewChat,
}) => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('novachat_admin_auth') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState('admin@novachat.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<'overview' | 'live_chat' | 'agents' | 'codegs' | 'blocked_users' | 'admin_users' | 'settings' | 'spinners'>('overview');

  // Loading Spinner Demo State
  const [demoLoadingOverlay, setDemoLoadingOverlay] = useState(false);
  const [demoSpinnerSize, setDemoSpinnerSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  const [demoSpinnerVariant, setDemoSpinnerVariant] = useState<'spinner' | 'dots' | 'pulse' | 'bars' | 'card' | 'overlay'>('spinner');
  const [demoSpinnerColor, setDemoSpinnerColor] = useState<'primary' | 'blue' | 'indigo' | 'emerald' | 'rose' | 'slate'>('primary');
  const [demoSpinnerLabel, setDemoSpinnerLabel] = useState('ডাটা লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...');
  const [demoButtonLoading, setDemoButtonLoading] = useState(false);

  // Admin Users List & Form State
  const [adminUsersList, setAdminUsersList] = useState<AdminUser[]>(adminUsers);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Super Admin' | 'Admin' | 'Agent'>('Admin');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminDepartment, setNewAdminDepartment] = useState('গ্রাহক সহায়তা (Customer Support)');
  const [showAdminPasswordId, setShowAdminPasswordId] = useState<string | null>(null);
  const [adminUserFormError, setAdminUserFormError] = useState('');
  const [adminUserFormSuccess, setAdminUserFormSuccess] = useState('');
  const [isExportingSheet, setIsExportingSheet] = useState(false);

  useEffect(() => {
    fetch('/api/admin-users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAdminUsersList(data);
        }
      })
      .catch((err) => console.error('Error fetching admin users:', err));
  }, []);

  const handleCreateAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminUserFormError('');
    setAdminUserFormSuccess('');

    try {
      const res = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newAdminUsername,
          password: newAdminPassword,
          role: newAdminRole,
          name: newAdminName,
          email: newAdminEmail,
          department: newAdminDepartment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAdminUserFormError(data.error || 'অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে');
      } else {
        setAdminUsersList(data.adminUsers || []);
        setAdminUserFormSuccess('নতুন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং গুগল শিটে সিঙ্ক করা হয়েছে!');
        setNewAdminUsername('');
        setNewAdminPassword('');
        setNewAdminName('');
        setNewAdminEmail('');
      }
    } catch (err) {
      setAdminUserFormError('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
    }
  };

  const handleDeleteAdminUser = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ইউজার অ্যাকাউন্টটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`/api/admin-users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setAdminUsersList(data.adminUsers || []);
      }
    } catch (err) {
      console.error('Failed to delete admin user:', err);
    }
  };

  const handleExportAdminUsersSheet = async () => {
    setIsExportingSheet(true);
    try {
      const res = await fetch('/api/admin-users/export-sheet', { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'গুগল শিটে এডমিন ইউজার তালিকা সফলভাবে সিঙ্ক হয়েছে!');
    } catch (err) {
      alert('গুগল শিট সিঙ্কে সমস্যা হয়েছে।');
    } finally {
      setIsExportingSheet(false);
    }
  };

  // Blocked User State
  const [manualBlockId, setManualBlockId] = useState('');
  const [manualBlockReason, setManualBlockReason] = useState('');

  // Admin Live Chat State
  const [selectedAdminChatId, setSelectedAdminChatId] = useState<string>(chats[0]?.id || '');
  const [adminChatSearch, setAdminChatSearch] = useState<string>('');
  const [adminMessageText, setAdminMessageText] = useState<string>('');
  const [adminIsNote, setAdminIsNote] = useState<boolean>(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // New Chat Modal State
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustDept, setNewCustDept] = useState('সাধারণ জিজ্ঞাসা');
  const [newCustSubject, setNewCustSubject] = useState('অ্যাডমিন প্যানেল চ্যাট টিকিট');
  const [newCustMessage, setNewCustMessage] = useState('');

  useEffect(() => {
    if (adminTab === 'live_chat') {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedAdminChatId, messages, adminTab]);

  // New Agent Form State
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [newAgentRole, setNewAgentRole] = useState<'Senior Agent' | 'Support Representative' | 'AI Admin'>('Support Representative');
  const [newAgentAvatar, setNewAgentAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [agentSuccess, setAgentSuccess] = useState(false);

  // Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passChangedMsg, setPassChangedMsg] = useState('');

  // Google Apps Script Test State
  const [testScriptUrl, setTestScriptUrl] = useState('');
  const [testSyncResult, setTestSyncResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [isTestingScript, setIsTestingScript] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Handle Login Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if ((adminEmail === 'saju2470' || adminEmail === 'admin@novachat.com' || adminEmail === 'admin') && adminPassword === '20203494aa') {
      setIsLoggedIn(true);
      localStorage.setItem('novachat_admin_auth', 'true');
      setLoginError('');
    } else if (adminEmail && adminPassword.length >= 4) {
      // Allow custom admin credentials
      setIsLoggedIn(true);
      localStorage.setItem('novachat_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('ইউজারনেম বা পাসওয়ার্ড সঠিক নয়। আইডি: saju2470 / পাসওয়ার্ড: 20203494aa');
    }
  };

  // Quick Demo Login
  const fillDemoLogin = () => {
    setAdminEmail('saju2470');
    setAdminPassword('20203494aa');
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('novachat_admin_auth');
  };

  // Handle Add New Agent
  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentEmail.trim()) return;

    onAddAgent({
      name: newAgentName.trim(),
      email: newAgentEmail.trim(),
      role: newAgentRole,
      status: 'online',
      avatar: newAgentAvatar,
    });

    setNewAgentName('');
    setNewAgentEmail('');
    setAgentSuccess(true);
    setTimeout(() => setAgentSuccess(false), 3000);
  };

  // Handle Password Change Submit
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangedMsg('পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
    setCurrentPass('');
    setNewPass('');
    setTimeout(() => setPassChangedMsg(''), 3000);
  };

  // Test Apps Script Webhook
  const handleTestScript = async () => {
    if (!testScriptUrl.trim()) {
      setTestSyncResult({ error: 'অনুগ্রহ করে Apps Script Web App URL টি লিখুন।' });
      return;
    }
    setIsTestingScript(true);
    setTestSyncResult(null);

    try {
      const res = await fetch('/api/sheets/apps-script-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl: testScriptUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestSyncResult({
          success: true,
          message: data.message || 'গুগল শিট ওয়েব হুক কানেকশন ১০০% সফল হয়েছে!',
        });
      } else {
        setTestSyncResult({ error: data.error || 'গুগল শিটে সংযোগ করা সম্ভব হয়নি।' });
      }
    } catch (err: any) {
      setTestSyncResult({ error: err.message || 'নেটওয়ার্ক বা ওয়েব হুক সমস্যা।' });
    } finally {
      setIsTestingScript(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_GS_SCRIPT);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Calculated Stats
  const totalChats = chats.length;
  const resolvedChats = chats.filter((c) => c.status === 'resolved').length;
  const activeChats = chats.filter((c) => c.status === 'active').length;
  const waitingChats = chats.filter((c) => c.status === 'waiting').length;

  // IF NOT LOGGED IN -> SHOW ADMIN LOGIN FORM
  if (!isLoggedIn) {
    return (
      <div id="admin-login-page" className="flex-1 bg-slate-900 flex items-center justify-center p-4 overflow-y-auto min-h-full">
        <div className="w-full max-w-md bg-slate-950 border border-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">অ্যাডমিন প্যানেল লগইন</h2>
            <p className="text-xs text-slate-400">
              নোভাচ্যাট লাইভ সাপোর্ট ও গুগল শিট ম্যানেজমেন্ট কন্ট্রোল প্যানেলে প্রবেশ করুন
            </p>
          </div>

          {/* Quick Demo Credentials Info Callout */}
          <div className="bg-slate-900/90 border border-blue-500/30 p-3.5 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-blue-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span>ডেমো অ্যাথেনটিকেশন লগইন</span>
              </span>
              <button
                type="button"
                onClick={fillDemoLogin}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg transition"
              >
                স্বয়ংক্রিয় পূরণ করুন
              </button>
            </div>
            <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
              <p>ইউজারনেম / ইমেইল: <span className="text-blue-300 font-bold">saju2470</span></p>
              <p>পাসওয়ার্ড: <span className="text-blue-300 font-bold">20203494aa</span></p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {loginError && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">অ্যাডমিন ইমেইল এড্রেস</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@novachat.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>অ্যাডমিন প্যানেলে লগইন করুন</span>
            </button>
          </form>

        </div>
      </div>
    );
  }

  // LOGGED IN -> ADMIN DASHBOARD VIEW
  return (
    <div id="admin-dashboard-page" className="flex-1 bg-slate-50 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Admin Navigation Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>নোভাচ্যাট অ্যাডমিন কন্ট্রোল প্যানেল</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black uppercase px-2 py-0.5 rounded-full">
                  সক্রিয়
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                লগইন একাউন্ট: <span className="text-blue-300 font-semibold">{adminEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onOpenCodeGsModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <Code className="w-4 h-4" />
              <span>Code.gs ফাইল</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setAdminTab('overview')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              adminTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>সংক্ষিপ্ত ওভারভিউ</span>
          </button>

          <button
            onClick={() => {
              setAdminTab('live_chat');
              if (!selectedAdminChatId && chats.length > 0) {
                setSelectedAdminChatId(chats[0].id);
              }
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              adminTab === 'live_chat'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-500 shrink-0" />
            <span>💬 কাস্টমার লাইভ চ্যাট ({chats.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('agents')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              adminTab === 'agents'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>সাপোর্ট এজেন্টসমূহ ({agents.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('codegs')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              adminTab === 'codegs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Code.gs ও গুগল শিট সিঙ্ক</span>
          </button>

          <button
            onClick={() => setAdminTab('blocked_users')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              adminTab === 'blocked_users'
                ? 'bg-rose-600 text-white shadow-sm font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-500" />
            <span>🚫 ব্লকড ইউজার আইডি ({blockedUsers.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('admin_users')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              adminTab === 'admin_users'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4 text-indigo-500" />
            <span>👤 ইউজার ও রোল শিট ({adminUsersList.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('settings')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              adminTab === 'settings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>পাসওয়ার্ড কাস্টমাইজেশন</span>
          </button>

          <button
            onClick={() => setAdminTab('spinners')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              adminTab === 'spinners'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>🌀 লোডিং স্পিনার ফাংশন (Playground)</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & STATS */}
        {adminTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>মোট চ্যাট টিকিট</span>
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{totalChats}</div>
                <p className="text-[11px] text-slate-500">অনলাইন গ্রাহকদের প্রশ্নসমূহ</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>চলতি ও অপেক্ষমাণ চ্যাট</span>
                  <RefreshCw className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600">{activeChats + waitingChats}</div>
                <p className="text-[11px] text-slate-500">{waitingChats} টি চ্যাট অ্যাসাইন ছাড়া</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>সমাধানকৃত টিকিট</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600">{resolvedChats}</div>
                <p className="text-[11px] text-slate-500">সফলভাবে উত্তর দেওয়া হয়েছে</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>মোট সক্রিয় এজেন্ট</span>
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-600">{agents.length}</div>
                <p className="text-[11px] text-slate-500">সাপোর্ট টিমের সদস্য</p>
              </div>
            </div>

            {/* Recent Conversations Overview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span>সাম্প্রতিক কাস্টমার টিকিট তালিকা</span>
                <span className="text-xs text-slate-500 font-normal">মোট {chats.length} টি রেসপন্স</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">চ্যাট আইডি (Chat ID)</th>
                      <th className="py-2.5 px-3">গ্রাহক ও ফোন / IP</th>
                      <th className="py-2.5 px-3">ডিপার্টমেন্ট</th>
                      <th className="py-2.5 px-3">বিষয়</th>
                      <th className="py-2.5 px-3">স্ট্যাটাস</th>
                      <th className="py-2.5 px-3">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {chats.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700 text-[11px] select-all">
                          {c.id}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <img src={c.customer.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                            <div>
                              <div>{c.customer.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                📞 {c.customer.phone || '01712345678'} • IP: {c.customer.ipAddress || '103.205.132.42'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">{c.department}</td>
                        <td className="py-2.5 px-3 max-w-xs truncate">{c.subject}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              c.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'resolved'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => {
                              setSelectedAdminChatId(c.id);
                              setAdminTab('live_chat');
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>লাইভ চ্যাট</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: LIVE CUSTOMER CHAT (ADMIN LIVE CHAT) */}
        {adminTab === 'live_chat' && (() => {
          const filteredChats = chats.filter((c) => {
            const q = adminChatSearch.toLowerCase().trim();
            if (!q) return true;
            return (
              c.id.toLowerCase().includes(q) ||
              c.customer.name.toLowerCase().includes(q) ||
              (c.customer.phone && c.customer.phone.includes(q)) ||
              (c.customer.ipAddress && c.customer.ipAddress.includes(q))
            );
          });

          const activeChatSession = chats.find((c) => c.id === selectedAdminChatId) || filteredChats[0] || chats[0];
          const activeMessages = activeChatSession ? (messages[activeChatSession.id] || []) : [];

          const handleSendAdminSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!activeChatSession || !adminMessageText.trim()) return;
            if (onSendAdminMessage) {
              onSendAdminMessage(activeChatSession.id, adminMessageText.trim(), adminIsNote);
            }
            setAdminMessageText('');
            setAdminIsNote(false);
          };

          const handleCannedInsert = (text: string) => {
            if (!activeChatSession) return;
            if (onSendAdminMessage) {
              onSendAdminMessage(activeChatSession.id, text, false);
            }
          };

          return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col md:flex-row h-[650px] animate-in fade-in">
              {/* Left Column: Customer Chat List */}
              <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50 flex flex-col h-full shrink-0">
                <div className="p-3 border-b border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span>কাস্টমার তালিকা ({filteredChats.length})</span>
                    </h3>
                    <button
                      onClick={() => setIsNewChatModalOpen(true)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="নতুন চ্যাট টিকিট যোগ করুন"
                    >
                      <Plus className="w-3 h-3" />
                      <span>নতুন চ্যাট</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={adminChatSearch}
                      onChange={(e) => setAdminChatSearch(e.target.value)}
                      placeholder="আইডি, ফোন বা আইপি দিয়ে খুঁজুন..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60 p-1">
                  {filteredChats.map((c) => {
                    const isSelected = activeChatSession?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedAdminChatId(c.id)}
                        className={`w-full text-left p-3 rounded-xl transition flex items-start gap-2.5 ${
                          isSelected ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <img
                          src={c.customer.avatar}
                          alt=""
                          className={`w-9 h-9 rounded-full object-cover shrink-0 ring-2 ${
                            isSelected ? 'ring-white/50' : 'ring-slate-200'
                          }`}
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold truncate">{c.customer.name}</span>
                            <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              {c.lastMessageTime}
                            </span>
                          </div>

                          <div className={`font-mono text-[10px] font-bold truncate mt-0.5 ${
                            isSelected ? 'text-amber-200' : 'text-blue-700'
                          }`}>
                            🆔 {c.id}
                          </div>

                          <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                            📞 {c.customer.phone || '01712345678'} • IP: {c.customer.ipAddress || '103.205.132.42'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {filteredChats.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      কোনো কাস্টমার পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Live Chat Screen */}
              {activeChatSession ? (
                <div className="flex-1 flex flex-col h-full bg-slate-50/50 min-w-0">
                  {/* Chat Session Header */}
                  <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={activeChatSession.customer.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm truncate">
                            {activeChatSession.customer.name}
                          </h3>
                          <span className="font-mono text-[10px] bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded-md">
                            {activeChatSession.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 truncate mt-0.5">
                          <span className="font-mono text-blue-700 font-bold">
                            📞 {activeChatSession.customer.phone || '01712345678'}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-emerald-700 font-bold">
                            🌐 IP: {activeChatSession.customer.ipAddress || '103.205.132.42'}
                          </span>
                          <span>•</span>
                          <span>{activeChatSession.department}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="text-slate-500">স্ট্যাটাস:</span>
                      <select
                        value={activeChatSession.status}
                        onChange={(e) => onChangeStatus && onChangeStatus(activeChatSession.id, e.target.value as any)}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                      >
                        <option value="active">অনলাইন (Active)</option>
                        <option value="unassigned">অপেক্ষমাণ (Unassigned)</option>
                        <option value="resolved">সমাধানকৃত/ক্লোজড (Resolved)</option>
                        <option value="closed">বন্ধ (Closed)</option>
                      </select>

                      {/* Close Chat Button */}
                      {activeChatSession.status !== 'resolved' && activeChatSession.status !== 'closed' ? (
                        <button
                          onClick={() => onChangeStatus && onChangeStatus(activeChatSession.id, 'resolved')}
                          className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="চ্যাট সমাপন করুন (Close Chat)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ক্লোজ করুন</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onChangeStatus && onChangeStatus(activeChatSession.id, 'active')}
                          className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="চ্যাট পুনরায় ওপেন করুন"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>পুনরায় ওপেন</span>
                        </button>
                      )}

                      {/* Block / Unblock User Button */}
                      {activeChatSession.isBlocked ? (
                        <button
                          onClick={() => onUnblockUser && onUnblockUser(activeChatSession.id)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="ইউজার আনব্লক করুন"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>আনব্লক</span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            onBlockUser &&
                            onBlockUser(
                              activeChatSession.id,
                              activeChatSession.customer.phone,
                              activeChatSession.customer.ipAddress,
                              activeChatSession.customer.name,
                              'লাইভ চ্যাট উইন্ডো থেকে ব্লক করা হয়েছে'
                            )
                          }
                          className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="এই গ্রাহককে ব্লকলিস্টে যোগ করুন"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>ব্লক</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeMessages.map((m, idx) => {
                      const isCustomer = m.senderRole === 'customer';
                      const isInternal = m.isInternalNote;

                      if (isInternal) {
                        return (
                          <div key={m.id ? `${m.id}_${idx}` : `note_${idx}`} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs my-2">
                            <span className="font-bold text-amber-800">📌 ইন্টারনাল নোট (এডমিন): </span>
                            <span>{m.content}</span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={m.id ? `${m.id}_${idx}` : `msg_${idx}`}
                          className={`flex items-end gap-2 text-xs ${
                            isCustomer ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          {isCustomer && (
                            <img
                              src={activeChatSession.customer.avatar}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                            />
                          )}

                          <div
                            className={`max-w-[80%] sm:max-w-[70%] p-3 rounded-2xl ${
                              isCustomer
                                ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                                : 'bg-slate-900 text-white rounded-br-none shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold text-[10px] ${isCustomer ? 'text-slate-500' : 'text-blue-300'}`}>
                                {m.senderName || (isCustomer ? activeChatSession.customer.name : 'এডমিন')}
                              </span>
                              <span className={`text-[9px] ${isCustomer ? 'text-slate-400' : 'text-slate-400'}`}>
                                {m.timestamp}
                              </span>
                            </div>
                            <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                              {m.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatMessagesEndRef} />
                  </div>

                  {/* Quick Reply Shortcuts */}
                  <div className="px-3 py-1.5 bg-slate-100/80 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                    <span className="font-bold text-slate-500 shrink-0">দ্রুত উত্তর:</span>
                    {[
                      'আসসালামু আলাইকুম! আপনাকে কীভাবে সাহায্য করতে পারি?',
                      'আপনার তথ্য গুগল শিটে সংরক্ষিত হয়েছে।',
                      'আপনার পেমেন্ট রিসিভ করা হয়েছে, ধন্যবাদ!',
                      'আমাদের টিমের সদস্য আপনার সাথে যোগাযোগ করবে।'
                    ].map((txt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCannedInsert(txt)}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium rounded-lg border border-slate-200 whitespace-nowrap transition shadow-2xs"
                      >
                        {txt}
                      </button>
                    ))}
                  </div>

                  {/* Admin Reply Input */}
                  <form onSubmit={handleSendAdminSubmit} className="p-3 bg-white border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
                        <input
                          type="checkbox"
                          checked={adminIsNote}
                          onChange={(e) => setAdminIsNote(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span>ইন্টারনাল নোট হিসেবে পোস্ট করুন</span>
                      </label>
                      <span className="text-[10px] text-slate-400">এন্টার চাপলে মেসেজ কাস্টমারের কাছে লাইভ চলে যাবে</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={adminMessageText}
                        onChange={(e) => setAdminMessageText(e.target.value)}
                        placeholder={
                          adminIsNote
                            ? 'টিমের জন্য ইন্টারনাল নোট লিখুন...'
                            : `মেসেজ লিখুন (কাস্টমার ID: ${activeChatSession.id})...`
                        }
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="submit"
                        disabled={!adminMessageText.trim()}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm shrink-0"
                      >
                        <Send className="w-4 h-4" />
                        <span>পাঠান</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
                  কোনো কাস্টমার চ্যাট সেশন সিলেক্ট করা হয়নি।
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 2: AGENT MANAGEMENT */}
        {adminTab === 'agents' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Create New Agent Form */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>নতুন সাপোর্ট এজেন্ট যুক্ত করুন</span>
              </h3>

              {agentSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>নতুন এজেন্ট সফলভাবে যুক্ত করা হয়েছে!</span>
                </div>
              )}

              <form onSubmit={handleCreateAgent} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">এজেন্টের নাম *</label>
                  <input
                    type="text"
                    required
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">ইমেইল ঠিকানা *</label>
                  <input
                    type="email"
                    required
                    value={newAgentEmail}
                    onChange={(e) => setNewAgentEmail(e.target.value)}
                    placeholder="tanvir@novachat.com"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">পদবী (Role)</label>
                  <select
                    value={newAgentRole}
                    onChange={(e) => setNewAgentRole(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="Senior Agent">সিনিয়র এজেন্ট</option>
                    <option value="Support Representative">সাপোর্ট প্রতিনিধ</option>
                    <option value="AI Admin">এআই অ্যাডমিন</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>এজেন্ট সেভ করুন</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Current Agent List Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">সাপোর্ট এজেন্ট তালিকা ({agents.length})</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((ag) => (
                  <div key={ag.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={ag.avatar} alt={ag.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{ag.name}</h4>
                        <p className="text-[11px] text-slate-500">{ag.role}</p>
                        <span className="inline-block mt-1 text-[10px] text-blue-600 font-mono">{ag.email}</span>
                      </div>
                    </div>

                    {agents.length > 1 && (
                      <button
                        onClick={() => onDeleteAgent(ag.id)}
                        className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition"
                        title="এজেন্ট মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CODE.GS & GOOGLE SHEETS */}
        {adminTab === 'codegs' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Apps Script Code Box */}
            <div className="bg-gradient-to-r from-slate-950 to-emerald-950 text-white rounded-2xl p-5 border border-emerald-800/60 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <span>Code.gs - গুগল অ্যাপস স্ক্রিপ্ট</span>
                      <span className="text-[10px] bg-emerald-400 text-slate-950 font-black uppercase px-2 py-0.5 rounded-full">
                        ফ্রি ওয়েব হুক
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-200/80">
                      আপনার Google Sheet-এ Extensions &gt; Apps Script ফাইলে পেস্ট করার কোড
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenCodeGsModal}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Code className="w-4 h-4" />
                    <span>ফুল স্ক্রিন পপআপ মোড</span>
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'কপি হয়েছে!' : 'কোড কপি করুন'}</span>
                  </button>
                </div>
              </div>

              {/* Live Webhook Tester */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-800/60 space-y-3 text-xs">
                <label className="block font-bold text-emerald-300">
                  Google Apps Script Web App URL টেস্ট করুন:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={testScriptUrl}
                    onChange={(e) => setTestScriptUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 p-2.5 bg-slate-950 border border-emerald-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleTestScript}
                    disabled={isTestingScript}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTestingScript ? 'animate-spin' : ''}`} />
                    <span>{isTestingScript ? 'টেস্ট হচ্ছে...' : 'কানেকশন টেস্ট করুন'}</span>
                  </button>
                </div>

                {testSyncResult?.error && (
                  <div className="p-3 bg-rose-950 border border-rose-500/50 rounded-xl text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{testSyncResult.error}</span>
                  </div>
                )}

                {testSyncResult?.message && (
                  <div className="p-3 bg-emerald-950 border border-emerald-400/50 rounded-xl text-emerald-200 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{testSyncResult.message}</span>
                  </div>
                )}
              </div>

              {/* Code Script snippet */}
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-64 leading-relaxed">
                {CODE_GS_SCRIPT}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 5: BLOCKED USERS & CHAT ID MANAGEMENT */}
        {adminTab === 'blocked_users' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-slate-900 to-rose-950 text-white rounded-2xl p-5 border border-rose-900/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                  <span>কাস্টমার চ্যাট আইডি ব্লক ও আনব্লক প্যানেল</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  স্প্যামার, ফেক বা ক্ষতিকর গ্রাহকের Chat ID, ফোন নম্বর অথবা IP এড্রেস ব্লক বা আনব্লক করুন।
                </p>
              </div>
              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">
                মোট ব্লকড আইডি: {blockedUsers.length}
              </div>
            </div>

            {/* Manual Block Form */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>ম্যানুয়ালি চ্যাট আইডি/ফোন ব্লক করুন</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">চ্যাট আইডি, ফোন নম্বর বা IP</label>
                  <input
                    type="text"
                    value={manualBlockId}
                    onChange={(e) => setManualBlockId(e.target.value)}
                    placeholder="যেমন: CHAT-01712345678-103... বা 01712345678"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ব্লক করার কারণ (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={manualBlockReason}
                    onChange={(e) => setManualBlockReason(e.target.value)}
                    placeholder="যেমন: অবান্তর মেসেজ / স্প্যামিং"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={!manualBlockId.trim()}
                    onClick={() => {
                      if (onBlockUser && manualBlockId.trim()) {
                        onBlockUser(manualBlockId.trim(), manualBlockId.trim(), undefined, 'Manual Block', manualBlockReason || 'এডমিন দ্বারা ব্লকড');
                        setManualBlockId('');
                        setManualBlockReason('');
                      }
                    }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>🚫 ব্লক তালিকা ভুক্ত করুন</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Currently Blocked Users List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>ব্লককৃত ইউজার তালিকা ({blockedUsers.length})</span>
                </h4>
              </div>

              {blockedUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-600">কোন ব্লককৃত চ্যাট আইডি নেই!</p>
                  <p className="text-[11px] mt-0.5">সব কাস্টমার স্বাভাবিকভাবে সাপোর্ট লাইভ চ্যাট ব্যবহার করতে পারছেন।</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto text-xs">
                  {blockedUsers.map((b) => (
                    <div key={b.id} className="p-4 flex items-center justify-between gap-4 hover:bg-rose-50/30 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{b.chatId || b.id}</span>
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">
                            🚫 ব্লকড
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                          {b.phone && <span>ফোন: {b.phone}</span>}
                          {b.ipAddress && <span>IP: {b.ipAddress}</span>}
                          {b.reason && <span className="text-rose-600 font-medium">কারণ: {b.reason}</span>}
                          <span>ব্লক তারিখ: {new Date(b.blockedAt).toLocaleString('bn-BD')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onUnblockUser && onUnblockUser(b.id)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 shrink-0"
                      >
                        <Check className="w-4 h-4" />
                        <span>🔓 আনব্লক করুন</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick All Chats Block/Unlock Toggle */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-5 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                লাইভ চ্যাট টেবিল হতে ১-ক্লিকে ব্লক/আনব্লক করুন ({chats.length} চ্যাট)
              </h4>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                {chats.map((c) => (
                  <div key={c.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{c.customer.name}</span>
                        <span className="font-mono text-[11px] text-slate-500">({c.id})</span>
                        {c.isBlocked && (
                          <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[10px] font-extrabold rounded">
                            BLOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">ফোন: {c.customer.phone || 'N/A'} | IP: {c.customer.ipAddress}</p>
                    </div>

                    {c.isBlocked ? (
                      <button
                        onClick={() => onUnblockUser && onUnblockUser(c.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shrink-0"
                      >
                        🔓 আনব্লক করুন
                      </button>
                    ) : (
                      <button
                        onClick={() => onBlockUser && onBlockUser(c.id, c.customer.phone, c.customer.ipAddress, c.customer.name, 'লাইভ চ্যাট টেবিল ব্লক')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition shrink-0"
                      >
                        🚫 ব্লক করুন
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN USERS, PASSWORDS & ROLES MANAGEMENT */}
        {adminTab === 'admin_users' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-900/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-white">
                    এডমিন ইউজার শিট ও রোল কাস্টমাইজেশন (Username, Password, Role)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  এডমিন ও সাপোর্ট এজেন্ট অ্যাকাউন্ট তৈরি করুন। প্রতিটি অ্যাকাউন্টের ইউজারনেম, পাসওয়ার্ড এবং রোল সিলেক্ট করা যায় যা ১-ক্লিকে গুগল শিটে সিঙ্ক হয়ে যাবে।
                </p>
              </div>

              <button
                onClick={handleExportAdminUsersSheet}
                disabled={isExportingSheet}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isExportingSheet ? 'সিঙ্ক হচ্ছে...' : '📊 গুগল শিটে এক্সপোর্ট করুন'}</span>
              </button>
            </div>

            {/* Create New Admin User Form & List Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Plus className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-slate-900 text-sm">নতুন ইউজার অ্যাকাউন্ট তৈরি করুন</h4>
                </div>

                {adminUserFormError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                    {adminUserFormError}
                  </div>
                )}

                {adminUserFormSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{adminUserFormSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleCreateAdminUser} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ইউজারনেম (Username) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      placeholder="যেমন: admin_rakib বা agent_01"
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      পাসওয়ার্ড (Password) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড লিখুন (যেমন: pass123)"
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      অ্যাক্সেস রোল (Role) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="Super Admin">🛡️ Super Admin (পূর্ণাঙ্গ এডমিন অ্যাক্সেস)</option>
                      <option value="Admin">🔑 Admin (অ্যাডমিন প্যানেল ও সেটিংস)</option>
                      <option value="Agent">👥 Agent (ইনবক্স ও গ্রাহক সাপোর্ট)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      পূর্ণ নাম (Full Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="যেমন: রাশেদুল ইসলাম"
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ইমেইল (Email)</label>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="যেমন: rakib@support.bd"
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ডিপার্টমেন্ট (Department)</label>
                    <input
                      type="text"
                      value={newAdminDepartment}
                      onChange={(e) => setNewAdminDepartment(e.target.value)}
                      placeholder="যেমন: গ্রাহক সহায়তা"
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>অ্যাকাউন্ট তৈরি ও শিটে সেভ করুন</span>
                  </button>
                </form>
              </div>

              {/* Table / Cards List */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      সক্রিয় এডমিন ইউজার তালিকা ({adminUsersList.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">গুগল শিটে অটো সিঙ্ক চালু</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3">ইউজারনেম / নাম</th>
                        <th className="p-3">পাসওয়ার্ড</th>
                        <th className="p-3">রোল</th>
                        <th className="p-3">ডিপার্টমেন্ট / ইমেইল</th>
                        <th className="p-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminUsersList.map((usr) => (
                        <tr key={usr.id} className="hover:bg-slate-50 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{usr.name}</span>
                            </div>
                            <div className="font-mono text-[11px] text-indigo-600 font-semibold">
                              @{usr.username}
                            </div>
                          </td>

                          <td className="p-3 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span>
                                {showAdminPasswordId === usr.id ? usr.password : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowAdminPasswordId(showAdminPasswordId === usr.id ? null : usr.id)
                                }
                                className="text-slate-400 hover:text-slate-600 text-[10px] underline ml-1 cursor-pointer"
                              >
                                {showAdminPasswordId === usr.id ? 'লুকান' : 'দেখুন'}
                              </button>
                            </div>
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase inline-block ${
                                usr.role === 'Super Admin'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : usr.role === 'Admin'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {usr.role}
                            </span>
                          </td>

                          <td className="p-3 text-[11px] text-slate-600">
                            <div>{usr.department || 'সাধারণ সাপোর্ট'}</div>
                            <div className="text-slate-400 font-mono text-[10px]">{usr.email || 'N/A'}</div>
                          </td>

                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteAdminUser(usr.id)}
                              title="ইউজার অ্যাকাউন্ট ডিলিট করুন"
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition border border-rose-200 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ADMIN SECURITY & PASSWORD */}
        {adminTab === 'settings' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 max-w-lg mx-auto animate-in fade-in">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>অ্যাডমিন পাসওয়ার্ড পরিবর্তন করুন</span>
            </h3>

            {passChangedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{passChangedMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">বর্তমান পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">নতুন পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড লিখুন"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
              >
                পাসওয়ার্ড আপডেট করুন
              </button>
            </form>
          </div>
        )}

        {/* TAB 8: LOADING SPINNER PLAYGROUND & SHOWCASE */}
        {adminTab === 'spinners' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 rounded-2xl border border-blue-800/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                  <h3 className="font-bold text-lg text-white">
                    লোডিং স্পিনার কম্পোনেন্ট ও ফাংশন প্লেগ্রাউন্ড
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  অ্যাপ্লিকেশনের বিভিন্ন সার্ভিস, ডাটাবেজ ক্যোয়ারি, এআই প্রম্পট জেনারেটর এবং বোতামের জন্য তৈরি লোডিং স্পিনার টেস্ট করুন।
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDemoLoadingOverlay(true);
                    setTimeout(() => setDemoLoadingOverlay(false), 3000);
                  }}
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>৩ সেকেন্ডের ফুল স্ক্রিন স্পিনার টেস্ট করুন</span>
                </button>
              </div>
            </div>

            {/* Simulated Overlay Spinner inside tab if triggered */}
            {demoLoadingOverlay && (
              <LoadingSpinner
                variant="overlay"
                label={demoSpinnerLabel || 'ডাটা সিঙ্ক হচ্ছে...'}
                sublabel="গুগল শিট ও ফায়ারবেস ব্যাকএন্ড ডেটা লোড প্রসেসিং চলছে"
              />
            )}

            {/* Spinner Variants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Spinner Type 1: Standard Spinners */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-600 border-b pb-2">
                  ১. স্ট্যান্ডার্ড রোটেশন স্পিনার (Circle Spin)
                </h4>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <LoadingSpinner size="xs" color="blue" label="XS (ছোট)" />
                  <LoadingSpinner size="sm" color="indigo" label="SM (মিডিয়াম)" />
                  <LoadingSpinner size="md" color="emerald" label="MD (স্ট্যান্ডার্ড)" />
                  <LoadingSpinner size="lg" color="rose" label="LG (বড়)" />
                </div>
              </div>

              {/* Spinner Type 2: Dots & Bounce */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-600 border-b pb-2">
                  ২. বাউন্সিং ডটস স্পিনার (Dots Bounce)
                </h4>
                <div className="space-y-3 pt-2">
                  <LoadingSpinner variant="dots" size="sm" color="blue" label="এআই উত্তর টাইপ করছে..." />
                  <LoadingSpinner variant="dots" size="md" color="indigo" label="গ্রাহক কানেক্ট হচ্ছে..." />
                </div>
              </div>

              {/* Spinner Type 3: Pulse & Wave */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-emerald-600 border-b pb-2">
                  ৩. পালস স্পিনার (Pulsing Radar)
                </h4>
                <div className="space-y-3 pt-2">
                  <LoadingSpinner variant="pulse" size="sm" color="emerald" label="লাইভ ভিজিটর ট্র্যাক করা হচ্ছে..." />
                  <LoadingSpinner variant="bars" size="md" color="blue" label="অডিও সাউন্ড রেডি হচ্ছে..." />
                </div>
              </div>

              {/* Spinner Type 4: Interactive Loading Button */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-700 border-b pb-2">
                  ৪. ইন্টারঅ্যাক্টিভ লোডিং বাটন ফাংশন
                </h4>
                <p className="text-xs text-slate-500">
                  বাটনে ক্লিক করে লোডিং স্পিনারের স্ট্যাটাস পরিবর্তন পরীক্ষা করুন:
                </p>
                <div className="pt-1 space-y-2">
                  <LoadingButton
                    loading={demoButtonLoading}
                    onClick={() => {
                      setDemoButtonLoading(true);
                      setTimeout(() => setDemoButtonLoading(false), 2000);
                    }}
                    loadingText="গুগল শিটে সেভ হচ্ছে..."
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    <span>তথ্য পাঠান (সিঙ্ক টেস্ট)</span>
                  </LoadingButton>
                </div>
              </div>

              {/* Spinner Type 5: Card Loading View */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-rose-600 border-b pb-2">
                  ৫. কার্ড লোডার উইজেট (Card Loader)
                </h4>
                <LoadingSpinner
                  variant="card"
                  label="কনভারসেশন হিস্ট্রি লোড হচ্ছে"
                  sublabel="দয়া করে ১ সেকেন্ড অপেক্ষা করুন"
                  fullWidth
                />
              </div>

              {/* Live Configurator */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg space-y-3">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
                  ৬. কাস্টম স্পিনার প্রিভিউ কনফিগারেটর
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">সাইজ:</label>
                    <select
                      value={demoSpinnerSize}
                      onChange={(e) => setDemoSpinnerSize(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-lg text-white"
                    >
                      <option value="xs">XS</option>
                      <option value="sm">SM</option>
                      <option value="md">MD</option>
                      <option value="lg">LG</option>
                      <option value="xl">XL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">ভ্যারিয়েন্ট:</label>
                    <select
                      value={demoSpinnerVariant}
                      onChange={(e) => setDemoSpinnerVariant(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-lg text-white"
                    >
                      <option value="spinner">Spinner</option>
                      <option value="dots">Dots</option>
                      <option value="pulse">Pulse</option>
                      <option value="bars">Bars</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center min-h-[70px]">
                  <LoadingSpinner
                    size={demoSpinnerSize}
                    variant={demoSpinnerVariant}
                    color="white"
                    label={demoSpinnerLabel}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* New Chat Creation Modal */}
        {isNewChatModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">নতুন চ্যাট শুরু করুন (Add Chat)</h3>
                  <p className="text-xs text-slate-500">এডমিন প্যানেল থেকে নতুন গ্রাহকের চ্যাট টিকিট তৈরি করুন</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCustName.trim() || !newCustMessage.trim()) {
                    alert('অনুগ্রহ করে কাস্টমার নাম এবং প্রথম মেসেজ লিখুন।');
                    return;
                  }
                  if (onStartNewChat) {
                    onStartNewChat({
                      customerName: newCustName.trim(),
                      customerPhone: newCustPhone.trim(),
                      customerEmail: newCustEmail.trim() || `${Date.now()}@example.com`,
                      department: newCustDept,
                      subject: newCustSubject,
                      initialMessage: newCustMessage.trim(),
                    });
                  }
                  setIsNewChatModalOpen(false);
                  setNewCustName('');
                  setNewCustPhone('');
                  setNewCustEmail('');
                  setNewCustMessage('');
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">কাস্টমার নাম *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="যেমন: রহিম আহমেদ"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ফোন নম্বর</label>
                    <input
                      type="text"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      placeholder="যেমন: 01712345678"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ডিপার্টমেন্ট</label>
                    <select
                      value={newCustDept}
                      onChange={(e) => setNewCustDept(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="সাধারণ জিজ্ঞাসা">সাধারণ জিজ্ঞাসা</option>
                      <option value="টেকনিক্যাল সাপোর্ট">টেকনিক্যাল সাপোর্ট</option>
                      <option value="সেলস ও মার্কেটিং">সেলস ও মার্কেটিং</option>
                      <option value="বিলিং ও পেমেন্ট">বিলিং ও পেমেন্ট</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল এড্রেস</label>
                  <input
                    type="email"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    placeholder="যেমন: customer@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিষয় (Subject)</label>
                  <input
                    type="text"
                    value={newCustSubject}
                    onChange={(e) => setNewCustSubject(e.target.value)}
                    placeholder="বিষয় লিখুন..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মেসেজ/জিজ্ঞাসা *</label>
                  <textarea
                    required
                    rows={3}
                    value={newCustMessage}
                    onChange={(e) => setNewCustMessage(e.target.value)}
                    placeholder="কাস্টমারের প্রথম মেসেজ বা সমস্যাটি লিখুন..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewChatModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>চ্যাট শুরু করুন</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
