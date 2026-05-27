'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, Library, Sparkles, Users } from 'lucide-react';

const bottomNavItems = [
  { label: 'Home', href: '/', icon: LayoutGrid },
  { label: 'Assignments', href: '/assignments', icon: FileText },
  { label: 'Library', href: '/library', icon: Library },
  { label: 'AI Toolkit', href: '/ai-toolkit', icon: Sparkles },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on create/view/processing pages
  if (pathname.includes('/create') || pathname.includes('/view')) return null;
  if (pathname.match(/\/assignments\/[a-f0-9]+$/)) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-veda-dark z-40 border-t border-gray-800">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {bottomNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-white' : 'text-gray-500'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
