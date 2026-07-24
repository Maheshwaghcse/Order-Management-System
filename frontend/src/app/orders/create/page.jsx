'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Store,
} from 'lucide-react';

const PRESET_STORES = [
  'store_downtown',
  'store_uptown',
  'store_suburbs',
  'store_airport',
];

const PRESET_ITEMS = [
  { item_id: 'ITEM-001', item_name: 'Artisanal Espresso', price: 4.5 },
  { item_id: 'ITEM-002', item_name: 'Avocado Sourdough Toast', price: 12.0 },
  { item_id: 'ITEM-003', item_name: 'Cold Brew Coffee', price: 5.5 },
  { item_id: 'ITEM-004', item_name: 'Matcha Latte', price: 6.0 },
  { item_id: 'ITEM-005', item_name: 'Truffle Mushroom Burger', price: 18.5 },
  { item_id: 'ITEM-006', item_name: 'Crispy French Fries', price: 6.5 },
  { item_id: 'ITEM-007', item_name: 'Acai Superfood Bowl', price: 13.5 },
  { item_id: 'ITEM-008', item_name: 'Fresh Croissant', price: 4.0 },
];

export default function CreateOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [storeId, setStoreId] = useState('store_downtown');
  const [customStoreId, setCustomStoreId] = useState('');
  const [items, setItems] = useState([
    { item_id: 'ITEM-001', item_name: 'Artisanal Espresso', price: 4.5, qty: 1 },
  ]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const activeStoreId = storeId === 'custom' ? customStoreId.trim() : storeId;

  // Total amount computation
  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
    0
  );

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      setSuccessMsg(`Order #${data.data.id} created successfully!`);
      setErrorMsg('');
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Reset form
      setItems([{ item_id: 'ITEM-001', item_name: 'Artisanal Espresso', price: 4.5, qty: 1 }]);
    },
    onError: (error) => {
      setErrorMsg(error.message || 'Failed to create order');
      setSuccessMsg('');
    },
  });

  const handleAddItem = (presetItem) => {
    const existingIndex = items.findIndex((i) => i.item_id === presetItem.item_id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].qty += 1;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          item_id: presetItem.item_id,
          item_name: presetItem.item_name,
          price: presetItem.price,
          qty: 1,
        },
      ]);
    }
  };

  const handleUpdateQty = (index, delta) => {
    const updated = [...items];
    const newQty = updated[index].qty + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].qty = newQty;
    }
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeStoreId) {
      setErrorMsg('Please select or specify a store_id');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Order must contain at least one item');
      return;
    }

    mutation.mutate({
      store_id: activeStoreId,
      items: items.map((i) => ({
        item_id: i.item_id,
        item_name: i.item_name,
        price: Number(i.price),
        qty: Number(i.qty),
      })),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create New Order</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Page 1: Submit new order to backend with Zod validation & real-time Socket broadcast
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => router.push(`/orders?store_id=${activeStoreId}`)}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            View Orders →
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Selection */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-400" /> Select Store Location
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_STORES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStoreId(s);
                    setCustomStoreId('');
                  }}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all text-center ${
                    storeId === s
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Or Custom Store ID:
              </label>
              <input
                type="text"
                placeholder="e.g. store_westside_01"
                value={customStoreId}
                onChange={(e) => {
                  setCustomStoreId(e.target.value);
                  setStoreId('custom');
                }}
                className="glass-input w-full text-xs"
              />
            </div>
          </div>

          {/* Catalog Item Picker */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-400" /> Add Items from Menu
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_ITEMS.map((preset) => (
                <button
                  key={preset.item_id}
                  type="button"
                  onClick={() => handleAddItem(preset)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-blue-500/50 hover:bg-slate-900 transition-all text-left group"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                      {preset.item_name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      ${preset.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Cart */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6 sticky top-24 border-blue-500/20">
            <h3 className="text-base font-bold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                {items.reduce((acc, i) => acc + i.qty, 0)} Items
              </span>
            </h3>

            {/* Cart Items List */}
            {items.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No items added yet. Click menu items on the left to build the order.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={item.item_id + idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-semibold text-slate-200 truncate">
                        {item.item_name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ${(item.price * item.qty).toFixed(2)} (${item.price}/ea)
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(idx, -1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-white">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(idx, 1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="w-6 h-6 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Amount */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Target Store</span>
                <span className="font-semibold text-white font-mono">{activeStoreId || 'None'}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800/60">
                <span>Total Amount</span>
                <span className="text-emerald-400 font-mono text-xl">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={mutation.isPending || items.length === 0 || !activeStoreId}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm shadow-xl shadow-blue-900/30"
            >
              {mutation.isPending ? (
                <>Creating Order...</>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" /> Place Order (${totalAmount.toFixed(2)})
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
