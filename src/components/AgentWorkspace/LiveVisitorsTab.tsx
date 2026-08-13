import React, { useState } from 'react';
import { MapPin, Globe, Clock, Laptop, MessageSquarePlus, UserCheck, RefreshCw, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { LiveVisitor } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { WorldMapVisualization } from './WorldMapVisualization';

interface LiveVisitorsTabProps {
  visitors: LiveVisitor[];
  onInviteToChat: (visitor: LiveVisitor) => void;
}

export const LiveVisitorsTab: React.FC<LiveVisitorsTabProps> = ({ visitors, onInviteToChat }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'grid'>('both');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div id="live-visitors-page" className="flex-1 bg-slate-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-600" />
              <span>লাইভ ওয়েবসাইট ভিজিটর ট্র্যাকিং</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              আইপি জিও-লোকেশন ইন্টারেক্টিভ ম্যাপের মাধ্যমে আপনার ওয়েবসাইট ভিজিটরদের রিয়েলটাইমে মনিটর করুন এবং চ্যাট ইনভাইট পাঠান।
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs text-xs">
              <button
                onClick={() => setViewMode('both')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'both' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>উভয় ভিউ</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>ম্যাপ</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>কার্ড</span>
              </button>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              {isRefreshing ? (
                <LoadingSpinner size="xs" color="slate" label="রিফ্রেশ হচ্ছে..." />
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>রিফ্রেশ</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span>{visitors.length} জন ভিজিটর অনলাইনে</span>
            </div>
          </div>
        </div>

        {/* World Map Section */}
        {(viewMode === 'both' || viewMode === 'map') && (
          <WorldMapVisualization visitors={visitors} onInviteToChat={onInviteToChat} />
        )}

        {/* Visitors Grid Section */}
        {(viewMode === 'both' || viewMode === 'grid') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                <span>ভিজিটরদের বিস্তারিত তালিকা ({visitors.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visitors.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{v.name}</h4>
                      {v.email && <p className="text-xs text-slate-500">{v.email}</p>}
                      <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px] mt-1">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md font-bold">
                          📱 {v.phone || '01712345678'}
                        </span>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold">
                          🌐 IP: {v.ip || '103.205.132.42'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200 uppercase">
                      {v.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{v.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-blue-600 truncate">{v.currentPage}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Time on page: {v.timeOnPage}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{v.device}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => onInviteToChat(v)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      <span>সরাসরি চ্যাট ইনভাইট পাঠান</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

