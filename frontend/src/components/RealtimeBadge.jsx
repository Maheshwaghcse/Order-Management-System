'use client';

import React from 'react';
import { useSocket } from '../providers/SocketProvider';
import { Wifi, WifiOff, RefreshCw, Store } from 'lucide-react';

export default function RealtimeBadge() {
  const { connectionStatus, activeStore } = useSocket();

  let colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotClass = 'bg-emerald-500 animate-pulse';
  let icon = <Wifi className="w-3.5 h-3.5" />;
  let label = 'Live Sockets';

  if (connectionStatus === 'connecting' || connectionStatus === 'reconnecting') {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    dotClass = 'bg-amber-500 animate-spin';
    icon = <RefreshCw className="w-3.5 h-3.5 animate-spin" />;
    label = connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Connecting...';
  } else if (connectionStatus === 'disconnected') {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
    dotClass = 'bg-rose-500';
    icon = <WifiOff className="w-3.5 h-3.5" />;
    label = 'Disconnected';
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${colorClass}`}
      >
        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
        {icon}
        <span>{label}</span>
      </div>

      {activeStore && (
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-xs font-semibold">
          <Store className="w-3.5 h-3.5" />
          <span>Branch: {activeStore}</span>
        </div>
      )}
    </div>
  );
}
