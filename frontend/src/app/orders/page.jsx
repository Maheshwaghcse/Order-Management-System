'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../../lib/api';
import { useSocket } from '../../providers/SocketProvider';
import {
  ListOrdered,
  Store,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  RefreshCw,
  Search,
} from 'lucide-react';

const STORES = [
  { id: '', name: 'All Pune Branches' },
  { id: 'pune_fc_road', name: 'FC Road (Deccan)' },
  { id: 'pune_kothrud', name: 'Kothrud (Karve Nagar)' },
  { id: 'pune_camp', name: 'Camp (MG Road)' },
  { id: 'pune_viman_nagar', name: 'Viman Nagar' },
];

export default function OrdersListPage() {
  const { activeStore, setActiveStore } = useSocket();

  const [selectedStore, setSelectedStore] = useState(activeStore || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStoreChange = (storeId) => {
    setSelectedStore(storeId);
    setActiveStore(storeId);
    setPage(1);
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['orders', selectedStore, selectedStatus, page, limit],
    queryFn: () =>
      getOrders({
        store_id: selectedStore,
        status: selectedStatus,
        page,
        limit,
      }),
  });

  const orders = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.store_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((i) => i.item_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold">
            <Clock className="w-3 h-3" /> PLACED
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold">
            <ChefHat className="w-3 h-3" /> PREPARING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pune Food Orders List</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live orders list with real-time updates when orders are placed or updated.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* Store Tabs */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-orange-600" /> Select Branch Filter:
          </label>
          <div className="flex flex-wrap gap-2">
            {STORES.map((store) => (
              <button
                key={store.id}
                onClick={() => handleStoreChange(store.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStore === store.id
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {store.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          {/* Status Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-orange-600" /> Filter Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="glass-input w-full text-xs cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PLACED">PLACED</option>
              <option value="PREPARING">PREPARING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-orange-600" /> Search Orders
            </label>
            <input
              type="text"
              placeholder="Search Order ID or dish name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full text-xs"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-600" />
            <p className="text-xs font-medium">Loading orders...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-rose-600 space-y-1">
            <p className="text-sm font-bold">Failed to load orders</p>
            <p className="text-xs text-slate-500">{error.message}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-700">No orders found</p>
            <p className="text-xs text-slate-500">
              No orders match the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Order ID</th>
                  <th className="py-3 px-5">Branch</th>
                  <th className="py-3 px-5">Items</th>
                  <th className="py-3 px-5">Total</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 text-slate-900 font-mono font-bold">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                        {order.store_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 max-w-xs">
                      <div className="space-y-0.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-slate-800 text-xs">
                            <span className="text-orange-600 font-bold">{item.qty}x</span>{' '}
                            {item.item_name}
                            <span className="text-slate-500 text-[11px] ml-1">
                              (₹{item.price})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900 text-sm">
                      ₹{order.total_amount}
                    </td>
                    <td className="py-3.5 px-5">{getStatusBadge(order.status)}</td>
                    <td className="py-3.5 px-5 text-slate-500 text-[11px]" suppressHydrationWarning>
                      {mounted && order.created_at ? new Date(order.created_at).toLocaleString() : '...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
            <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} orders)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="px-3 py-1 bg-white rounded-md text-xs font-semibold text-orange-600 border border-slate-200 shadow-sm">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages || isFetching}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
