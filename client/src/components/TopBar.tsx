'use client';

import VedaLogo from './VedaLogo';
import { Bell, Menu, X, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MobileSidebar from './MobileSidebar';
import { useUserStore } from '@/store/userStore';

function getMobileTitle(pathname: string): { title: string; showBack: boolean } {
  if (pathname === '/assignments/create') return { title: 'Create Assignment', showBack: true };
  if (pathname.includes('/view')) return { title: '', showBack: false };
  if (pathname.match(/\/assignments\/[a-f0-9]+$/)) return { title: 'Generating...', showBack: true };
  if (pathname === '/assignments') return { title: 'Assignments', showBack: true };
  return { title: '', showBack: false };
}

export default function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { title: mobileTitle, showBack } = getMobileTitle(pathname);
  const { name } = useUserStore();
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* Desktop Top Bar */}
      <header className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-veda-border">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-veda-muted hover:text-veda-dark">
            ←
          </button>
          <div className="flex items-center gap-2 text-sm text-veda-muted">
            <LayoutGrid size={16} />
            Assignment
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
            <Bell size={20} className="text-veda-dark" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            </div>
            <span className="text-sm font-medium text-veda-dark">{name}</span>
            <span className="text-veda-muted text-xs">▾</span>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-veda-border">
        <div className="flex items-center gap-2">
          <VedaLogo size={32} />
          <span className="text-lg font-bold text-veda-dark">VedaAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-1.5">
            <Bell size={20} className="text-veda-dark" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1">
            {mobileMenuOpen ? (
              <X size={24} className="text-veda-dark" />
            ) : (
              <Menu size={24} className="text-veda-dark" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sub-header with back arrow + title (Figma style) */}
      {mobileTitle && (
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#F2F2F2]">
          {showBack && (
            <button onClick={() => router.back()} className="p-1 -ml-1">
              <ArrowLeft size={20} className="text-veda-dark" />
            </button>
          )}
          <h1 className="text-base font-bold text-veda-dark">{mobileTitle}</h1>
        </div>
      )}

      {mobileMenuOpen && (
        <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
      )}
    </>
  );
}

function LayoutGrid({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
