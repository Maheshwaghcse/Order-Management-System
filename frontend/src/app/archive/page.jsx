'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArchiveStats, archiveOldOrders } from '../../lib/api';
import {
  Archive,
  Clock,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function ArchivePage() {
  const [days, setDays] = useState(30);
  const [resultMsg, setResultMsg] = useState(null);
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: statsData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['archive-stats', days],
    queryFn: () => getArchiveStats(days),
  });

  const mutation = useMutation({
    mutationFn: (daysThreshold) => archiveOldOrders(daysThreshold),
    onSuccess: (data) => {
      setResultMsg({
        type: 'success',
        text: data.message || `Archived ${data.archivedCount} orders!`,
      });
      // Invalidate queries so orders list and analytics update
      queryClient.invalidateQueries({ queryKey: ['archive-stats'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-per-day'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-revenue'] });
    },
    onError: (err) => {
      setResultMsg({
        type: 'error',
        text: err.message || 'Archival operation failed',
      });
    },
  });

  const stats = statsData?.data || {
    activeCount: 0,
    eligibleForArchiveCount: 0,
    totalArchivedCount: 0,
    cutoffDate: new Date(),
  };

  const handleRunArchive = () => {
    setResultMsg(null);
    mutation.mutate(days);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Data Archival Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Task 3: Automated database optimization & archiving (`POST /archive-old-orders`)
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-secondary text-xs flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* Result Message */}
      {resultMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            resultMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {resultMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <span>{resultMsg.text}</span>
          </div>
        </div>
      )}

      {/* Database Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Collection</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-3xl font-extrabold text-white font-mono">
            {isLoading ? '...' : stats.activeCount}
          </h3>
          <p className="text-[11px] text-slate-500">Live `orders` collection documents</p>
        </div>

        <div className="glass-card p-6 border-amber-500/30 bg-amber-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Eligible for Archival</span>
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-3xl font-extrabold text-amber-400 font-mono">
            {isLoading ? '...' : stats.eligibleForArchiveCount}
          </h3>
          <p className="text-[11px] text-amber-300/70">
            Orders older than {days} days
          </p>
        </div>

        <div className="glass-card p-6 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Archived Collection</span>
            <Archive className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-3xl font-extrabold text-white font-mono">
            {isLoading ? '...' : stats.totalArchivedCount}
          </h3>
          <p className="text-[11px] text-slate-500">Historical `orders_archive` documents</p>
        </div>
      </div>

      {/* Archival Action Control Panel */}
      <div className="glass-card p-8 border-amber-500/20 space-y-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" /> Archival Configuration & Execution
          </h3>
          <p className="text-xs text-slate-400">
            Transfers documents matching <code className="text-amber-400 font-mono">created_at &lt; cutoff_date</code> into <code className="text-blue-400 font-mono">orders_archive</code> and removes them from active query indexes.
          </p>
        </div>

        {/* Days Threshold Selector */}
        <div className="space-y-3 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-200">Cutoff Threshold (Days):</label>
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg text-sm">
              {days} Days Threshold
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="60"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-1">
            <span>1 Day (Testing mode)</span>
            <span>30 Days (Production standard requirement)</span>
            <span>60 Days</span>
          </div>
        </div>

        {/* Cutoff Info */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between items-center text-slate-300">
          <span>Target Cutoff Date:</span>
          <span className="font-mono text-amber-400 font-semibold" suppressHydrationWarning>
            {mounted && stats.cutoffDate ? new Date(stats.cutoffDate).toLocaleString() : '...'}
          </span>
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleRunArchive}
          disabled={mutation.isPending || stats.eligibleForArchiveCount === 0}
          className="btn-primary bg-amber-600 hover:bg-amber-500 w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-900/30"
        >
          {mutation.isPending ? (
            <>Archiving Orders...</>
          ) : (
            <>
              <Archive className="w-4 h-4" /> Archive {stats.eligibleForArchiveCount} Orders Older Than {days} Days
            </>
          )}
        </button>
      </div>
    </div>
  );
}
