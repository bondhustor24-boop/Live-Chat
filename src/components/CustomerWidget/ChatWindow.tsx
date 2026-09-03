import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, RefreshCw, X, ShieldCheck, FileText, Image as ImageIcon, Check, CheckCheck, Maximize2, Minimize2, ClipboardList, ExternalLink, AlertCircle, CheckCircle2, Megaphone, ChevronLeft, ChevronRight, MessageSquarePlus, Lock, Loader2, MessageCircle, Phone } from 'lucide-react';
import { ChatSession, ChatMessage, WidgetConfig, ReportFormField } from '../../types';
import { DEFAULT_MASTER_REPORT_FIELDS } from '../../data/mockData';
import { sendTelegramNotification } from '../../lib/telegramNotify';

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
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
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
  isTypingAgent,
  isFullScreen,
  onToggleFullScreen
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

  const isChatClosed = chat.status === 'resolved' || chat.status === 'closed' || (chat as any).isClosed;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (chat.isBlocked) return;
    const textToSend = inputText.trim();
    const attachToSend = attachments.length > 0 ? [...attachments] : undefined;
    if (!textToSend && (!attachToSend || attachToSend.length === 0)) return;

    setInputText('');
    setAttachments([]);
    setShowEmojiPicker(false);
    onTyping(false);

    try {
      onSendMessage(textToSend, attachToSend);
    } catch (err) {
      console.warn('Error sending message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  // Dynamic Report Form Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFieldValues, setReportFieldValues] = useState<Record<string, string>>({});
  const [reportDepositSlip, setReportDepositSlip] = useState<{ name: string; url: string } | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Determine which fields this specific customer sees:
  const masterFields: ReportFormField[] = (widgetConfig.masterReportFields && widgetConfig.masterReportFields.length > 0)
    ? widgetConfig.masterReportFields
    : DEFAULT_MASTER_REPORT_FIELDS;

  const assignedFieldIds = chat.assignedReportFieldIds;
  const visibleFields = (assignedFieldIds && assignedFieldIds.length > 0)
    ? masterFields.filter((f) => assignedFieldIds.includes(f.id))
    : masterFields;

  const handleOpenReportModal = () => {
    // Pre-populate known customer values
    setReportFieldValues((prev) => ({
      ...prev,
      username: prev.username || chat.customer.name || '',
      phone: prev.phone || chat.customer.phone || '',
      email: prev.email || chat.customer.email || '',
      nibondhonName: prev.nibondhonName || chat.customer.name || '',
    }));
    setShowReportModal(true);
  };

  const handleDepositSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setReportDepositSlip({
        name: file.name,
        url: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleReportFieldValueChange = (fieldId: string, value: string) => {
    setReportFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check required visible fields
    for (const field of visibleFields) {
      if (field.type === 'file') {
        if (field.required && !reportDepositSlip) {
          alert(`অনুগ্রহ করে ${field.label} ফাইল বা ছবি আপলোড করুন।`);
          return;
        }
      } else {
        const val = (reportFieldValues[field.id] || '').trim();
        if (field.required && !val) {
          alert(`অনুগ্রহ করে "${field.label}" ফিল্ডটি পূরণ করুন।`);
          return;
        }
      }
    }

    setReportSubmitting(true);

    const reportFieldsList = visibleFields.map((f) => {
      if (f.type === 'file') {
        return {
          label: f.label,
          value: reportDepositSlip ? `📷 ${reportDepositSlip.name}` : 'সংযুক্ত নেই',
        };
      }
      return {
        label: f.label,
        value: (reportFieldValues[f.id] || '').trim() || 'N/A',
      };
    });

    const reportDataMap: Record<string, string> = {};
    visibleFields.forEach((f) => {
      if (f.type === 'file') {
        if (reportDepositSlip) reportDataMap[f.id] = reportDepositSlip.name;
      } else {
        reportDataMap[f.id] = (reportFieldValues[f.id] || '').trim();
      }
    });

    // 1. Send data to Telegram Bot with dynamic fields and photo attachment
    try {
      await sendTelegramNotification(
        {
          type: 'user_report',
          customerName: chat.customer.name,
          customerPhone: reportFieldValues.phone || chat.customer.phone,
          customerEmail: reportFieldValues.email || chat.customer.email,
          chatId: chat.id,
          photoUrl: reportDepositSlip?.url,
          photoName: reportDepositSlip?.name || 'deposit_slip.jpg',
          reportData: reportDataMap,
          reportFieldsList,
        },
        widgetConfig
      );
    } catch (err) {
      console.warn('Telegram report sending error:', err);
    }

    // 2. Update chat session with submitted report data via API
    try {
      await fetch(`/api/chats/${chat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedReportData: reportDataMap,
        }),
      });
    } catch (err) {
      console.warn('Error saving submitted report data:', err);
    }

    // 3. Send confirmation in chat
    onSendMessage('✅ আপনার কাস্টমাইজড রিপোর্ট ফরমটি সফলভাবে সাবমিট হয়েছে। আমাদের সাপোর্ট টিম দ্রুত যাচাই করে সমাধান করবে।');

    setTimeout(() => {
      setReportSubmitting(false);
      setReportSuccess('আপনার রিপোর্ট সফলভাবে সাবমিট হয়েছে। ধন্যবাদ!');
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(null);
        setReportFieldValues({});
        setReportDepositSlip(null);
      }, 1800);
    }, 400);
  };

  const renderMessageContent = (content: string, isCustomer: boolean, msgObj?: ChatMessage) => {
    const isReportTrigger = content.includes('রিপোর্ট') || content.includes('অভিযোগ');
    const isWhatsAppTrigger =
      Boolean(msgObj?.whatsappAction) ||
      content.includes('01314224258') ||
      content.toLowerCase().includes('whatsapp') ||
      content.includes('হোয়াটসঅ্যাপ') ||
      content.includes('হোয়াটসঅ্যাপ');
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    const waPhone = msgObj?.whatsappAction?.phone || widgetConfig.whatsappAutoReply?.whatsappNumber || '01314224258';
    const cleanWaNumber = waPhone.replace(/[^0-9]/g, '');
    const intlWaNumber = cleanWaNumber.startsWith('88') ? cleanWaNumber : `88${cleanWaNumber}`;
    const waUrl =
      msgObj?.whatsappAction?.url ||
      `https://wa.me/${intlWaNumber}?text=${encodeURIComponent(`হ্যালো, আমি লাইভ চ্যাট থেকে এসেছি (Chat ID: #${chat.id})। জরুরি সহায়তা প্রয়োজন।`)}`;

    return (
      <div className="space-y-2">
        <p className="whitespace-pre-wrap">
          {parts.map((part, index) => {
            if (part.match(urlRegex)) {
              return (
                <a
                  key={index}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline inline-flex items-center gap-1 font-semibold break-all ${
                    isCustomer ? 'text-white hover:text-blue-100' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  <span>{part}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              );
            }
            return part;
          })}
        </p>

        {/* WhatsApp Direct Connect Action Card */}
        {isWhatsAppTrigger && !isCustomer && (
          <div className="mt-2.5 p-3 bg-emerald-50/95 border border-emerald-300/80 rounded-xl flex flex-col gap-2 shadow-xs text-left">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <MessageCircle className="w-3 h-3" />
              </div>
              <span>হোয়াটসঅ্যাপে সরাসরি মেসেজ পাঠান</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-tight">
              এডমিনের উত্তরের অপেক্ষায় না থেকে দ্রুততম সাপোর্টের জন্য নিচে ক্লিক করে সরাসরি হোয়াটসঅ্যাপে মেসেজ করুন:
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600 shrink-0" />
              <span>📱 হোয়াটসঅ্যাপে মেসেজ পাঠান ({waPhone})</span>
            </a>
          </div>
        )}

        {/* Interactive Report Form Button if message contains report link/trigger */}
        {isReportTrigger && !isCustomer && (
          <div className="mt-2.5 p-3 bg-blue-50/90 border border-blue-200/90 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
              <ClipboardList className="w-4 h-4 text-blue-600 shrink-0" />
              <span>অনলাইন সাপোর্ট ও রিপোর্ট ফরম</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              আপনার অভিযোগ বা তথ্য জানাতে নিচের বাটনে ক্লিক করে নির্দিষ্ট ফরমটি পূরণ করুন:
            </p>
            <button
              type="button"
              onClick={handleOpenReportModal}
              style={{ backgroundColor: widgetConfig.primaryColor }}
              className="w-full py-2.5 px-3 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>📋 রিপোর্ট ফরম পূরণ করুন</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImg = file.type.startsWith('image/');

    const processFile = (): Promise<string> => {
      return new Promise((resolve) => {
        if (!isImg) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            } else {
              resolve(event.target?.result as string);
            }
          };
          img.onerror = () => resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    };

    const dataUrl = await processFile();
    setAttachments((prev) => [
      ...prev,
      {
        name: file.name,
        url: dataUrl,
        type: isImg ? 'image' : 'file',
        size: (file.size / 1024).toFixed(1) + ' KB',
      },
    ]);

    e.target.value = '';
  };

  // Determine current active chat header profile
  const assignedName = chat.assignedAgentName || chat.assignedAgent?.name || widgetConfig.botName;
  const assignedAvatar = chat.assignedAgentAvatar || chat.assignedAgent?.avatar || widgetConfig.botAvatar;
  const typingDisplayName = (typeof isTypingAgent === 'string' && isTypingAgent.trim() !== '') ? isTypingAgent : (assignedName || 'এজেন্ট');

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
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-semibold text-amber-200 uppercase tracking-wider">
                এডমিন
              </span>
              <h4 className="font-bold text-xs sm:text-sm leading-tight text-white">{assignedName}</h4>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            </div>
            <p className="text-[10px] text-white/90 flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-amber-300">
                Chat ID: <strong>#{chat.id}</strong>
              </span>
              <span>•</span>
              {isTypingAgent ? (
                <span className="text-amber-200 font-bold animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                  {typingDisplayName} লিখছেন...
                </span>
              ) : (
                <span className="capitalize text-emerald-300 font-medium">
                  {chat.status === 'active' ? 'অনলাইন (Online)' : 'অপেক্ষমাণ'}
                </span>
              )}
              {chat.adminSeen && (
                <>
                  <span>•</span>
                  <span className="text-blue-200 font-medium flex items-center gap-0.5">
                    <CheckCheck className="w-3 h-3 text-cyan-300" /> Seen
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              title={isFullScreen ? "স্মল উইজেটে পরিবর্তন করুন" : "ফুল পেজ চ্যাট ভিউ"}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onEndChat}
            title="চ্যাট শেষ করুন ও রেটিং দিন"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition text-xs font-medium cursor-pointer"
          >
            শেষ করুন
          </button>
          <button
            onClick={onCloseWidget}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
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

        {/* Messages List */}
        {(() => {
          const seenIds = new Set<string>();
          const displayMessages: ChatMessage[] = [];

          for (const m of messages) {
            if (!m || m.isInternalNote) continue;
            const idKey = m.id ? String(m.id).trim() : null;

            if (idKey && seenIds.has(idKey)) {
              continue; // Duplicate id - eliminate
            }

            if (idKey) seenIds.add(idKey);
            displayMessages.push(m);
          }

          return displayMessages.map((msg, idx) => {
            const isCustomer = msg.senderRole === 'customer';
            const isSystem = msg.senderRole === 'system';
            const isSending = isCustomer && (msg.readStatus === 'sending' || msg.isSending);

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
                  
                  {/* Sender Label & Timestamp */}
                  <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 px-1 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.senderName}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble with Visual Indicator */}
                  <div
                    style={
                      isCustomer
                        ? { backgroundColor: widgetConfig.primaryColor, color: '#ffffff' }
                        : { backgroundColor: '#ffffff', color: '#0f172a' }
                    }
                    className={`p-3 rounded-2xl shadow-xs leading-relaxed border transition-all duration-200 ${
                      isCustomer
                        ? isSending
                          ? 'rounded-br-xs border-blue-300/40 opacity-75 ring-2 ring-blue-400/30'
                          : 'rounded-br-xs border-transparent opacity-100'
                        : 'rounded-bl-xs border-slate-200/80 text-slate-800'
                    }`}
                  >
                    {renderMessageContent(msg.content, isCustomer, msg)}

                    {/* Attachments preview */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {msg.attachments.map((att, idx) => (
                          <div key={idx} className="rounded-lg overflow-hidden border border-slate-200/40 cursor-pointer hover:opacity-95 transition" onClick={() => att.type === 'image' && setPreviewImageModal(att.url)}>
                            {att.type === 'image' ? (
                              <img src={att.url} alt={att.name} className="max-h-56 w-full object-cover rounded-lg" />
                            ) : (
                              <a href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-slate-100/30 text-xs text-blue-600 hover:underline">
                                <FileText className="w-4 h-4" />
                                <span className="truncate">{att.name} ({att.size || 'File'})</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Under customer message bubble: Seen / Delivered / Sent badge */}
                  {isCustomer && (
                    <div className="flex items-center justify-end gap-1 pt-0.5 text-[10px] font-semibold">
                      {msg.readStatus === 'read' || chat.adminSeen ? (
                        <div className="flex items-center gap-1 text-blue-600 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-200/60 shadow-2xs animate-in fade-in">
                          <CheckCheck className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                          <span>Seen</span>
                          <span className="text-[9px] text-blue-500 font-normal">
                            {msg.seenAt
                              ? `(${new Date(msg.seenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                              : `(${msg.timestamp || 'এডমিন দেখেছেন'})`}
                          </span>
                        </div>
                      ) : msg.readStatus === 'delivered' ? (
                        <div className="flex items-center gap-1 text-slate-400 text-[9px]">
                          <CheckCheck className="w-3 h-3 text-slate-400" />
                          <span>Delivered</span>
                        </div>
                      ) : isSending ? (
                        <div className="flex items-center gap-1 text-slate-400 text-[9px]">
                          <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400 text-[9px]">
                          <Check className="w-3 h-3 text-slate-400" />
                          <span>Sent</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Reply Pills if present */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {msg.quickReplies.map((pill, idx) => {
                        const isWaPill = pill.includes('হোয়াটসঅ্যাপ') || pill.includes('WhatsApp') || pill.includes('01314224258');
                        const waPhone = msg.whatsappAction?.phone || widgetConfig.whatsappAutoReply?.whatsappNumber || '01314224258';
                        const cleanWa = waPhone.replace(/[^0-9]/g, '');
                        const intlWa = cleanWa.startsWith('88') ? cleanWa : `88${cleanWa}`;
                        const waUrl = msg.whatsappAction?.url || `https://wa.me/${intlWa}?text=${encodeURIComponent(`হ্যালো, আমি লাইভ চ্যাট থেকে এসেছি (Chat ID: #${chat.id})।`)}`;

                        if (isWaPill) {
                          return (
                            <a
                              key={idx}
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-bold rounded-full shadow-2xs transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>{pill}</span>
                            </a>
                          );
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => onSendQuickReply(pill)}
                            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 text-[11px] font-medium rounded-full shadow-2xs transition cursor-pointer"
                          >
                            {pill}
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>
            );
          });
        })()}

        {/* Typing indicator */}
        {isTypingAgent && (
          <div className="flex items-center gap-2.5 py-1.5 px-3 bg-white text-slate-700 rounded-2xl rounded-bl-xs w-fit max-w-[85%] border border-slate-200 shadow-2xs animate-in fade-in slide-in-from-bottom-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <div className="flex gap-0.5 items-center">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-800">
              {typingDisplayName} মেসেজ টাইপ করছেন...
            </span>
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
      ) : isChatClosed ? (
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-center gap-2 text-slate-700 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>এই চ্যাটটি সমাপ্ত (Closed) করা হয়েছে</span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
            এই কনভারসেশনটির সমাধান সম্পন্ন হয়েছে এবং মেসেজ আদান-প্রদান বন্ধ আছে। আপনার নতুন কোনো প্রশ্ন বা সহায়তার প্রয়োজন হলে নিচে ক্লিক করে নতুন চ্যাট শুরু করতে পারেন।
          </p>
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              style={{ backgroundColor: widgetConfig.primaryColor }}
              className="w-full py-2.5 px-4 text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>➕ নতুন চ্যাট শুরু করুন (Start New Chat)</span>
            </button>
          )}
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
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition shrink-0"
            title="ইমোজি সিলেক্ট করুন"
          >
            <Smile className="w-4 h-4" />
          </button>

          <label title="ছবি বা ফাইল সংযুক্ত করুন" className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer shrink-0">
            <Paperclip className="w-4 h-4" />
            <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
          </label>

          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            inputMode="text"
            autoCapitalize="sentences"
            enterKeyHint="send"
            autoComplete="off"
            placeholder="আপনার মেসেজটি লিখুন..."
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition touch-manipulation text-slate-900 placeholder:text-slate-400 font-medium"
          />

          <button
            type="submit"
            disabled={!inputText.trim() && attachments.length === 0}
            style={{ backgroundColor: widgetConfig.primaryColor }}
            className="w-10 h-10 min-w-[40px] min-h-[40px] text-white rounded-xl shadow-sm hover:opacity-95 active:scale-95 transition flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="মেসেজ পাঠান"
            aria-label="মেসেজ পাঠান"
          >
            <Send className="w-4 h-4 text-white stroke-[2.5] translate-x-[1px]" />
          </button>
        </div>
      </form>
      )}

      {/* Lightbox Modal for Large Image Preview */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative max-w-2xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-10 right-0 text-white bg-slate-800/80 p-1.5 rounded-full hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImageModal} alt="Enlarged preview" className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl" />
          </div>
        </div>
      )}

      {/* Interactive User Report Form Modal - Dynamically Tailored for this User */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-200 relative space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">ইউজার রিপোর্ট ফরম (User Report Form)</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">
                    আপনার প্রয়োজনীয় তথ্যসমূহ সঠিকভাবে পূরণ করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">রিপোর্ট জমা হয়েছে!</h4>
                <p className="text-xs text-slate-600 px-2">{reportSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
                {visibleFields.map((field) => {
                  const currentValue = reportFieldValues[field.id] || '';

                  if (field.type === 'file') {
                    return (
                      <div key={field.id}>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-2.5 text-center hover:bg-slate-50 transition cursor-pointer relative">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleDepositSlipUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          {reportDepositSlip ? (
                            <div className="flex items-center justify-between text-emerald-700 font-semibold text-xs">
                              <span className="truncate max-w-[200px]">📷 {reportDepositSlip.name}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReportDepositSlip(null);
                                }}
                                className="text-rose-500 p-1 hover:bg-rose-50 rounded"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs">
                              <Paperclip className="w-4 h-4 text-slate-400" />
                              <span>{field.placeholder || 'ছবি বা ফাইল আপলোড করুন'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.id}>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <textarea
                          rows={3}
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          value={currentValue}
                          onChange={(e) => handleReportFieldValueChange(field.id, e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={field.id}>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type={field.type === 'password' ? 'password' : field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'tel' ? 'tel' : 'text'}
                        required={field.required}
                        placeholder={field.placeholder || ''}
                        value={currentValue}
                        onChange={(e) => handleReportFieldValueChange(field.id, e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                      />
                    </div>
                  );
                })}

                <div className="pt-2 flex items-center justify-end gap-2 sticky bottom-0 bg-white border-t border-slate-100 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    style={{ backgroundColor: widgetConfig.primaryColor }}
                    className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {reportSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>রিপোর্ট জমা দিন</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
