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
} from 'lucide-react';

const STORES = [
  { id: '', name: 'All Pune Branches' },
  { id: 'pune_fc_road', name: 'FC Road (Deccan)' },
  { id: 'pune_kothrud', name: 'Kothrud (Karve Nagar)' },
  { id: 'pune_camp', name: 'Camp (MG Road)' },
  { id: 'pune_viman_nagar', name: 'Viman Nagar' },
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

  const handleStatusChange = (orderId, newStatus) => {
    mutation.mutate({ id: orderId, status: newStatus });
  };

  const orders = data?.data || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" /> PLACED
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold">
            <ChefHat className="w-3.5 h-3.5" /> PREPARING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
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
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kitchen Status Board</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Update order progress (Placed → Preparing → Completed) for kitchen staff.
            </p>
          </div>
        </div>
      </div>

      {/* Store Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-semibold text-slate-800">Filter Branch:</span>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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

      {/* Status Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-600" />
          <p className="text-xs font-semibold">Loading orders...</p>
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-rose-600 space-y-1">
          <p className="text-sm font-bold">Error loading status board</p>
          <p className="text-xs text-slate-500">{error.message}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <p className="text-sm font-bold text-slate-700">No active orders</p>
          <p className="text-xs text-slate-500 mt-1">
            No orders match the selected branch.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 transition-all ${
                updatingId === order.id ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-mono font-bold text-slate-900 text-sm">{order.id}</h3>
                  <span className="text-[11px] font-semibold text-slate-500">{order.store_id}</span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Items List */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>
                      <span className="text-orange-600 font-bold">{item.qty}x</span> {item.item_name}
                    </span>
                    <span className="font-mono text-slate-500">₹{item.price * item.qty}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-orange-600 font-mono">₹{order.total_amount}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Set Status:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange(order.id, 'PLACED')}
                    disabled={order.status === 'PLACED'}
                    className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all ${
                      order.status === 'PLACED'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    PLACED
                  </button>

                  <button
                    onClick={() => handleStatusChange(order.id, 'PREPARING')}
                    disabled={order.status === 'PREPARING'}
                    className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all ${
                      order.status === 'PREPARING'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    PREPARING
                  </button>

                  <button
                    onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                    disabled={order.status === 'COMPLETED'}
                    className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
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
