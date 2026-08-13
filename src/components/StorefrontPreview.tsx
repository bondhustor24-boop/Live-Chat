import React from 'react';
import { MessageSquare, ExternalLink, Globe, Megaphone, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { WidgetConfig } from '../types';

interface StorefrontPreviewProps {
  widgetConfig?: WidgetConfig;
}

export const StorefrontPreview: React.FC<StorefrontPreviewProps> = ({ widgetConfig }) => {
  const activePromos = (
    widgetConfig?.promoBanners && widgetConfig.promoBanners.length > 0
      ? widgetConfig.promoBanners
      : widgetConfig?.promoBanner
      ? [widgetConfig.promoBanner]
      : []
  ).filter((p) => p.enabled && p.imageUrl);

  return (
    <div id="storefront-preview-canvas" className="flex-1 bg-slate-950 text-slate-300 overflow-y-auto relative flex flex-col items-center p-4 sm:p-8 space-y-8">
      
      {/* Subtle Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Main Top Header Canvas */}
      <div className="relative z-10 w-full max-w-4xl text-center space-y-2 pt-2 text-[10px]">
        <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
          ওয়েবসাইট সার্ভিস ও অফিশিয়াল লিংকসমূহ
        </h1>

        <p className="text-[10px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
          আমাদের অফিশিয়াল ওয়েবসাইট এবং স্পনসরড সার্ভিস পোর্টালসমূহ নিচে দেওয়া হলো। সরাসরি ভিজিট করতে বাটনে ক্লিক করুন। সহায়তার জন্য চ্যাট উইজেট ব্যবহার করুন।
        </p>
      </div>

      {/* Promoted Websites Section */}
      {activePromos.length > 0 ? (
        <div className="relative z-10 w-full max-w-5xl space-y-3 text-[10px]">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>প্রমোটেড ওয়েবসাইটসমূহ ({activePromos.length})</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              অফিশিয়াল লিংক ও অফার
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePromos.map((promo, idx) => (
              <div
                key={promo.id || idx}
                className="bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl overflow-hidden shadow-xl hover:shadow-purple-950/40 transition duration-300 flex flex-col justify-between group text-[10px]"
              >
                <div>
                  {/* Photo Banner */}
                  <a
                    href={promo.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative h-40 sm:h-44 overflow-hidden bg-slate-900 group"
                  >
                    <img
                      src={promo.imageUrl}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-lg border border-amber-400/30 flex items-center gap-1 shadow-md">
                      <Megaphone className="w-3 h-3 text-amber-400" />
                      <span>স্পনসরড ওয়েবসাইট</span>
                    </div>
                  </a>

                  {/* Text Content */}
                  <div className="p-3.5 space-y-1.5">
                    <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition leading-snug">
                      {promo.title}
                    </h3>
                    {promo.description && (
                      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-3">
                        {promo.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Visit Site Button Underneath */}
                <div className="p-3.5 pt-0">
                  <a
                    href={promo.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-[10px] rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>{promo.buttonText || 'ওয়েবসাইট ভিজিট করুন (Visit Site)'}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl p-5 text-center space-y-2 text-[10px]">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">কোনো ওয়েবসাইট প্রমোশন সক্রিয় নেই</h3>
          <p className="text-[10px] text-slate-400">
            এডমিন প্যানেল থেকে 📢 ওয়েবসাইট প্রমোশন ট্যাবে গিয়ে নতুন অফিশিয়াল ওয়েবসাইট যোগ করতে পারবেন।
          </p>
        </div>
      )}

      {/* Live Chat Notice Bar */}
      <div className="relative z-10 w-full max-w-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-lg text-center sm:text-left text-[10px]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-white">সরাসরি লাইভ চ্যাট সহায়তা (Live Support)</h4>
            <p className="text-[10px] text-slate-400">যেকোনো তথ্যের জন্য ডানদিকের নিচে চ্যাট আইকনে ক্লিক করুন</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 py-1 px-2.5 rounded-lg shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>অনলাইন সাপোর্ট চ্যাট সক্রিয়</span>
        </div>
      </div>

    </div>
  );
};


