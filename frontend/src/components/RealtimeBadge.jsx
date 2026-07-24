'use client';

import React from 'react';
import { useSocket } from '../providers/SocketProvider';
import { Wifi, WifiOff, RefreshCw, Store } from 'lucide-react';

export default function RealtimeBadge() {
  const { connectionStatus, activeStore } = useSocket();

  let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let dotClass = 'bg-emerald-500 animate-pulse';
  let icon = <Wifi className="w-3.5 h-3.5" />;
  let label = 'Live Sockets';

  if (connectionStatus === 'connecting' || connectionStatus === 'reconnecting') {
    colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    dotClass = 'bg-amber-500 animate-spin';
    icon = <RefreshCw className="w-3.5 h-3.5 animate-spin" />;
    label = connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Connecting...';
  } else if (connectionStatus === 'disconnected') {
    colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    dotClass = 'bg-rose-500';
    icon = <WifiOff className="w-3.5 h-3.5" />;
    label = 'Disconnected';
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium backdrop-blur-md transition-all ${colorClass}`}
      >
        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
        {icon}
        <span>{label}</span>
      </div>

      {activeStore && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium">
          <Store className="w-3.5 h-3.5" />
          <span>Room: {activeStore}</span>
        </div>
      )}
    </div>
  );
}
