import React, { useState } from 'react';
import {
  X,
  Database,
  Smartphone,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Wifi,
  ExternalLink
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, dbStatus, onSeedDemo, onClearData, hasExpenses }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envSample = `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/expenses?retryWrites=true&w=majority`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md transition-all">
      <div className="w-full max-w-md bg-slate-900 border-t border-x border-white/[0.12] rounded-t-[36px] p-5 shadow-2xl max-h-[92vh] overflow-y-auto hide-scrollbar animate-sheet">
        {/* Drawer Grabber Bar */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-white">App Settings & Guides</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Section 1: MongoDB Atlas Cloud Card */}
          <div className="p-4 rounded-[26px] glass-card-interactive border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">MongoDB Atlas Cloud</h3>
                  <p className="text-[10px] text-slate-400">Cloud database synchronization</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                  dbStatus.dbConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {dbStatus.dbConnected ? 'Connected & Synced' : 'Phone Local Storage'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2 font-medium">
              {dbStatus.dbConnected
                ? '✅ Cloud database connected! All expenses sync to your MongoDB Atlas account.'
                : '💾 Running in offline-first mode. Data is saved directly on your phone/browser.'}
            </p>

            {/* Beginner instructions for Atlas */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
              <span className="text-[11px] font-extrabold text-emerald-400 block">
                How to connect your MongoDB Atlas:
              </span>
              <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-0.5">
                <li>
                  Open this file in Notepad:
                  <div className="mt-1 p-2 bg-black/40 rounded-xl font-mono text-[11px] text-emerald-300">
                    Monthly_Expenses\backend\.env
                  </div>
                </li>
                <li>
                  Paste your connection string after <code className="text-emerald-400 font-bold">MONGODB_URI=</code>
                </li>
                <li>
                  Replace <code className="text-amber-300 font-bold">&lt;password&gt;</code> with your real MongoDB Atlas user password!
                </li>
              </ol>

              <div className="mt-2 p-2.5 bg-black/50 rounded-2xl border border-white/[0.06] text-[11px] font-mono text-slate-300 flex items-center justify-between">
                <span className="truncate pr-2">{envSample}</span>
                <button
                  onClick={copyEnv}
                  className="p-1.5 rounded-xl bg-white/[0.06] text-slate-300 hover:text-white"
                  title="Copy sample"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Android Phone Install Guide */}
          <div className="p-4 rounded-[26px] border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400">
                <Smartphone size={18} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white">How to Install on Android Mobile</h3>
                <p className="text-[10px] text-slate-400">Full screen native app feel</p>
              </div>
            </div>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside mt-2 font-medium">
              <li>
                Connect phone to the <strong className="text-white">same Wi-Fi network</strong> as your PC.
              </li>
              <li>
                Open <strong className="text-white">Google Chrome</strong> on your phone.
              </li>
              <li>
                Type in URL: <code className="text-emerald-400 font-bold bg-black/40 px-2 py-0.5 rounded">http://192.168.1.65:5173</code>
              </li>
              <li>
                Tap <strong className="text-white">3 dots (menu)</strong> in Chrome &rarr; tap <strong className="text-emerald-300">"Install App"</strong>.
              </li>
            </ol>
          </div>

          {/* Section 3: Demo Data & Clear */}
          <div className="p-4 rounded-[26px] glass-card-interactive border border-white/[0.08] space-y-2.5">
            <h3 className="text-xs font-black text-white">Data Management</h3>

            <button
              onClick={onSeedDemo}
              className="w-full py-3 px-3 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Sparkles size={15} />
              <span>Load 12 Months Sample Data (For Instant Chart Testing)</span>
            </button>

            {hasExpenses && (
              <button
                onClick={onClearData}
                className="w-full py-2.5 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Trash2 size={14} />
                <span>Clear All Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
