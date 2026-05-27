'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Download, RefreshCw, Loader2, ArrowLeft, Printer } from 'lucide-react';
import type { GeneratedPaper } from '@/store/assignmentStore';

export default function ViewAssignmentPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .getAssignment(id)
      .then((a: any) => {
        if (a.title) setTitle(a.title);
        if (a.generatedPaper) setPaper(a.generatedPaper);
        else if (a.status === 'processing') router.push(`/assignments/${id}`);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await api.regenerate(id);
      router.push(`/assignments/${id}`);
    } catch {}
    setRegenerating(false);
  };

  const handleDownloadPDF = async () => {
    if (!paperRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(paperRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
        windowWidth: paperRef.current.scrollWidth,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 10; // mm
      const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Split canvas into pages
      const totalPages = Math.ceil(imgHeight / pageHeight);
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        // Calculate source crop from canvas
        const srcY = (page * pageHeight * canvas.width) / imgWidth;
        const srcH = (pageHeight * canvas.width) / imgWidth;
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = canvas.width;
        cropCanvas.height = Math.min(srcH, canvas.height - srcY);
        const ctx = cropCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, srcY, canvas.width, cropCanvas.height, 0, 0, canvas.width, cropCanvas.height);
        }
        const pageImg = cropCanvas.toDataURL('image/png');
        const drawH = (cropCanvas.height * imgWidth) / canvas.width;
        pdf.addImage(pageImg, 'PNG', margin, margin, imgWidth, drawH);
      }

      const fileName = title || paper?.subject || 'Question-Paper';
      pdf.save(`${fileName.replace(/[^a-zA-Z0-9 ]/g, '')}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
    setDownloading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'Easy':
        return 'text-green-600';
      case 'Moderate':
        return 'text-amber-600';
      case 'Hard':
      case 'Challenging':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 size={36} className="animate-spin text-veda-orange" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <p className="text-veda-muted mb-4">No question paper found.</p>
        <button
          onClick={() => router.push('/assignments')}
          className="px-6 py-2 bg-veda-dark text-white rounded-full text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* AI Message Banner */}
      <div className="bg-veda-dark text-white rounded-2xl p-4 lg:p-5 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print-hide no-print">
        <div>
          <p className="text-sm lg:text-base font-medium leading-relaxed">
            Here is your customized Question Paper for {paper.subject} - Class {paper.className} ({paper.maxMarks} Marks, {paper.timeAllowed}):
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {downloading ? 'Generating...' : 'Download as PDF'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 mb-4 no-print flex-wrap">
        <button
          onClick={() => router.push('/assignments')}
          className="flex items-center gap-1 text-sm text-veda-muted hover:text-veda-dark transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex-1 min-w-0" />
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition whitespace-nowrap ${
              showAnswers
                ? 'bg-veda-dark text-white border-veda-dark'
                : 'bg-white text-veda-dark border-veda-border hover:border-gray-300'
            }`}
          >
            {showAnswers ? 'Hide Answers' : 'Show Answer Key'}
          </button>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-veda-border rounded-xl text-sm font-medium text-veda-dark hover:border-gray-300 transition disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw
              size={14}
              className={regenerating ? 'animate-spin' : ''}
            />
            Regenerate
          </button>
        </div>
      </div>

      {/* Question Paper */}
      <div
        ref={paperRef}
        className="bg-white rounded-2xl shadow-sm max-w-4xl mx-auto"
      >
        <div className="p-6 lg:p-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-veda-dark mb-1">
              {paper.schoolName}
            </h1>
            <p className="text-base font-semibold text-veda-dark">
              Subject: {paper.subject}
            </p>
            <p className="text-base font-semibold text-veda-dark">
              Class: {paper.className}
            </p>
          </div>

          {/* Time & Marks */}
          <div className="flex justify-between items-center mb-4 text-sm">
            <span>
              <strong>Time Allowed:</strong> {paper.timeAllowed}
            </span>
            <span>
              <strong>Maximum Marks:</strong> {paper.maxMarks}
            </span>
          </div>

          {/* General Instructions */}
          <p className="text-sm mb-6">{paper.generalInstructions}</p>

          {/* Student Info */}
          <div className="mb-8 text-sm space-y-2">
            <p>
              Name: <span className="inline-block w-48 border-b border-gray-400" />
            </p>
            <p>
              Roll Number: <span className="inline-block w-36 border-b border-gray-400" />
            </p>
            <p>
              Class: {paper.className} Section:{' '}
              <span className="inline-block w-20 border-b border-gray-400" />
            </p>
          </div>

          {/* Sections */}
          {paper.sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-8">
              <h2 className="text-center text-lg font-bold text-veda-dark mb-2">
                {section.title}
              </h2>
              <div className="mb-4">
                <h3 className="font-bold text-sm text-veda-dark">
                  {section.questionType}
                </h3>
                <p className="text-sm italic text-veda-muted">
                  {section.instruction}
                </p>
              </div>

              <div className="space-y-3">
                {section.questions.map((q) => (
                  <div key={q.questionNumber} className="text-sm leading-relaxed">
                    <p>
                      {q.questionNumber}.{' '}
                      <span className={`font-medium ${getDifficultyColor(q.difficulty)}`}>
                        [{q.difficulty}]
                      </span>{' '}
                      {q.text}{' '}
                      <span className="text-veda-muted">[{q.marks} Marks]</span>
                    </p>
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mt-1.5 ml-6">
                        {q.options.map((opt, idx) => (
                          <p key={idx} className="text-sm text-veda-text">{opt}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p className="text-center font-bold text-sm mt-8 mb-4">
            End of Question Paper
          </p>

          {/* Answer Key */}
          {showAnswers && paper.answerKey && paper.answerKey.length > 0 && (
            <div className="border-t-2 border-gray-300 pt-6 mt-6">
              <h2 className="text-lg font-bold text-veda-dark mb-4">
                Answer Key:
              </h2>
              <div className="space-y-4">
                {paper.answerKey.map((a) => (
                  <div key={a.questionNumber} className="text-sm">
                    <p>
                      <strong>{a.questionNumber}.</strong> {a.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
