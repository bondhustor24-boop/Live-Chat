import React, { useState } from 'react';
import { MessageSquare, X, Minimize2, ChevronDown } from 'lucide-react';
import { PreChatForm } from './PreChatForm';
import { ChatWindow } from './ChatWindow';
import { SatisfactionRating } from './SatisfactionRating';
import { ChatSession, ChatMessage, WidgetConfig } from '../../types';

interface CustomerChatWidgetProps {
  widgetConfig: WidgetConfig;
  chatSession: ChatSession | null;
  messages: ChatMessage[];
  onStartChat: (data: {
    customerName: string;
    customerPhone?: string;
    customerEmail: string;
    department: string;
    subject: string;
    initialMessage: string;
  }) => void;
  onSendMessage: (text: string, attachments?: any[]) => void;
  onSendQuickReply: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  onSubmitRating: (rating: number, feedback: string) => void;
  onNewChat?: () => void;
  isTypingAgent?: string | null;
}

export const CustomerChatWidget: React.FC<CustomerChatWidgetProps> = ({
  widgetConfig,
  chatSession,
  messages,
  onStartChat,
  onSendMessage,
  onSendQuickReply,
  onTyping,
  onSubmitRating,
  onNewChat,
  isTypingAgent
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isRatingStep, setIsRatingStep] = useState(false);

  const isBottomRight = widgetConfig.position === 'bottom-right';

  return (
    <div
      id="customer-live-chat-widget-container"
      className={`fixed z-40 flex flex-col items-end ${
        isBottomRight ? 'bottom-5 right-5' : 'bottom-5 left-5'
      }`}
    >
      {/* Expanded Chat Box */}
      {isOpen && (
        <div
          id="customer-widget-popup"
          className="w-[320px] sm:w-[355px] h-[465px] mb-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-5"
        >
          {isRatingStep ? (
            <div className="bg-white rounded-2xl h-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-center">
              <SatisfactionRating
                onSubmit={(rating, feedback) => {
                  onSubmitRating(rating, feedback);
                  setTimeout(() => {
                    setIsRatingStep(false);
                    setIsOpen(false);
                  }, 1500);
                }}
              />
            </div>
          ) : !chatSession ? (
            <div className="bg-white rounded-2xl h-full shadow-2xl border border-slate-200 overflow-y-auto relative">
              {/* Widget Header */}
              <div
                style={{ backgroundColor: widgetConfig.primaryColor }}
                className="p-4 text-white flex items-center justify-between rounded-t-2xl shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{widgetConfig.headerTitle}</h3>
                    <p className="text-[11px] text-white/80">Support Agents Online</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Pre-chat Form */}
              <PreChatForm widgetConfig={widgetConfig} onSubmit={onStartChat} />
            </div>
          ) : (
            <ChatWindow
              chat={chatSession}
              messages={messages}
              widgetConfig={widgetConfig}
              onSendMessage={onSendMessage}
              onSendQuickReply={onSendQuickReply}
              onTyping={onTyping}
              onEndChat={() => setIsRatingStep(true)}
              onCloseWidget={() => setIsOpen(false)}
              onNewChat={onNewChat}
              isTypingAgent={isTypingAgent}
            />
          )}
        </div>
      )}

      {/* Launcher Bubble */}
      <button
        id="widget-launcher-bubble"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: widgetConfig.primaryColor }}
        className="w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 group relative ring-4 ring-white/20"
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6 transition-transform group-hover:translate-y-0.5" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            {chatSession && chatSession.unreadCountCustomer > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce shadow">
                {chatSession.unreadCountCustomer}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};
