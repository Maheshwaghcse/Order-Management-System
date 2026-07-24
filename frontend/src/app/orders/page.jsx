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
  { id: '', name: 'All Stores' },
  { id: 'store_downtown', name: 'store_downtown' },
  { id: 'store_uptown', name: 'store_uptown' },
  { id: 'store_suburbs', name: 'store_suburbs' },
  { id: 'store_airport', name: 'store_airport' },
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
    setActiveStore(storeId); // Also join Socket.IO store room
    setPage(1);
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
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

  // Local search filter for order ID or item names
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> PLACED
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold">
            <ChefHat className="w-3.5 h-3.5 animate-pulse" /> PREPARING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Orders List</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Page 2: Paginated store orders with live WebSocket auto-refresh updates
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-secondary text-xs flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Store Filter */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-400" /> Filter by Store
            </label>
            <select
              value={selectedStore}
              onChange={(e) => handleStoreChange(e.target.value)}
              className="glass-input w-full text-xs cursor-pointer"
            >
              {STORES.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-400" /> Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="glass-input w-full text-xs cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-100">
                All Statuses
              </option>
              <option value="PLACED" className="bg-slate-900 text-slate-100">
                PLACED
              </option>
              <option value="PREPARING" className="bg-slate-900 text-slate-100">
                PREPARING
              </option>
              <option value="COMPLETED" className="bg-slate-900 text-slate-100">
                COMPLETED
              </option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-400" /> Search Order / Item
            </label>
            <input
              type="text"
              placeholder="Search ID, store, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full text-xs"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden border-slate-800">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-sm">Loading orders from MongoDB...</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-rose-400 space-y-2">
            <p className="text-sm font-semibold">Failed to fetch orders</p>
            <p className="text-xs text-slate-500">{error.message}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-base font-semibold text-slate-300">No orders found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No orders match the selected store/status filters. Try creating a new order or clearing filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Store Location</th>
                  <th className="py-3.5 px-6">Items Summary</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-4 px-6 text-white font-mono font-semibold">
                      {order.id}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700 text-[11px]">
                        {order.store_id}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-slate-300 text-xs">
                            <span className="text-blue-400 font-semibold">{item.qty}x</span>{' '}
                            {item.item_name}
                            <span className="text-slate-500 text-[11px] font-mono ml-1">
                              (${item.price})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-emerald-400 text-sm">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-6 text-slate-400 text-[11px] font-mono" suppressHydrationWarning>
                      {mounted && order.created_at ? new Date(order.created_at).toLocaleString() : '...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Showing Page <span className="font-bold text-white">{pagination.page}</span> of{' '}
            <span className="font-bold text-white">{pagination.totalPages}</span> ({pagination.total} total orders)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="px-3 py-1 bg-slate-900 rounded-lg text-xs font-mono text-blue-400 border border-slate-800">
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
