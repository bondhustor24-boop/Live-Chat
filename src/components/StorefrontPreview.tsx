import React from 'react';
import { MessageSquare } from 'lucide-react';

export const StorefrontPreview: React.FC = () => {
  return (
    <div id="storefront-preview-canvas" className="flex-1 bg-slate-950 text-slate-400 overflow-y-auto relative flex flex-col items-center justify-center p-8">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Clean Minimal Canvas Notice */}
      <div className="relative z-0 text-center max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl p-8 shadow-xl space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
          <MessageSquare className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold text-white tracking-tight">
          Website Preview Canvas
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed">
          Clean canvas ready for Live Chat testing. Click the floating chat launcher in the bottom corner to open the customer widget.
        </p>

        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 py-1.5 px-3 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Live Chat Widget Active</span>
        </div>
      </div>

    </div>
  );
};

