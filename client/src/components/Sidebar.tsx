'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import VedaLogo from './VedaLogo';
import { useAssignmentStore } from '@/store/assignmentStore';
import {
  LayoutGrid,
  Users,
  FileText,
  MonitorSmartphone,
  Library,
  Settings,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: LayoutGrid },
  { label: 'My Groups', href: '/groups', icon: Users },
  { label: 'Assignments', href: '/assignments', icon: FileText },
  { label: "AI Teacher's Toolkit", href: '/ai-toolkit', icon: MonitorSmartphone },
  { label: 'My Library', href: '/library', icon: Library },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { assignments } = useAssignmentStore();
  const assignmentCount = assignments.length;

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 bg-white border-r border-veda-border overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5">
        <VedaLogo size={36} />
        <span className="text-xl font-bold text-veda-dark tracking-tight">
          VedaAI
        </span>
      </div>

      {/* Create Assignment Button */}
      <div className="px-4 mb-4">
        <Link
          href="/assignments/create"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
            border: '3px solid #E8652D',
          }}
        >
          <Sparkles size={18} />
          Create Assignment
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-0.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gray-100 text-veda-dark font-semibold'
                  : 'text-veda-muted hover:bg-gray-50 hover:text-veda-dark'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className="flex-1">{item.label}</span>
              {item.label === 'Assignments' && assignmentCount > 0 && (
                <span className="min-w-[22px] h-[22px] flex items-center justify-center bg-veda-orange text-white text-[11px] font-bold rounded-full px-1.5">
                  {assignmentCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 mb-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-veda-muted hover:bg-gray-50 hover:text-veda-dark transition-all"
        >
          <Settings size={20} strokeWidth={1.5} />
          Settings
        </Link>
      </div>

      {/* School info */}
      <div className="px-4 py-4 border-t border-veda-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg">
            🎓
          </div>
          <div>
            <p className="text-sm font-semibold text-veda-dark">
              Delhi Public School
            </p>
            <p className="text-xs text-veda-muted">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
