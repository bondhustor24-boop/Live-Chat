import React, { useState } from 'react';
import { Send, User, Mail, Phone, MessageSquare, Building2, Loader2 } from 'lucide-react';
import { WidgetConfig } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';

interface PreChatFormProps {
  widgetConfig: WidgetConfig;
  onSubmit: (data: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    department: string;
    subject: string;
    initialMessage: string;
  }) => void;
}

export const PreChatForm: React.FC<PreChatFormProps> = ({ widgetConfig, onSubmit }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [department, setDepartment] = useState(widgetConfig.departments[0] || 'গ্রাহক সহায়তা (Customer Support)');
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        customerName,
        customerPhone: cleanPhone,
        customerEmail,
        department,
        subject,
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
