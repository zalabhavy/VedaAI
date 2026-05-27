'use client';

import { Sparkles, FileText, BookOpen, Brain, Lightbulb, GraduationCap } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { title: 'Question Paper Generator', desc: 'Create AI-powered question papers', icon: FileText, href: '/assignments/create', color: 'bg-orange-50 text-veda-orange' },
  { title: 'Lesson Planner', desc: 'Plan lessons with AI assistance', icon: BookOpen, href: '#', color: 'bg-blue-50 text-blue-500' },
  { title: 'Quiz Creator', desc: 'Generate quick quizzes for class', icon: Brain, href: '#', color: 'bg-purple-50 text-purple-500' },
  { title: 'Worksheet Generator', desc: 'Create practice worksheets', icon: Lightbulb, href: '#', color: 'bg-green-50 text-green-500' },
  { title: 'Revision Notes', desc: 'Generate concise revision notes', icon: GraduationCap, href: '#', color: 'bg-amber-50 text-amber-500' },
  { title: 'Rubric Builder', desc: 'Create grading rubrics with AI', icon: Sparkles, href: '#', color: 'bg-pink-50 text-pink-500' },
];

export default function AIToolkitPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-veda-dark">AI Teacher&apos;s Toolkit</h1>
        <p className="text-sm text-veda-muted mt-1">AI-powered tools to help you teach smarter.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <Link
              key={i}
              href={tool.href}
              className="bg-white rounded-2xl p-5 hover:shadow-md transition group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${tool.color}`}>
                <Icon size={22} />
              </div>
              <h3 className="text-sm font-bold text-veda-dark mb-1 group-hover:text-veda-orange transition">{tool.title}</h3>
              <p className="text-xs text-veda-muted leading-relaxed">{tool.desc}</p>
              {tool.href === '#' && (
                <span className="inline-block mt-2 text-[10px] font-medium text-veda-muted bg-gray-100 px-2 py-0.5 rounded-full">Coming Soon</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
