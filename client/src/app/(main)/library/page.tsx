'use client';

import { useAssignmentStore } from '@/store/assignmentStore';
import { api } from '@/lib/api';
import { useEffect } from 'react';
import Link from 'next/link';
import { FileText, Download, FolderOpen } from 'lucide-react';

export default function LibraryPage() {
  const { assignments, setAssignments } = useAssignmentStore();

  useEffect(() => {
    api.getAssignments().then(setAssignments).catch(() => {});
  }, [setAssignments]);

  const completed = assignments.filter((a) => a.status === 'completed');

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-veda-dark">My Library</h1>
        <p className="text-sm text-veda-muted mt-1">All your generated question papers in one place.</p>
      </div>

      {completed.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FolderOpen size={28} className="text-veda-muted" />
          </div>
          <p className="text-veda-muted mb-2">Your library is empty</p>
          <p className="text-xs text-veda-muted mb-6">Generated question papers will appear here.</p>
          <Link href="/assignments/create" className="inline-flex items-center gap-2 bg-veda-dark text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition">
            Create Assignment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completed.map((a) => (
            <Link
              key={a._id}
              href={`/assignments/${a._id}/view`}
              className="bg-white rounded-2xl p-5 hover:shadow-md transition group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-veda-dark mb-1 truncate group-hover:text-veda-orange transition">{a.title}</h3>
                  <p className="text-xs text-veda-muted">{a.subject} • Class {a.className}</p>
                  <p className="text-xs text-veda-muted mt-1">
                    {a.totalQuestions} Questions • {a.totalMarks} Marks
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
