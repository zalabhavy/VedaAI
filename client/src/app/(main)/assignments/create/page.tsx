'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { api } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import {
  Upload,
  Calendar,
  Plus,
  Minus,
  X,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Mic,
  Loader2,
} from 'lucide-react';

interface QuestionTypeRow {
  id: string;
  type: string;
  numberOfQuestions: number;
  marks: number;
}

const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Answer Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True/False',
  'Fill in the Blanks',
  'Match the Following',
  'Case Study Questions',
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { addAssignment, updateStatus } = useAssignmentStore();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Subject details
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');

  // Step 2: Assignment details
  const [file, setFile] = useState<File | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeRow[]>([
    { id: '1', type: 'Multiple Choice Questions', numberOfQuestions: 4, marks: 1 },
    { id: '2', type: 'Short Questions', numberOfQuestions: 3, marks: 2 },
  ]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const totalQuestions = questionTypes.reduce(
    (s, q) => s + q.numberOfQuestions,
    0
  );
  const totalMarks = questionTypes.reduce(
    (s, q) => s + q.numberOfQuestions * q.marks,
    0
  );

  const addQuestionType = () => {
    const used = questionTypes.map((q) => q.type);
    const available = QUESTION_TYPE_OPTIONS.find((o) => !used.includes(o));
    if (available) {
      setQuestionTypes([
        ...questionTypes,
        {
          id: Date.now().toString(),
          type: available,
          numberOfQuestions: 4,
          marks: 2,
        },
      ]);
    }
  };

  const removeQuestionType = (id: string) => {
    if (questionTypes.length > 1) {
      setQuestionTypes(questionTypes.filter((q) => q.id !== id));
    }
  };

  const updateQuestionType = (
    id: string,
    field: keyof QuestionTypeRow,
    value: string | number
  ) => {
    setQuestionTypes(
      questionTypes.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!subject.trim()) errs.subject = 'Subject is required';
    if (!className.trim()) errs.className = 'Class is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!dueDate) errs.dueDate = 'Due date is required';
    if (questionTypes.length === 0) errs.questionTypes = 'Add at least one question type';
    for (const qt of questionTypes) {
      if (qt.numberOfQuestions < 1) errs[`qty_${qt.id}`] = 'Min 1';
      if (qt.marks < 1) errs[`marks_${qt.id}`] = 'Min 1';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitting(true);

    try {
      const data = {
        title,
        subject,
        className,
        dueDate,
        questionTypes: questionTypes.map((q) => ({
          type: q.type,
          numberOfQuestions: q.numberOfQuestions,
          marks: q.marks,
        })),
        additionalInfo,
        totalQuestions,
        totalMarks,
      };

      const result = await api.createAssignment(data, file || undefined);
      addAssignment(result);

      // Navigate to processing page (WebSocket + polling handled there)
      router.push(`/assignments/${result._id}`);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to create assignment' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      {/* Header - desktop only */}
      <div className="mb-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
          <h1 className="text-xl font-bold text-veda-dark">
            Create Assignment
          </h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        <div
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            step >= 1 ? 'bg-veda-dark' : 'bg-gray-200'
          }`}
        />
        <div
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            step >= 2 ? 'bg-veda-dark' : 'bg-gray-200'
          }`}
        />
      </div>

      {/* Step 1: Subject Info */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 lg:p-8">
          <h2 className="text-lg font-bold text-veda-dark mb-1">
            Subject Information
          </h2>
          <p className="text-sm text-veda-muted mb-6">
            Enter the subject and class details
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-veda-dark mb-2">
                Assignment Title
              </label>
              <input
                type="text"
                placeholder="e.g. Quiz on Electricity"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-veda-orange transition ${
                  errors.title ? 'border-red-400' : 'border-veda-border'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-veda-dark mb-2">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Science, Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-veda-orange transition ${
                  errors.subject ? 'border-red-400' : 'border-veda-border'
                }`}
              />
              {errors.subject && (
                <p className="text-xs text-red-500 mt-1">{errors.subject}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-veda-dark mb-2">
                Class
              </label>
              <input
                type="text"
                placeholder="e.g. 5th, 8th, 10th"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-veda-orange transition ${
                  errors.className ? 'border-red-400' : 'border-veda-border'
                }`}
              />
              {errors.className && (
                <p className="text-xs text-red-500 mt-1">{errors.className}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Assignment Details */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 lg:p-8">
          <h2 className="text-lg font-bold text-veda-dark mb-1">
            Assignment Details
          </h2>
          <p className="text-sm text-veda-muted mb-6">
            Basic information about your assignment
          </p>

          {/* File Upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition mb-2 ${
              isDragActive
                ? 'border-veda-orange bg-orange-50'
                : 'border-veda-border hover:border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            <Upload
              size={28}
              className="mx-auto mb-3 text-veda-dark"
              strokeWidth={1.5}
            />
            {file ? (
              <p className="text-sm font-medium text-veda-dark">{file.name}</p>
            ) : (
              <>
                <p className="text-sm text-veda-dark font-medium">
                  Choose a file or drag & drop it here
                </p>
                <p className="text-xs text-veda-muted mt-1">
                  JPEG, PNG, upto 10MB
                </p>
                <button className="mt-3 px-5 py-2 border border-veda-border rounded-xl text-sm text-veda-dark hover:bg-gray-50 transition">
                  Browse Files
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-veda-muted mb-6 text-center">
            Upload images of your preferred document/image
          </p>

          {/* Due Date */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-veda-dark mb-2">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="DD-MM-YYYY"
                className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm focus:outline-none focus:border-veda-orange transition ${
                  errors.dueDate ? 'border-red-400' : 'border-veda-border'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-8 h-8 rounded-full border border-veda-border flex items-center justify-center bg-white">
                <Calendar size={15} className="text-veda-dark" strokeWidth={1.8} />
              </div>
            </div>
            {errors.dueDate && (
              <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>
            )}
          </div>

          {/* Question Types */}
          <div className="mb-6">
            <div className="flex items-center gap-8 mb-3">
              <label className="text-sm font-bold text-veda-dark flex-1">
                Question Type
              </label>
              <span className="text-xs text-veda-muted w-24 text-center hidden sm:block">
                No. of Questions
              </span>
              <span className="text-xs text-veda-muted w-20 text-center hidden sm:block">
                Marks
              </span>
              <span className="w-6" />
            </div>

            <div className="space-y-3">
              {questionTypes.map((qt) => (
                <div
                  key={qt.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 rounded-xl p-3 sm:p-2"
                >
                  {/* Type selector */}
                  <div className="relative flex-1">
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === qt.id ? null : qt.id
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-veda-border text-sm text-veda-dark"
                    >
                      {qt.type}
                      <ChevronDown size={16} className="text-veda-muted" />
                    </button>
                    {openDropdown === qt.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-veda-border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                          {QUESTION_TYPE_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => {
                                updateQuestionType(qt.id, 'type', opt);
                                setOpenDropdown(null);
                              }}
                              className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mobile labels */}
                  <div className="flex items-center gap-3 sm:gap-2">
                    <div className="sm:hidden text-xs text-veda-muted">
                      No. of Questions
                    </div>
                    <div className="sm:hidden text-xs text-veda-muted ml-auto">
                      Marks
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-2">
                    {/* Number of questions */}
                    <div className="flex items-center gap-1 bg-white border border-veda-border rounded-xl px-2 py-1.5">
                      <button
                        onClick={() =>
                          updateQuestionType(
                            qt.id,
                            'numberOfQuestions',
                            Math.max(1, qt.numberOfQuestions - 1)
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        <Minus size={14} className="text-veda-muted" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {qt.numberOfQuestions}
                      </span>
                      <button
                        onClick={() =>
                          updateQuestionType(
                            qt.id,
                            'numberOfQuestions',
                            qt.numberOfQuestions + 1
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        <Plus size={14} className="text-veda-muted" />
                      </button>
                    </div>

                    {/* Marks */}
                    <div className="flex items-center gap-1 bg-white border border-veda-border rounded-xl px-2 py-1.5">
                      <button
                        onClick={() =>
                          updateQuestionType(
                            qt.id,
                            'marks',
                            Math.max(1, qt.marks - 1)
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        <Minus size={14} className="text-veda-muted" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {qt.marks}
                      </span>
                      <button
                        onClick={() =>
                          updateQuestionType(qt.id, 'marks', qt.marks + 1)
                        }
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        <Plus size={14} className="text-veda-muted" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeQuestionType(qt.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition"
                    >
                      <X size={16} className="text-veda-muted" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Question Type */}
            <button
              onClick={addQuestionType}
              className="flex items-center gap-2 mt-4 text-sm text-veda-dark font-medium hover:text-veda-orange transition"
            >
              <div className="w-6 h-6 rounded-full bg-veda-orange text-white flex items-center justify-center">
                <Plus size={14} />
              </div>
              Add Question Type
            </button>

            {/* Totals */}
            <div className="flex flex-col items-end gap-1 mt-4 text-sm">
              <span className="text-veda-dark">
                <strong>Total Questions : </strong>
                {totalQuestions}
              </span>
              <span className="text-veda-dark">
                <strong>Total Marks : </strong>
                {totalMarks}
              </span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-veda-dark mb-2">
              Additional Information{' '}
              <span className="font-normal text-veda-muted">
                (For better output)
              </span>
            </label>
            <div className="relative">
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-veda-border text-sm focus:outline-none focus:border-veda-orange transition resize-none"
              />
              <button className="absolute bottom-3 right-3 p-1.5 hover:bg-gray-100 rounded-lg transition">
                <Mic size={16} className="text-veda-muted" />
              </button>
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500 mb-4 text-center">
              {errors.submit}
            </p>
          )}
        </div>
      )}

      {/* Bottom Buttons */}
      <div className="flex items-center justify-between mt-6">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-veda-border text-sm font-semibold text-veda-dark hover:bg-white transition"
          >
            <ArrowLeft size={16} />
            Previous
          </button>
        ) : (
          <div />
        )}

        {step < 2 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-veda-dark text-white text-sm font-semibold hover:bg-gray-800 transition"
          >
            Next
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-veda-dark text-white text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Next
                <ArrowRight size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
