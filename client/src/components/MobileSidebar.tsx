'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, FileText, MonitorSmartphone, Library, Sparkles, Settings } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useUserStore } from '@/store/userStore';

const navItems = [
  { label: 'Home', href: '/', icon: LayoutGrid },
  { label: 'My Groups', href: '/groups', icon: Users },
  { label: 'Assignments', href: '/assignments', icon: FileText },
  { label: "AI Teacher's Toolkit", href: '/ai-toolkit', icon: MonitorSmartphone },
  { label: 'My Library', href: '/library', icon: Library },
];

export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { assignments } = useAssignmentStore();
  const { name } = useUserStore();
  const assignmentCount = assignments.length;

  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={onClose}>
      <div
        className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-xl p-4 overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <Link
            href="/assignments/create"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)', border: '3px solid #E8652D' }}
          >
            <Sparkles size={18} />
            Create Assignment
          </Link>
        </div>
        <nav>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-0.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-gray-100 text-veda-dark font-semibold' : 'text-veda-muted hover:bg-gray-50'
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

        {/* Settings - at bottom like desktop */}
        <div className="px-1 mt-auto pt-4">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-veda-muted hover:bg-gray-50 transition-all"
          >
            <Settings size={20} strokeWidth={1.5} />
            Settings
          </Link>
        </div>

        {/* School info */}
        <div className="pt-3 pb-2 border-t border-veda-border mt-2">
          <div className="flex items-center gap-3 px-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg">🎓</div>
            <div>
              <p className="text-sm font-semibold">Delhi Public School</p>
              <p className="text-xs text-veda-muted">Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
