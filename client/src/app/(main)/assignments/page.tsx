'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAssignmentStore, Assignment } from '@/store/assignmentStore';
import { api } from '@/lib/api';
import { Search, Filter, MoreVertical, Plus, X, ChevronDown } from 'lucide-react';

export default function AssignmentsPage() {
  const { assignments, setAssignments, removeAssignment, loading, setLoading } =
    useAssignmentStore();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    // Only show loading skeleton if we have no cached data
    if (assignments.length === 0) setLoading(true);
    api
      .getAssignments()
      .then(setAssignments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setAssignments, setLoading]);

  const filtered = assignments
    .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
    .filter((a) => {
      if (statusFilter === 'all') return true;
      return a.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const activeFilterCount = sortBy !== 'newest' ? 1 : 0;

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAssignment(id);
      removeAssignment(id);
    } catch {}
    setMenuOpen(null);
  };

  // Empty state
  if (!loading && assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center relative">
            {/* Document icon */}
            <div className="w-20 h-28 bg-white rounded-lg shadow-sm relative">
              <div className="absolute top-4 left-3 right-3 h-2 bg-gray-800 rounded" />
              <div className="absolute top-9 left-3 w-6 h-1.5 bg-gray-300 rounded" />
              <div className="absolute top-9 right-3 w-4 h-1.5 bg-gray-300 rounded" />
              <div className="absolute top-[3.2rem] left-3 right-3 h-1 bg-gray-200 rounded" />
              <div className="absolute top-[3.8rem] left-3 right-5 h-1 bg-gray-200 rounded" />
            </div>
            {/* Magnifier with X */}
            <div className="absolute bottom-2 right-2">
              <div className="w-16 h-16 rounded-full border-4 border-purple-300 bg-white/80 flex items-center justify-center">
                <span className="text-red-500 text-2xl font-bold">✕</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-4 h-8 bg-purple-300 rounded-full rotate-45" />
            </div>
            {/* Decorations */}
            <div className="absolute top-2 left-4 text-blue-400 text-lg">✦</div>
            <div className="absolute bottom-8 right-0 w-2 h-2 bg-blue-400 rounded-full" />
            <div className="absolute top-12 right-2 w-1.5 h-1.5 bg-pink-400 rounded-full" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-veda-dark mb-3">
          No assignments yet
        </h2>
        <p className="text-sm text-veda-muted max-w-md mb-8 leading-relaxed">
          Create your first assignment to start collecting and grading student
          submissions. You can set up rubrics, define marking criteria, and let AI
          assist with grading.
        </p>
        <Link
          href="/assignments/create"
          className="flex items-center gap-2 bg-veda-dark text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition active:scale-[0.98]"
        >
          <Plus size={18} />
          Create Your First Assignment
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header - desktop only, mobile uses TopBar sub-header */}
      <div className="mb-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
          <h1 className="text-xl lg:text-2xl font-bold text-veda-dark">
            Assignments
          </h1>
        </div>
        <p className="text-sm text-veda-muted ml-5">
          Manage and create assignments for your classes.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm border transition shrink-0 ${
              activeFilterCount > 0 ? 'border-veda-orange text-veda-orange' : 'border-veda-border text-veda-muted hover:border-gray-300'
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filter By</span>
            <span className="sm:hidden">Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-veda-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>

          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute left-0 top-12 bg-white rounded-xl shadow-lg border border-veda-border p-4 z-20 min-w-[200px]">
                <div className="mb-3">
                  <p className="text-xs font-semibold text-veda-muted uppercase mb-2">Sort By</p>
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'title', label: 'Title (A-Z)' },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSortBy(s.value)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        sortBy === s.value ? 'bg-gray-100 font-semibold text-veda-dark' : 'text-veda-muted hover:bg-gray-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setSortBy('newest'); }}
                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex-1">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-veda-muted"
            />
            <input
              type="text"
              placeholder="Search Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm border border-veda-border focus:outline-none focus:border-veda-orange transition"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((a) => (
            <AssignmentCard
              key={a._id}
              assignment={a}
              menuOpen={menuOpen === a._id}
              onMenuToggle={() =>
                setMenuOpen(menuOpen === a._id ? null : a._id)
              }
              onDelete={() => handleDelete(a._id)}
              onCloseMenu={() => setMenuOpen(null)}
            />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      {assignments.length > 0 && (
        <>
          {/* Desktop */}
          <div className="hidden lg:flex justify-center mt-8">
            <Link
              href="/assignments/create"
              className="flex items-center gap-2 bg-veda-dark text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition"
            >
              <Plus size={16} />
              Create Assignment
            </Link>
          </div>
          {/* Mobile FAB */}
          <Link
            href="/assignments/create"
            className="lg:hidden fixed bottom-20 right-4 w-12 h-12 bg-veda-orange text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition z-30"
          >
            <Plus size={24} />
          </Link>
        </>
      )}
    </div>
  );
}

function AssignmentCard({
  assignment,
  menuOpen,
  onMenuToggle,
  onDelete,
  onCloseMenu,
}: {
  assignment: Assignment;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onDelete: () => void;
  onCloseMenu: () => void;
}) {
  const formatDate = (d: string) => {
    try {
      const date = new Date(d);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '-');
    } catch {
      return d;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 lg:p-6 relative group hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <Link
          href={
            assignment.status === 'completed'
              ? `/assignments/${assignment._id}/view`
              : `/assignments/${assignment._id}`
          }
          className="flex-1"
        >
          <h3 className="text-base lg:text-lg font-bold text-veda-dark mb-3 hover:text-veda-orange transition">
            {assignment.title}
          </h3>
        </Link>
        <div className="relative">
          <button
            onClick={onMenuToggle}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <MoreVertical size={18} className="text-veda-muted" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={onCloseMenu} />
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-veda-border py-2 z-20 min-w-[160px]">
                <Link
                  href={`/assignments/${assignment._id}/view`}
                  className="block px-4 py-2 text-sm text-veda-dark hover:bg-gray-50 transition"
                  onClick={onCloseMenu}
                >
                  View Assignment
                </Link>
                <button
                  onClick={onDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs lg:text-sm text-veda-muted">
        <span>
          <strong className="text-veda-dark">Assigned on</strong> :{' '}
          {formatDate(assignment.createdAt)}
        </span>
        {assignment.dueDate && (
          <span>
            <strong className="text-veda-dark">Due</strong> :{' '}
            {formatDate(assignment.dueDate)}
          </span>
        )}
      </div>

      {/* Status badge */}
      {assignment.status === 'processing' && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            Processing...
          </span>
        </div>
      )}
      {assignment.status === 'failed' && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
            Failed
          </span>
        </div>
      )}
    </div>
  );
}
