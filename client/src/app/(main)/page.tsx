'use client';

import Link from 'next/link';
import { useAssignmentStore } from '@/store/assignmentStore';
import { api } from '@/lib/api';
import { useEffect } from 'react';
import { FileText, Sparkles, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

export default function HomePage() {
  const { assignments, setAssignments } = useAssignmentStore();
  const { name } = useUserStore();

  useEffect(() => {
    api.getAssignments().then(setAssignments).catch(() => {});
  }, [setAssignments]);

  const completed = assignments.filter((a) => a.status === 'completed').length;
  const processing = assignments.filter((a) => a.status === 'processing').length;
  const failed = assignments.filter((a) => a.status === 'failed').length;

  const recent = assignments.slice(0, 5);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-veda-dark">Welcome back, {name.split(' ')[0]}! 👋</h1>
        <p className="text-sm text-veda-muted mt-1">Here&apos;s an overview of your assessments.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-veda-dark">{assignments.length}</p>
          <p className="text-xs text-veda-muted mt-0.5">Total Assignments</p>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle size={18} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-veda-dark">{completed}</p>
          <p className="text-xs text-veda-muted mt-0.5">Completed</p>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-veda-dark">{processing}</p>
          <p className="text-xs text-veda-muted mt-0.5">Processing</p>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle size={18} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-veda-dark">{failed}</p>
          <p className="text-xs text-veda-muted mt-0.5">Failed</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-veda-dark mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/assignments/create" className="flex items-center gap-3 bg-white rounded-2xl p-4 hover:shadow-md transition group">
            <div className="w-10 h-10 rounded-xl bg-veda-orange/10 flex items-center justify-center group-hover:bg-veda-orange/20 transition">
              <Sparkles size={20} className="text-veda-orange" />
            </div>
            <div>
              <p className="text-sm font-semibold text-veda-dark">Create Assignment</p>
              <p className="text-xs text-veda-muted">Generate AI question paper</p>
            </div>
          </Link>
          <Link href="/assignments" className="flex items-center gap-3 bg-white rounded-2xl p-4 hover:shadow-md transition group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
              <FileText size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-veda-dark">View Assignments</p>
              <p className="text-xs text-veda-muted">Manage all assignments</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Assignments */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-veda-dark">Recent Assignments</h2>
            <Link href="/assignments" className="text-xs text-veda-orange font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {recent.map((a) => (
              <Link
                key={a._id}
                href={a.status === 'completed' ? `/assignments/${a._id}/view` : `/assignments/${a._id}`}
                className="flex items-center justify-between bg-white rounded-xl p-4 hover:shadow-sm transition"
              >
                <div>
                  <p className="text-sm font-semibold text-veda-dark">{a.title}</p>
                  <p className="text-xs text-veda-muted mt-0.5">{a.subject} • Class {a.className}</p>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  a.status === 'completed' ? 'bg-green-50 text-green-600' :
                  a.status === 'processing' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="text-center py-16">
          <p className="text-veda-muted mb-4">No assignments yet. Create your first one!</p>
          <Link href="/assignments/create" className="inline-flex items-center gap-2 bg-veda-dark text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition">
            <Plus size={16} />
            Create Assignment
          </Link>
        </div>
      )}
    </div>
  );
}
