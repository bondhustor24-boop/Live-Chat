import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Zap,
  Lock,
  Star,
  UserPlus,
  CheckCircle,
  Clock,
  Paperclip,
  X,
  FileText,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { ChatSession, ChatMessage, Agent, CannedResponse } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';

interface AgentChatAreaProps {
  chat: ChatSession | null;
  messages: ChatMessage[];
  agents: Agent[];
  activeAgent: Agent;
  cannedResponses: CannedResponse[];
  onSendMessage: (text: string, isInternalNote?: boolean, attachments?: any[]) => void;
  onAssignAgent: (chatId: string, agentId: string) => void;
  onChangeStatus: (chatId: string, status: any) => void;
  onToggleStar: (chatId: string) => void;
  onTyping: (isTyping: boolean) => void;
  isCustomerTyping?: boolean;
  onBackToList?: () => void;
}

export const AgentChatArea: React.FC<AgentChatAreaProps> = ({
  chat,
  messages,
  agents,
  activeAgent,
  cannedResponses,
  onSendMessage,
  onAssignAgent,
  onChangeStatus,
  onToggleStar,
  onTyping,
  isCustomerTyping,
  onBackToList
}) => {
  const [inputText, setInputText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showCannedModal, setShowCannedModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isCustomerTyping]);

  if (!chat) {
    return (
      <div id="agent-no-chat-selected" className="flex-1 bg-slate-50 flex items-center justify-center p-8 text-center text-slate-400">
        <div>
          <div className="w-16 h-16 rounded-2xl bg-slate-200/60 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-700 text-base">কোনো চ্যাট নির্বাচন করা হয়নি</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">ইনবক্স তালিকা থেকে কোনো গ্রাহকের কনভারসেশন সিলেক্ট করুন।</p>
        </div>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText, isInternalNote);
    setInputText('');
    setAiSuggestions([]);
    onTyping(false);
  };

  const handleFetchAiSuggestions = async () => {
    setLoadingAi(true);
    setAiSuggestions([]);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chat.id, customerName: chat.customer.name }),
      });
      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setAiSuggestions(data.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div id="agent-chat-main-area" className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* Top Header Bar */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
        
        {/* Customer info & Subject */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition shrink-0"
              title="তালিকায় ফিরুন"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <img
            src={chat.customer.avatar}
            alt={chat.customer.name}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-sm truncate">{chat.customer.name}</h3>
              <span className="font-mono text-[10px] bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-slate-700">
                {chat.id}
              </span>
              <button
                onClick={() => onToggleStar(chat.id)}
                className="text-slate-400 hover:text-amber-400 transition"
              >
                <Star className={`w-4 h-4 ${chat.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
              <span>📞 {chat.customer.phone || '01712345678'}</span>
              <span>•</span>
              <span>🌐 IP: {chat.customer.ipAddress || '103.205.132.42'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Assigned Agent Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={chat.assignedAgentId || ''}
              onChange={(e) => onAssignAgent(chat.id, e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">-- এজেন্ট নিয়োগ করুন --</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <select
            value={chat.status}
            onChange={(e) => onChangeStatus(chat.id, e.target.value)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
              chat.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : chat.status === 'unassigned'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <option value="unassigned">অ্যাসাইন ছাড়া</option>
            <option value="active">অনলাইন / সক্রিয়</option>
            <option value="waiting">অপেক্ষমাণ</option>
            <option value="resolved">সমাধানকৃত</option>
          </select>

          {/* Quick Resolve Button */}
          {chat.status !== 'resolved' && (
            <button
              onClick={() => onChangeStatus(chat.id, 'resolved')}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow-2xs transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">সমাধান চিহ্নিত করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Message Thread Scroll */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((msg, idx) => {
          const isCustomer = msg.senderRole === 'customer';
          const isNote = msg.isInternalNote;
          const isSystem = msg.senderRole === 'system';

          if (isSystem) {
            return (
              <div key={msg.id ? `${msg.id}_${idx}` : `sys_${idx}`} className="text-center my-2 text-[11px] text-slate-400 font-medium">
                <span className="bg-slate-200/60 px-3 py-1 rounded-full">{msg.content}</span>
              </div>
            );
          }

          if (isNote) {
            return (
              <div key={msg.id ? `${msg.id}_${idx}` : `note_${idx}`} className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 my-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px] mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Internal Agent Whisper Note ({msg.senderName})</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="text-amber-900 font-medium text-xs whitespace-pre-wrap">{msg.content}</p>
              </div>
            );
          }

          return (
            <div
              key={msg.id ? `${msg.id}_${idx}` : `msg_${idx}`}
              className={`flex gap-2.5 ${isCustomer ? 'flex-row' : 'flex-row-reverse'} items-end`}
            >
              <img
                src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={msg.senderName}
                className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-slate-200"
              />

              <div className={`max-w-[75%] space-y-1 ${isCustomer ? 'items-start' : 'items-end'}`}>
                <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 px-1 ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3 rounded-2xl shadow-2xs leading-relaxed ${
                    isCustomer
                      ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      : 'bg-blue-600 text-white rounded-br-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((att, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden border border-slate-200/40">
                          {att.type === 'image' ? (
                            <img src={att.url} alt={att.name} className="max-h-40 w-full object-cover" />
                          ) : (
                            <div className="p-2 bg-slate-100 text-slate-800 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isCustomerTyping && (
          <div className="flex items-center gap-3 my-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Pulsating Avatar Container */}
            <div className="relative flex items-center justify-center shrink-0">
              {/* Outer Pulsating Ring */}
              <span className="absolute inline-flex h-9 w-9 rounded-full bg-blue-500/30 animate-ping opacity-75" />
              {/* Inner Glowing Aura */}
              <span className="absolute inline-flex h-8 w-8 rounded-full bg-blue-400/20 animate-pulse" />
              
              {/* Avatar Image */}
              <img
                src={chat.customer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={chat.customer.name}
                className="relative w-8 h-8 rounded-full object-cover ring-2 ring-blue-600 shadow-md transition-transform"
              />

              {/* Custom SVG Typing Badge Overlay */}
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-0.5 border-2 border-white shadow-xs animate-bounce">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </span>
            </div>

            {/* Typing Bubble */}
            <div className="bg-white border border-slate-200/90 px-3.5 py-2 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-2.5">
              <span className="font-bold text-slate-800 text-xs">{chat.customer.name}</span>
              <span className="text-slate-500 text-xs font-medium">মেসেজ লিখছেন</span>

              {/* Bouncing Dots */}
              <div className="flex items-center gap-1 pl-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.32s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.16s]" />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggested Replies Shelf */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-t border-indigo-100 p-3 shrink-0 animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>জেমি নাই (Gemini) এআই সাজেস্টেড রিপ্লাই</span>
            </div>
            <button
              onClick={() => setAiSuggestions([])}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {aiSuggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(sug);
                  setAiSuggestions([]);
                }}
                className="text-left text-xs bg-white hover:bg-indigo-100/60 p-2 rounded-lg border border-indigo-200 text-slate-800 transition font-medium shadow-2xs"
              >
                "{sug}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reply Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        
        {/* Toggle Reply Mode & Quick Helpers */}
        <div className="flex items-center justify-between mb-2">
          
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setIsInternalNote(false)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                !isInternalNote ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              পাবলিক রিপ্লাই
            </button>
            <button
              type="button"
              onClick={() => setIsInternalNote(true)}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                isInternalNote ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>অভ্যন্তরীণ নোট (Whisper)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Canned Responses Trigger */}
            <button
              type="button"
              onClick={() => setShowCannedModal(!showCannedModal)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 flex items-center gap-1 transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>প্রস্তুতকৃত শর্টকাট (Canned)</span>
            </button>

            {/* AI Suggest Button */}
            <button
              type="button"
              onClick={handleFetchAiSuggestions}
              disabled={loadingAi}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-200 flex items-center gap-1.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingAi ? (
                <LoadingSpinner size="xs" color="indigo" label="ভাবছে..." />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>এআই ড্রাফট</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Canned Responses Quick Picker Menu */}
        {showCannedModal && (
          <div className="mb-2 bg-slate-900 text-white rounded-xl p-2.5 shadow-xl max-h-48 overflow-y-auto space-y-1 z-30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 px-1 mb-1 text-[11px] text-slate-400">
              <span>প্রস্তুতকৃত রিপ্লাই নির্বাচন করুন</span>
              <button onClick={() => setShowCannedModal(false)}>
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            {cannedResponses.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setInputText(item.content);
                  setShowCannedModal(false);
                }}
                className="w-full text-left p-1.5 hover:bg-slate-800 rounded-lg text-xs flex items-center justify-between transition"
              >
                <div>
                  <span className="font-semibold text-blue-400">{item.shortcut}</span> - {item.title}
                </div>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded">{item.category}</span>
              </button>
            ))}
          </div>
        )}

        {/* Text Form */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isInternalNote
                ? 'অভ্যন্তরীণ গোপন নোট লিখুন (শুধুমাত্র এজেন্টরা দেখতে পাবে)...'
                : 'গ্রাহককে পাঠানোর জন্য রিপ্লাই লিখুন...'
            }
            className={`flex-1 text-xs px-3.5 py-2.5 border rounded-xl focus:outline-none transition ${
              isInternalNote
                ? 'bg-amber-50/50 border-amber-300 focus:ring-2 focus:ring-amber-500/20'
                : 'bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`px-4 py-2.5 rounded-xl text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition disabled:opacity-40 ${
              isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <span>পাঠান</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
};
