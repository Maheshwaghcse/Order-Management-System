'use client';

import React from 'react';
import { useSocket } from '../providers/SocketProvider';
import { X, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export default function ToastContainer() {
  const { toastNotifications, removeToast } = useSocket();

  if (!toastNotifications || toastNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toastNotifications.map((toast) => {
        let borderClass = 'border-blue-500/40 bg-slate-900/90 text-slate-100';
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/40 bg-slate-900/95 text-slate-100 shadow-emerald-950/50';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/40 bg-slate-900/95 text-slate-100';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all animate-in slide-in-from-bottom-3 duration-300 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-wide">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
