'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RealtimeBadge from './RealtimeBadge';
import {
  UtensilsCrossed,
  PlusCircle,
  ListOrdered,
  RefreshCw,
  BarChart3,
  Archive,
  Store,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Overview', icon: Store },
    { href: '/orders/create', label: 'Create Order', icon: PlusCircle },
    { href: '/orders', label: 'Orders List', icon: ListOrdered },
    { href: '/orders/status', label: 'Update Status', icon: RefreshCw },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/archive', label: 'Archive', icon: Archive },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 block leading-tight">
              Puneri Swad
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Food & Snack Corner
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-orange-600 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Real-time Socket Indicator */}
        <RealtimeBadge />
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto gap-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
