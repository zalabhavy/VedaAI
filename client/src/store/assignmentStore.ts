import { create } from 'zustand';

export interface QuestionType {
  id: string;
  type: string;
  numberOfQuestions: number;
  marks: number;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInfo: string;
  totalQuestions: number;
  totalMarks: number;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  generatedPaper?: GeneratedPaper;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  questionNumber: number;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
  type: string;
  options?: string[];
  answer?: string;
}

export interface Section {
  title: string;
  instruction: string;
  questionType: string;
  marksPerQuestion: number;
  questions: Question[];
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstructions: string;
  sections: Section[];
  answerKey: { questionNumber: number; answer: string }[];
}

interface AssignmentStore {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  loading: boolean;
  error: string | null;
  processingStatus: { [id: string]: { status: string; progress: number } };

  setAssignments: (a: Assignment[]) => void;
  setCurrentAssignment: (a: Assignment | null) => void;
  addAssignment: (a: Assignment) => void;
  removeAssignment: (id: string) => void;
  updateStatus: (id: string, status: string, progress: number) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  currentAssignment: null,
  loading: false,
  error: null,
  processingStatus: {},

  setAssignments: (assignments) => set({ assignments }),
  setCurrentAssignment: (currentAssignment) => set({ currentAssignment }),
  addAssignment: (a) =>
    set((s) => ({ assignments: [a, ...s.assignments] })),
  removeAssignment: (id) =>
    set((s) => ({ assignments: s.assignments.filter((a) => a._id !== id) })),
  updateStatus: (id, status, progress) =>
    set((s) => ({
      processingStatus: { ...s.processingStatus, [id]: { status, progress } },
      assignments: s.assignments.map((a) =>
        a._id === id ? { ...a, status: status as Assignment['status'] } : a
      ),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
