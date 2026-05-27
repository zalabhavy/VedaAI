'use client';

import { Users } from 'lucide-react';

const groups = [
  { name: 'Class 8 - Science', students: 42, assignments: 5, color: 'bg-blue-50 text-blue-500' },
  { name: 'Class 10 - Mathematics', students: 38, assignments: 3, color: 'bg-purple-50 text-purple-500' },
  { name: 'Class 5 - English', students: 45, assignments: 7, color: 'bg-green-50 text-green-500' },
  { name: 'Class 12 - Physics', students: 35, assignments: 4, color: 'bg-amber-50 text-amber-500' },
  { name: 'Class 9 - Hindi', students: 40, assignments: 2, color: 'bg-pink-50 text-pink-500' },
  { name: 'Class 7 - Social Science', students: 44, assignments: 6, color: 'bg-indigo-50 text-indigo-500' },
];

export default function MyGroupsPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-veda-dark">My Groups</h1>
        <p className="text-sm text-veda-muted mt-1">Manage your student groups and classes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.color}`}>
                <Users size={20} />
              </div>
              <h3 className="text-sm font-bold text-veda-dark">{g.name}</h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-veda-muted">
              <span>{g.students} Students</span>
              <span>{g.assignments} Assignments</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
