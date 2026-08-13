import React, { useState } from 'react';
import { Send, User, Mail, Phone, MessageSquare, Building2, HelpCircle, Megaphone, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { WidgetConfig, SUPPORT_PROBLEM_OPTIONS, type SupportProblemIssue } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';

interface PreChatFormProps {
  widgetConfig: WidgetConfig;
  onSubmit: (data: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    department: string;
    subject: string;
    problemIssue?: string;
    initialMessage: string;
  }) => void;
}

export const PreChatForm: React.FC<PreChatFormProps> = ({ widgetConfig, onSubmit }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [department, setDepartment] = useState(widgetConfig.departments[0] || 'গ্রাহক সহায়তা (Customer Support)');
  const [problemIssue, setProblemIssue] = useState<SupportProblemIssue>('withdraw_problem');
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoIdx, setPromoIdx] = useState(0);

  // Active Promo Banners List
  const activePromos = (
    widgetConfig.promoBanners && widgetConfig.promoBanners.length > 0
      ? widgetConfig.promoBanners
      : widgetConfig.promoBanner
      ? [widgetConfig.promoBanner]
      : []
  ).filter((p) => p.enabled && p.imageUrl);

  const currentPromo = activePromos[promoIdx % activePromos.length];

  const handleNextPromo = () => {
    setPromoIdx((prev) => (prev + 1) % activePromos.length);
  };

  const handlePrevPromo = () => {
    setPromoIdx((prev) => (prev - 1 + activePromos.length) % activePromos.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !initialMessage.trim()) {
      alert('অনুগ্রহ করে নাম, ১০/১১ ডিজিটের মোবাইল নম্বর এবং আপনার মেসেজটি প্রদান করুন।');
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      alert('অনুগ্রহ করে একটি সঠিক ১০ বা ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 01712345678)।');
      return;
    }

    const selectedOption = SUPPORT_PROBLEM_OPTIONS.find((opt) => opt.value === problemIssue);
    const calculatedSubject = subject.trim() || selectedOption?.bangla || 'সাপোর্ট অনুসন্ধান';

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        customerName,
        customerPhone: cleanPhone,
        customerEmail,
        department,
        subject: calculatedSubject,
        problemIssue,
        initialMessage,
      });
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} id="pre-chat-form" className="p-5 space-y-3.5 text-slate-800">
      <div className="text-center mb-1">
        <h3 className="font-semibold text-slate-900 text-base">লাইভ চ্যাট শুরু করুন</h3>
        <p className="text-xs text-slate-500 mt-0.5">সাপোর্ট এজেন্টের সাথে সরাসরি কথা বলতে তথ্য দিন।</p>
      </div>

      {/* Promoted Website Banner Carousel */}
      {activePromos.length > 0 && currentPromo && (
        <div className="p-3 bg-gradient-to-br from-purple-900 to-indigo-950 text-white border border-purple-500/40 rounded-2xl space-y-2.5 shadow-md relative group">
          {/* Header & Controls */}
          <div className="flex items-center justify-between text-amber-300 font-bold text-[11px] uppercase tracking-wider">
            <div className="flex items-center gap-1.5 truncate">
              <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{currentPromo.title || 'স্পনসরড ওয়েবসাইট'}</span>
            </div>

            {activePromos.length > 1 && (
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <span className="text-[10px] text-purple-200 font-mono mr-1">
                  {promoIdx + 1}/{activePromos.length}
                </span>
                <button
                  type="button"
                  onClick={handlePrevPromo}
                  className="p-1 bg-white/10 hover:bg-white/20 rounded-lg transition text-white cursor-pointer"
                  title="পূর্ববর্তী ওয়েবসাইট"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPromo}
                  className="p-1 bg-white/10 hover:bg-white/20 rounded-lg transition text-white cursor-pointer"
                  title="পরবর্তী ওয়েবসাইট"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Image */}
          <a
            href={currentPromo.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden border border-white/20 group relative shadow-sm"
          >
            <img
              src={currentPromo.imageUrl}
              alt={currentPromo.title}
              className="w-full h-28 object-cover group-hover:scale-105 transition duration-300"
            />
          </a>

          {/* Description */}
          {currentPromo.description && (
            <p className="text-[11px] text-purple-100 leading-snug">
              {currentPromo.description}
            </p>
          )}

          {/* Button */}
          <a
            href={currentPromo.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
          >
            <span>{currentPromo.buttonText || 'ওয়েবসাইট ভিজিট করুন'}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>

          {/* Dots Indicator if multiple */}
          {activePromos.length > 1 && (
            <div className="flex items-center justify-center gap-1 pt-1">
              {activePromos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPromoIdx(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === promoIdx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">আপনার নাম *</label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="prechat-name-input"
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="যেমন: তানজিলা পারভীন"
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">মোবাইল নম্বর * (চ্যাট আইডি তৈরিতে ব্যবহূত)</label>
        <div className="relative">
          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="prechat-phone-input"
            type="tel"
            required
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="01712345678"
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-mono"
          />
        </div>
      </div>

      {/* Email Address */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="prechat-email-input"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="tanjila@example.com"
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Problem Issue Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          সমস্যার ধরন / বিষয় নির্বাচন করুন *
        </label>
        <div className="relative">
          <HelpCircle className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
          <select
            id="prechat-problem-issue-select"
            value={problemIssue}
            onChange={(e) => setProblemIssue(e.target.value as SupportProblemIssue)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-amber-300 rounded-lg bg-amber-50/50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition cursor-pointer"
          >
            {SUPPORT_PROBLEM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.bangla}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Department Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">ডিপার্টমেন্ট নির্বাচন করুন</label>
        <div className="relative">
          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <select
            id="prechat-dept-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
          >
            {widgetConfig.departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Initial Question / Message */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">কীভাবে সাহায্য করতে পারি? *</label>
        <div className="relative">
          <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <textarea
            id="prechat-message-input"
            required
            rows={2}
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
            placeholder="আপনার প্রশ্ন বা মেসেজটি লিখুন..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        id="prechat-start-chat-btn"
        type="submit"
        disabled={isSubmitting}
        style={{ backgroundColor: widgetConfig.primaryColor }}
        className="w-full py-2.5 px-4 text-white text-xs font-semibold rounded-lg shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <LoadingSpinner size="xs" color="white" label="সংযুক্ত হচ্ছে..." />
        ) : (
          <>
            <span>চ্যাট শুরু করুন</span>
            <Send className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </form>
  );
};
