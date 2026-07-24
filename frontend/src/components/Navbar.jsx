'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RealtimeBadge from './RealtimeBadge';
import {
  ShoppingBag,
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
    { href: '/archive', label: 'Data Archival', icon: Archive },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
              OmniStore
            </span>
            <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Order Platform
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Real-time Socket Indicator */}
        <RealtimeBadge />
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-slate-900/90 border-t border-slate-800/60 overflow-x-auto gap-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
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
