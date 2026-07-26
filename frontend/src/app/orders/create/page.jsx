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
  Utensils,
} from 'lucide-react';

const PRESET_STORES = [
  { id: 'pune_fc_road', name: 'FC Road (Deccan)' },
  { id: 'pune_kothrud', name: 'Kothrud (Karve Nagar)' },
  { id: 'pune_camp', name: 'Camp (MG Road)' },
  { id: 'pune_viman_nagar', name: 'Viman Nagar' },
];

const PRESET_ITEMS = [
  { item_id: 'ITEM-001', item_name: 'Special Puneri Misal Pav', price: 90 },
  { item_id: 'ITEM-002', item_name: 'Hot Kanda Poha', price: 30 },
  { item_id: 'ITEM-003', item_name: 'Crispy Vada Pav', price: 20 },
  { item_id: 'ITEM-004', item_name: 'Chitale Special Bhakarwadi', price: 60 },
  { item_id: 'ITEM-005', item_name: 'Mango Mastani', price: 120 },
  { item_id: 'ITEM-006', item_name: 'Sabudana Vada', price: 50 },
  { item_id: 'ITEM-007', item_name: 'Puran Poli with Ghee', price: 70 },
  { item_id: 'ITEM-008', item_name: 'Ukdiche Modak', price: 80 },
  { item_id: 'ITEM-009', item_name: 'Bun Maska & Irani Chai', price: 45 },
  { item_id: 'ITEM-010', item_name: 'Pithla Bhakri Thali', price: 110 },
];

export default function CreateOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [storeId, setStoreId] = useState('pune_fc_road');
  const [customStoreId, setCustomStoreId] = useState('');
  const [items, setItems] = useState([
    { item_id: 'ITEM-001', item_name: 'Special Puneri Misal Pav', price: 90, qty: 1 },
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
      setItems([{ item_id: 'ITEM-001', item_name: 'Special Puneri Misal Pav', price: 90, qty: 1 }]);
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
      setErrorMsg('Please select or specify a store branch');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Order must contain at least one food item');
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create New Order</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a Pune branch and add menu items to create a food order.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => router.push(`/orders?store_id=${activeStoreId}`)}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md transition-colors"
          >
            View Orders →
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 flex items-center gap-2 text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Selection */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-orange-600" /> Select Pune Branch
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_STORES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStoreId(s.id);
                    setCustomStoreId('');
                  }}
                  className={`p-3 rounded-lg border text-xs font-semibold transition-all text-center ${
                    storeId === s.id
                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Or Custom Branch ID:
              </label>
              <input
                type="text"
                placeholder="e.g. pune_swargate"
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
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-600" /> Puneri Food Menu
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_ITEMS.map((preset) => {
                const existingItem = items.find((i) => i.item_id === preset.item_id);
                const qtyInCart = existingItem ? existingItem.qty : 0;

                return (
                  <button
                    key={preset.item_id}
                    type="button"
                    onClick={() => handleAddItem(preset)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all group ${
                      qtyInCart > 0
                        ? 'border-orange-500 bg-orange-50/70 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:border-orange-400 hover:bg-orange-50/30'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                        {preset.item_name}
                      </div>
                      <div className="text-xs text-orange-600 font-bold mt-0.5">
                        ₹{preset.price}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {qtyInCart > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-orange-600 text-white font-bold text-xs shadow-sm">
                          x{qtyInCart}
                        </span>
                      )}
                      <div className="w-7 h-7 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Cart */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 sticky top-20">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
              <span>Order Cart</span>
              <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                {items.reduce((acc, i) => acc + i.qty, 0)} Items
              </span>
            </h3>

            {/* Cart Items List */}
            {items.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Your cart is empty. Click items from the menu to add.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={item.item_id + idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-bold text-slate-800 truncate">
                        {item.item_name}
                      </div>
                      <div className="text-[11px] text-orange-600 font-semibold">
                        ₹{item.price * item.qty} (₹{item.price} each)
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(idx, -1)}
                        className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-slate-900">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(idx, 1)}
                        className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="w-6 h-6 rounded bg-rose-100 text-rose-600 hover:bg-rose-200 flex items-center justify-center ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Amount */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Branch:</span>
                <span className="font-bold text-slate-800">{activeStoreId || 'None'}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Bill:</span>
                <span className="text-orange-600 text-lg">₹{totalAmount}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={mutation.isPending || items.length === 0 || !activeStoreId}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold shadow-sm"
            >
              {mutation.isPending ? (
                <>Placing Order...</>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" /> Place Order (₹{totalAmount})
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
