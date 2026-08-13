import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, RefreshCw, X, ShieldCheck, FileText, Image as ImageIcon } from 'lucide-react';
import { ChatSession, ChatMessage, WidgetConfig } from '../../types';

interface ChatWindowProps {
  chat: ChatSession;
  messages: ChatMessage[];
  widgetConfig: WidgetConfig;
  onSendMessage: (text: string, attachments?: any[]) => void;
  onSendQuickReply: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  onEndChat: () => void;
  onCloseWidget: () => void;
  onNewChat?: () => void;
  isTypingAgent?: string | null;
}

const EMOJIS = ['👍', '❤️', '😊', '🎉', '👋', '🙏', '🔥', '🚀'];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  widgetConfig,
  onSendMessage,
  onSendQuickReply,
  onTyping,
  onEndChat,
  onCloseWidget,
  onNewChat,
  isTypingAgent
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTypingAgent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;
    onSendMessage(inputText, attachments.length > 0 ? attachments : undefined);
    setInputText('');
    setAttachments([]);
    setShowEmojiPicker(false);
    onTyping(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      setAttachments([
        ...attachments,
        {
          name: file.name,
          url: reader.result as string,
          type: isImg ? 'image' : 'file',
          size: (file.size / 1024).toFixed(1) + ' KB',
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  // Determine current active chat header profile
  const assignedName = chat.assignedAgentName || widgetConfig.botName;
  const assignedAvatar = chat.assignedAgentAvatar || widgetConfig.botAvatar;

  return (
    <div id="customer-chat-window" className="flex flex-col h-full bg-slate-50 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      
      {/* Widget Top Header */}
      <div
        style={{ backgroundColor: widgetConfig.primaryColor }}
        className="p-3.5 text-white flex items-center justify-between shadow-sm shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={assignedAvatar}
              alt={assignedName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-xs sm:text-sm leading-tight text-white">{assignedName}</h4>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            </div>
            <p className="text-[10px] text-white/80 flex items-center gap-1.5 flex-wrap">
              <span>ID: <strong className="text-amber-200 font-mono">{chat.id}</strong></span>
              <span>•</span>
              <span className="capitalize">{chat.status === 'active' ? 'অনলাইন' : 'অপেক্ষমাণ'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onNewChat && (
            <button
              onClick={onNewChat}
              title="নতুন মোবাইল নম্বর দিয়ে নতুন চ্যাট শুরু করুন"
              className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-[11px] font-semibold transition"
            >
              + নতুন চ্যাট
            </button>
          )}
          <button
            onClick={onEndChat}
            title="চ্যাট শেষ করুন ও রেটিং দিন"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition text-xs font-medium"
          >
            শেষ করুন
          </button>
          <button
            onClick={onCloseWidget}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
        
        {/* Welcome Callout */}
        <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-center space-y-1 text-slate-600 my-1">
          <p className="text-xs font-medium text-slate-800">{widgetConfig.welcomeMessage}</p>
          <p className="text-[10px] text-slate-500">ডিপার্টমেন্ট: {chat.department}</p>
        </div>

        {messages
          .filter((m) => !m.isInternalNote) // Customer does not see agent internal whisper notes
          .map((msg, idx) => {
            const isCustomer = msg.senderRole === 'customer';
            const isSystem = msg.senderRole === 'system';

            if (isSystem) {
              return (
                <div key={msg.id ? `${msg.id}_${idx}` : `sys_${idx}`} className="text-center my-2 text-[11px] text-slate-400 font-medium">
                  <span>{msg.content}</span>
                </div>
              );
            }

            return (
              <div
                key={msg.id ? `${msg.id}_${idx}` : `msg_${idx}`}
                className={`flex gap-2.5 ${isCustomer ? 'flex-row-reverse' : 'flex-row'} items-end`}
              >
                {!isCustomer && (
                  <img
                    src={msg.senderAvatar || widgetConfig.botAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-slate-200"
                  />
                )}

                <div className={`max-w-[80%] space-y-1 ${isCustomer ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender Label */}
                  <div className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.senderName}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    style={
                      isCustomer
                        ? { backgroundColor: widgetConfig.primaryColor, color: '#ffffff' }
                        : { backgroundColor: '#ffffff', color: '#0f172a' }
                    }
                    className={`p-3 rounded-2xl shadow-xs leading-relaxed border ${
                      isCustomer
                        ? 'rounded-br-xs border-transparent'
                        : 'rounded-bl-xs border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Attachments preview */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {msg.attachments.map((att, idx) => (
                          <div key={idx} className="rounded-lg overflow-hidden border border-slate-200/40">
                            {att.type === 'image' ? (
                              <img src={att.url} alt={att.name} className="max-h-40 w-full object-cover" />
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-slate-100/30 text-xs">
                                <FileText className="w-4 h-4" />
                                <span className="truncate">{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Reply Pills if present */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {msg.quickReplies.map((pill, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSendQuickReply(pill)}
                          className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 text-[11px] font-medium rounded-full shadow-2xs transition"
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

        {/* Typing indicator */}
        {isTypingAgent && (
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium pl-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>{isTypingAgent} লিখছেন...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative bg-white border border-slate-300 rounded-lg p-1.5 flex items-center gap-2 text-xs">
              <span className="truncate max-w-[120px]">{att.name}</span>
              <button
                type="button"
                onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                className="text-rose-500 hover:text-rose-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      {chat.isBlocked ? (
        <div className="p-3 bg-rose-100 border-t border-rose-300 text-rose-800 text-xs font-bold text-center flex items-center justify-center gap-2">
          <span>🚫 আপনার চ্যাট আইডিটি সাময়িকভাবে ব্লক করা হয়েছে।</span>
        </div>
      ) : (
        <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 shrink-0 relative">
          
          {/* Emoji Selector */}
        {showEmojiPicker && (
          <div className="absolute bottom-14 left-3 bg-white border border-slate-200 rounded-xl p-2 shadow-xl flex gap-1 z-20 animate-in fade-in zoom-in-95">
            {EMOJIS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="p-1.5 text-base hover:bg-slate-100 rounded-lg transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <Smile className="w-4 h-4" />
          </button>

          <label className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <Paperclip className="w-4 h-4" />
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>

          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="আপনার মেসেজটি লিখুন..."
            className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() && attachments.length === 0}
            style={{ backgroundColor: widgetConfig.primaryColor }}
            className="p-2 text-white rounded-xl shadow-xs hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
      )}

    </div>
  );
};
