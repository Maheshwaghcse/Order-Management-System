'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrdersPerDay, getRevenuePerStore, getTopItems } from '../../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Award,
  Store,
  Calendar,
  RefreshCw,
} from 'lucide-react';

const STORES = [
  { id: '', name: 'All Stores' },
  { id: 'store_downtown', name: 'store_downtown' },
  { id: 'store_uptown', name: 'store_uptown' },
  { id: 'store_suburbs', name: 'store_suburbs' },
  { id: 'store_airport', name: 'store_airport' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [selectedStore, setSelectedStore] = useState('');

  const { data: perDayData, isLoading: loadingDay } = useQuery({
    queryKey: ['analytics-per-day', selectedStore],
    queryFn: () => getOrdersPerDay(selectedStore),
  });

  const { data: revenueData, isLoading: loadingRevenue } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: getRevenuePerStore,
  });

  const { data: topItemsData, isLoading: loadingItems } = useQuery({
    queryKey: ['analytics-top-items'],
    queryFn: () => getTopItems(5),
  });

  const dailyOrders = perDayData?.data || [];
  const storeRevenue = revenueData?.data || [];
  const topItems = topItemsData?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">MongoDB Analytics & Pipelines</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Task 3: Aggregation pipelines for Orders/Day, Store Revenue, and Top 5 Selling Items
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-blue-400" />
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="glass-input text-xs py-2 px-3"
          >
            {STORES.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Row 1: Orders Per Day & Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart 1: Orders Per Day */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> Orders & Daily Revenue Trend
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Pipeline: $group by $dateToString
            </span>
          </div>

          {loadingDay ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : dailyOrders.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              No daily order history available.
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyOrders} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="order_count" name="Orders Count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top 5 Items Leaderboard */}
        <div className="glass-card p-6 space-y-4 border-emerald-500/20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" /> Top 5 Selling Items
            </h3>
          </div>

          {loadingItems ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
            </div>
          ) : topItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No item sales recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, idx) => (
                <div
                  key={item.item_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center text-white"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{item.item_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ${item.unit_price} / unit
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white font-mono">
                      {item.total_quantity_sold} sold
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono font-semibold">
                      ${item.total_item_revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid Row 2: Revenue per Store */}
      <div className="glass-card p-6 space-y-6 border-blue-500/20">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" /> Total Revenue per Store
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Pipeline: $group by store_id, $sum total_amount
          </span>
        </div>

        {loadingRevenue ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {storeRevenue.map((store, idx) => (
              <div
                key={store.store_id}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 font-mono uppercase">
                    {store.store_id}
                  </span>
                  <Store className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Revenue</p>
                  <h4 className="text-xl font-extrabold text-white font-mono mt-0.5">
                    ${store.total_revenue.toFixed(2)}
                  </h4>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex justify-between text-[11px] text-slate-400">
                  <span>Total Orders: <strong className="text-slate-200">{store.total_orders}</strong></span>
                  <span>Avg: <strong className="text-emerald-400">${store.avg_order_value.toFixed(2)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
