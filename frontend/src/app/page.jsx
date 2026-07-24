'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getRevenuePerStore, getOrdersPerDay, getArchiveStats } from '../lib/api';
import { useSocket } from '../providers/SocketProvider';
import {
  Store,
  PlusCircle,
  ListOrdered,
  RefreshCw,
  BarChart3,
  Archive,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Package,
  Zap,
} from 'lucide-react';

const STORES = [
  { id: 'store_downtown', name: 'Downtown flagship' },
  { id: 'store_uptown', name: 'Uptown Bistro' },
  { id: 'store_suburbs', name: 'Suburbs Express' },
  { id: 'store_airport', name: 'Airport Concourse' },
];

export default function DashboardPage() {
  const { activeStore, setActiveStore, isConnected } = useSocket();

  const { data: revenueData } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: getRevenuePerStore,
  });

  const { data: archiveData } = useQuery({
    queryKey: ['archive-stats'],
    queryFn: () => getArchiveStats(30),
  });

  const totalRevenue = revenueData?.data?.reduce((acc, s) => acc + s.total_revenue, 0) || 0;
  const totalActiveOrders = archiveData?.data?.activeCount || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden glass-card p-8 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-blue-500/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Real-Time Store Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Multi-Store Order Control Center
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Monitor incoming orders in real-time with WebSockets, update status transitions instantly, review Mongo aggregation analytics, and perform 30-day automated data archival.
          </p>
        </div>
      </div>

      {/* Real-time Room Selection Bar */}
      <div className="glass-card p-5 border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" /> Socket.IO Room Selector
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Filter real-time notifications by joining a store-specific WebSocket room.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveStore('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              !activeStore
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Stores (Global)
          </button>
          {STORES.map((store) => (
            <button
              key={store.id}
              onClick={() => setActiveStore(store.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeStore === store.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {store.id}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Orders</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalActiveOrders}</h3>
          </div>
        </div>

        <div className="glass-card p-6 border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-bold text-white mt-1">${totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="glass-card p-6 border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Stores</p>
            <h3 className="text-2xl font-bold text-white mt-1">{revenueData?.data?.length || 4} Stores</h3>
          </div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">System Core Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Create Order */}
          <Link
            href="/orders/create"
            className="glass-card p-6 border-slate-800 hover:border-blue-500/50 group transition-all space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                Page 1: Create Order <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Form interface to create orders with Zod validation and auto total computation.
              </p>
            </div>
          </Link>

          {/* Card 2: Orders List */}
          <Link
            href="/orders"
            className="glass-card p-6 border-slate-800 hover:border-blue-500/50 group transition-all space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                Page 2: Orders List <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Paginated list filtered by store_id with real-time WebSocket live updates.
              </p>
            </div>
          </Link>

          {/* Card 3: Update Order Status */}
          <Link
            href="/orders/status"
            className="glass-card p-6 border-slate-800 hover:border-blue-500/50 group transition-all space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                Page 3: Update Status <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Status transition board (PLACED → PREPARING → COMPLETED) with immediate broadcast.
              </p>
            </div>
          </Link>

          {/* Card 4: Analytics */}
          <Link
            href="/analytics"
            className="glass-card p-6 border-slate-800 hover:border-blue-500/50 group transition-all space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                Task 3: Aggregation Analytics <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Mongo aggregation pipelines for Orders/day, Store revenue, and Top 5 items.
              </p>
            </div>
          </Link>

          {/* Card 5: Archival */}
          <Link
            href="/archive"
            className="glass-card p-6 border-slate-800 hover:border-blue-500/50 group transition-all space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                Task 3: Data Archival <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Move orders older than 30 days into `orders_archive` collection.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
