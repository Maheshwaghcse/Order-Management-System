'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getRevenuePerStore, getArchiveStats } from '../lib/api';
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
} from 'lucide-react';

const STORES = [
  { id: 'pune_fc_road', name: 'FC Road' },
  { id: 'pune_kothrud', name: 'Kothrud' },
  { id: 'pune_camp', name: 'Camp' },
  { id: 'pune_viman_nagar', name: 'Viman Nagar' },
];

export default function DashboardPage() {
  const { activeStore, setActiveStore } = useSocket();

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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Puneri Swad - Order Dashboard
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Order management system for FC Road, Kothrud, Camp & Viman Nagar branches.
          </p>
        </div>

        <Link href="/orders/create" className="btn-primary flex items-center gap-2 text-sm shrink-0">
          <PlusCircle className="w-4 h-4" /> Create Order
        </Link>
      </div>

      {/* Store Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Store className="w-4 h-4 text-orange-600" /> Filter Branch:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveStore('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              !activeStore ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Branches
          </button>
          {STORES.map((store) => (
            <button
              key={store.id}
              onClick={() => setActiveStore(store.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeStore === store.id ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {store.name}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Orders</p>
            <h3 className="text-xl font-bold text-slate-900">{totalActiveOrders}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Sales</p>
            <h3 className="text-xl font-bold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Branches</p>
            <h3 className="text-xl font-bold text-slate-900">{STORES.length} Stores</h3>
          </div>
        </div>
      </div>

      {/* Main Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/orders/create" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-orange-500 transition-all group space-y-2">
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-orange-600 flex items-center gap-2">
            Create Order <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-slate-500">Place new orders for Misal Pav, Kanda Poha, Vada Pav & Mastani.</p>
        </Link>

        <Link href="/orders" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-orange-500 transition-all group space-y-2">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ListOrdered className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-orange-600 flex items-center gap-2">
            Orders List <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-slate-500">View live orders list with instant status updates.</p>
        </Link>

        <Link href="/orders/status" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-orange-500 transition-all group space-y-2">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-orange-600 flex items-center gap-2">
            Kitchen Board <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-slate-500">Update order status: Placed → Preparing → Completed.</p>
        </Link>

        <Link href="/analytics" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-orange-500 transition-all group space-y-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-orange-600 flex items-center gap-2">
            Sales Analytics <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-slate-500">Daily sales charts, top dishes, and revenue stats.</p>
        </Link>

        <Link href="/archive" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-orange-500 transition-all group space-y-2">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-orange-600 flex items-center gap-2">
            Data Archive <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-slate-500">Archive old completed orders to keep DB performance fast.</p>
        </Link>
      </div>
    </div>
  );
}
