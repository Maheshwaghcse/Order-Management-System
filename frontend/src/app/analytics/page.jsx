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
  { id: '', name: 'All Pune Branches' },
  { id: 'pune_fc_road', name: 'FC Road (Deccan)' },
  { id: 'pune_kothrud', name: 'Kothrud (Karve Nagar)' },
  { id: 'pune_camp', name: 'Camp (MG Road)' },
  { id: 'pune_viman_nagar', name: 'Viman Nagar' },
];

const COLORS = ['#ea580c', '#16a34a', '#d97706', '#9333ea', '#2563eb'];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pune Store Sales Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily sales orders, top selling Pune dishes, and revenue per branch.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Row 1: Daily Orders Chart & Top 5 Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders per Day Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" /> Daily Orders Volume
            </h3>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Branch:</span>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="glass-input text-xs py-1"
              >
                {STORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingDay ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin text-orange-600 mr-2" /> Loading chart data...
            </div>
          ) : dailyOrders.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
              No orders data available for this branch.
            </div>
          ) : (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="_id"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="totalOrders" fill="#ea580c" radius={[4, 4, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top 5 Items List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-600" /> Top 5 Selling Dishes
            </h3>
          </div>

          {loadingItems ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-orange-600 mb-1" /> Loading...
            </div>
          ) : topItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No top items recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {topItems.map((item, idx) => (
                <div
                  key={item.item_id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center text-white"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.item_name}</div>
                      <div className="text-[11px] text-orange-600 font-semibold">
                        ₹{item.unit_price} / unit
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {item.total_quantity_sold} sold
                    </div>
                    <div className="text-[11px] text-emerald-600 font-bold">
                      ₹{item.total_item_revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid Row 2: Revenue per Store */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-600" /> Revenue per Pune Branch
          </h3>
        </div>

        {loadingRevenue ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-orange-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {storeRevenue.map((store) => (
              <div
                key={store.store_id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-700 uppercase">
                    {store.store_id}
                  </span>
                  <Store className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Sales</p>
                  <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                    ₹{store.total_revenue.toLocaleString('en-IN')}
                  </h4>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-600">
                  <span>Orders: <strong className="text-slate-900">{store.total_orders}</strong></span>
                  <span>Avg Bill: <strong className="text-emerald-700">₹{Math.round(store.avg_order_value)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
