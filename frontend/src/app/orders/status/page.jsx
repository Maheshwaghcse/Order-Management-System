'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, updateOrderStatus } from '../../../lib/api';
import { useSocket } from '../../../providers/SocketProvider';
import {
  RefreshCw,
  Clock,
  ChefHat,
  CheckCircle2,
  Store,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const STORES = [
  { id: '', name: 'All Stores' },
  { id: 'store_downtown', name: 'store_downtown' },
  { id: 'store_uptown', name: 'store_uptown' },
  { id: 'store_suburbs', name: 'store_suburbs' },
  { id: 'store_airport', name: 'store_airport' },
];

export default function UpdateStatusPage() {
  const { activeStore, setActiveStore } = useSocket();

  const [selectedStore, setSelectedStore] = useState(activeStore || '');
  const [updatingId, setUpdatingId] = useState(null);
  const queryClient = useQueryClient();

  const handleStoreChange = (storeId) => {
    setSelectedStore(storeId);
    setActiveStore(storeId);
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['orders', selectedStore, '', 1, 30],
    queryFn: () =>
      getOrders({
        store_id: selectedStore,
        page: 1,
        limit: 30,
      }),
  });

  const mutation = useMutation({
    mutationFn: updateOrderStatus,
    onMutate: (variables) => {
      setUpdatingId(variables.id);
    },
    onSuccess: () => {
      setUpdatingId(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err) => {
      setUpdatingId(null);
      alert(`Failed to update status: ${err.message}`);
    },
  });

  const orders = data?.data || [];

  const handleStatusChange = (orderId, newStatus) => {
    mutation.mutate({ id: orderId, status: newStatus });
  };

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
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Order Status Workflow</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Page 3: Live status transition board (`PLACED` → `PREPARING` → `COMPLETED`)
            </p>
          </div>
        </div>

        {/* Store Selector */}
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-blue-400" />
          <select
            value={selectedStore}
            onChange={(e) => handleStoreChange(e.target.value)}
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

      {/* Kanban / Cards Layout */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-500" />
          <p className="text-sm">Fetching active orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card py-16 text-center text-slate-400 space-y-2">
          <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-base font-semibold text-slate-300">No active orders</p>
          <p className="text-xs text-slate-500">Create an order from Page 1 to test status updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`glass-card p-5 space-y-4 border-slate-800 transition-all ${
                updatingId === order.id ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-mono font-bold text-white text-sm">{order.id}</h3>
                  <span className="text-[11px] text-slate-400">{order.store_id}</span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Items List */}
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300">
                    <span>
                      <span className="text-blue-400 font-semibold">{item.qty}x</span> {item.item_name}
                    </span>
                    <span className="font-mono text-slate-500">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-emerald-400 font-mono">${order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Update Status to:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange(order.id, 'PLACED')}
                    disabled={order.status === 'PLACED'}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      order.status === 'PLACED'
                        ? 'bg-blue-600 text-white opacity-50 cursor-not-allowed'
                        : 'bg-slate-800 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20'
                    }`}
                  >
                    PLACED
                  </button>

                  <button
                    onClick={() => handleStatusChange(order.id, 'PREPARING')}
                    disabled={order.status === 'PREPARING'}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      order.status === 'PREPARING'
                        ? 'bg-amber-600 text-white opacity-50 cursor-not-allowed'
                        : 'bg-slate-800 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                    }`}
                  >
                    PREPARING
                  </button>

                  <button
                    onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                    disabled={order.status === 'COMPLETED'}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white opacity-50 cursor-not-allowed'
                        : 'bg-slate-800 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                    }`}
                  >
                    COMPLETED
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
