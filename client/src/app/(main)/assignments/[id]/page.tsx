'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function AssignmentDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [progress, setProgress] = useState(5);
  const [rateLimitMsg, setRateLimitMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
  }, []);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setStatus('completed');
    setProgress(100);
    cleanup();
    setTimeout(() => router.push(`/assignments/${id}/view`), 1500);
  }, [id, router, cleanup]);

  const handleRateLimit = useCallback((msg: string) => {
    setStatus('rate-limited');
    setRateLimitMsg(msg);
    cleanup();
  }, [cleanup]);

  // Smooth simulated progress — faster, reaches 95 max
  const startProgressSimulation = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const increment = prev < 20 ? 5 : prev < 50 ? 4 : prev < 75 ? 3 : 1;
        return Math.min(95, prev + increment);
      });
    }, 800);
  }, []);

  // Poll server every 2s
  const checkStatus = useCallback(async () => {
    try {
      const a = await api.getAssignment(id);
      if (a.status === 'completed') {
        handleComplete();
      } else if (a.status === 'failed') {
        const reason = a.failReason || '';
        if (reason.includes('rate limit') || reason.includes('Rate limit')) {
          handleRateLimit(reason);
        }
        // else keep polling — might be transient
      }
    } catch {
      // keep polling
    }
  }, [id, handleComplete, handleRateLimit]);

  useEffect(() => {
    checkStatus();
    startProgressSimulation();
    pollRef.current = setInterval(checkStatus, 2000);

    const safetyTimeout = setTimeout(() => {
      if (!completedRef.current && status === 'processing') {
        setProgress(95);
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(checkStatus, 5000);
      }
    }, 180000);

    return () => {
      cleanup();
      clearTimeout(safetyTimeout);
    };
  }, [id, checkStatus, startProgressSimulation, cleanup, status]);

  const handleRetry = async () => {
    setStatus('processing');
    setProgress(5);
    setRateLimitMsg('');
    completedRef.current = false;
    try {
      await api.regenerate(id);
      startProgressSimulation();
      pollRef.current = setInterval(checkStatus, 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Rate Limit Warning */}
      {status === 'rate-limited' && (
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-5 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={32} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-veda-dark mb-2">
            AI Rate Limit Reached
          </h2>
          <p className="text-sm text-veda-muted mb-4">
            {rateLimitMsg || 'The AI service has reached its usage limit. Please try again later.'}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-amber-700">
              ⏳ This is a temporary limit from the AI provider (Groq). Your assignment has been saved and you can retry generation once the limit resets.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              href="/assignments"
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-veda-dark rounded-full text-sm font-semibold hover:bg-gray-50 transition"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-veda-dark text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Processing / Completed */}
      {(status === 'processing' || status === 'completed') && (
        <div className="text-center">
          {status === 'completed' ? (
            <CheckCircle2 size={48} className="mx-auto mb-6 text-green-500" />
          ) : (
            <Loader2 size={48} className="mx-auto mb-6 text-veda-orange animate-spin" />
          )}
          <h2 className="text-xl font-bold text-veda-dark mb-2">
            {status === 'completed' ? 'Question Paper Ready!' : 'Generating Your Question Paper'}
          </h2>
          <p className="text-sm text-veda-muted mb-6">
            {status === 'completed'
              ? 'Redirecting to your paper...'
              : progress >= 95
                ? 'Almost there, finalizing your paper...'
                : 'AI is creating your assessment. This may take a moment...'}
          </p>

          {/* Progress bar */}
          <div className="w-64 mx-auto bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-veda-orange h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-veda-muted">{progress}% complete</p>
        </div>
      )}
    </div>
  );
}
