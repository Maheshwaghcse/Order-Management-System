'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArchiveStats, archiveOldOrders } from '../../lib/api';
import {
  Archive,
  Clock,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Order Data Archive</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Archive past completed orders to keep the database fast and clean.
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-secondary text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Result Notification */}
      {resultMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-sm ${
            resultMsg.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : 'border-rose-300 bg-rose-50 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {resultMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{resultMsg.text}</span>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Collection</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {isLoading ? '...' : stats.activeCount}
          </h3>
          <p className="text-[11px] text-slate-500">Active `orders` documents</p>
        </div>

        <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-orange-800 font-bold">
            <span>Eligible for Archival</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-orange-700">
            {isLoading ? '...' : stats.eligibleForArchiveCount}
          </h3>
          <p className="text-[11px] text-orange-800/80">
            Orders older than {days} days
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Archived Storage</span>
            <Archive className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {isLoading ? '...' : stats.totalArchivedCount}
          </h3>
          <p className="text-[11px] text-slate-500">Archived `orders_archive` documents</p>
        </div>
      </div>

      {/* Action Control Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="space-y-1 border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-600" /> Archival Threshold & Action
          </h3>
          <p className="text-xs text-slate-500">
            Select the age threshold to archive completed orders into <code className="text-orange-600 font-bold">orders_archive</code>.
          </p>
        </div>

        {/* Days Threshold Slider */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-800">Archive Threshold:</label>
            <span className="font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-md text-xs border border-orange-200">
              Older than {days} Days
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="60"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-1">
            <span>1 Day (Test)</span>
            <span>30 Days (Standard)</span>
            <span>60 Days</span>
          </div>
        </div>

        {/* Cutoff Info */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center text-slate-700">
          <span>Target Cutoff Date:</span>
          <span className="font-bold text-orange-700" suppressHydrationWarning>
            {mounted && stats.cutoffDate ? new Date(stats.cutoffDate).toLocaleString() : '...'}
          </span>
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleRunArchive}
          disabled={mutation.isPending || stats.eligibleForArchiveCount === 0}
          className="btn-primary bg-orange-600 hover:bg-orange-700 w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
        >
          {mutation.isPending ? (
            <>Archiving Orders...</>
          ) : (
            <>
              <Archive className="w-4 h-4" /> Move {stats.eligibleForArchiveCount} Orders to Archive
            </>
          )}
        </button>
      </div>
    </div>
  );
}
