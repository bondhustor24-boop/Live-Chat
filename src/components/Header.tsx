import React from 'react';
import {
  MessageSquare,
  Users,
  Settings as SettingsIcon,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff,
  ShieldCheck,
  LogOut,
  KeyRound,
  Bell,
  BellRing
} from 'lucide-react';
import { Agent } from '../types';

interface HeaderProps {
  activeTab: 'widget_preview' | 'agent_workspace' | 'visitors' | 'canned' | 'settings' | 'admin';
  setActiveTab: (tab: 'widget_preview' | 'agent_workspace' | 'visitors' | 'canned' | 'settings' | 'admin') => void;
  isConnected: boolean;
  activeAgent: Agent;
  agents: Agent[];
  onAgentChange: (agentId: string) => void;
  onAgentStatusChange: (status: 'online' | 'away' | 'offline') => void;
  onResetDemo: () => void;
  openEmbedModal: () => void;
  openCodeGsModal: () => void;
  unreadCount: number;
  isAdminLoggedIn: boolean;
  openAdminLoginModal: () => void;
  onAdminLogout: () => void;
  isNotificationEnabled?: boolean;
  onRequestNotificationPermission?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isConnected,
  activeAgent,
  agents,
  onAgentChange,
  onAgentStatusChange,
  onResetDemo,
  openEmbedModal,
  openCodeGsModal,
  unreadCount,
  isAdminLoggedIn,
  openAdminLoginModal,
  onAdminLogout,
  isNotificationEnabled = false,
  onRequestNotificationPermission
}) => {
  return (
    <header id="main-app-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-lg text-slate-100 tracking-tight">নোভাচ্যাট</span>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  লাইভ
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block">লাইভ সাপোর্ট ও গুগল শিট সিস্টেম</p>
            </div>
          </div>

          {/* Navigation Tabs - Mobile Scrollable */}
          <nav className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto no-scrollbar whitespace-nowrap max-w-[50vw] sm:max-w-none">
            {isAdminLoggedIn && (
              <>
                <button
                  id="nav-agent-workspace-btn"
                  onClick={() => setActiveTab('agent_workspace')}
                  className={`relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'agent_workspace'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>এজেন্ট ইনবক্স</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  id="nav-admin-panel-btn"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-bold'
                      : 'text-blue-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>অ্যাডমিন প্যানেল</span>
                </button>

                <button
                  id="nav-settings-btn"
                  onClick={() => setActiveTab('settings')}
                  className={`hidden md:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'settings'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>গুগল শিট</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Notification Toggle Bell Button */}
            {onRequestNotificationPermission && (
              <button
                id="header-notification-toggle-btn"
                onClick={onRequestNotificationPermission}
                title={isNotificationEnabled ? 'ব্রাউজার ও সাউন্ড নোটিফিকেশন চালু আছে' : 'ব্রাউজার নোটিফিকেশন চালু করুন'}
                className={`flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                  isNotificationEnabled
                    ? 'bg-amber-950/60 text-amber-300 border-amber-700/60 hover:bg-amber-900'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                }`}
              >
                {isNotificationEnabled ? (
                  <BellRing className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                ) : (
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="hidden sm:inline text-[11px]">{isNotificationEnabled ? 'নোটিফিকেশন অন' : 'নোটিফিকেশন'}</span>
              </button>
            )}

            {!isAdminLoggedIn ? (
              <button
                id="header-admin-login-btn"
                onClick={openAdminLoginModal}
                className="px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1 transition animate-pulse hover:animate-none cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-300" />
                <span>এডমিন লগইন</span>
              </button>
            ) : (
              <button
                id="header-admin-logout-btn"
                onClick={onAdminLogout}
                className="px-2 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 hover:text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                title="এডমিন লগআউট করুন"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            )}

            {/* Socket Status Indicator */}
            <div
              className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border ${
                isConnected
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                  : 'bg-amber-950/40 text-amber-400 border-amber-800/50 animate-pulse'
              }`}
              title={isConnected ? 'Real-time WebSocket Active' : 'Connecting to server...'}
            >
              {isConnected ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              )}
              <span className="hidden xl:inline">{isConnected ? 'Live' : 'Connecting'}</span>
            </div>

            {/* Reset Demo Data */}
            <button
              id="reset-demo-data-btn"
              onClick={onResetDemo}
              title="Reset Demo State"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};


