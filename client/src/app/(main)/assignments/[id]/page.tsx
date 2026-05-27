'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function AssignmentDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [progress, setProgress] = useState(5);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  // Simulated smooth progress that increases gradually
  const startProgressSimulation = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Cap at 90 until actually done
        // Slow down as it gets higher
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : 1;
        return Math.min(90, prev + increment);
      });
    }, 1500);
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const a = await api.getAssignment(id);
      if (a.status === 'completed' && !completedRef.current) {
        completedRef.current = true;
        setStatus('completed');
        setProgress(100);
        // Clear intervals
        if (pollRef.current) clearInterval(pollRef.current);
        if (progressRef.current) clearInterval(progressRef.current);
        // Auto-redirect after showing 100%
        setTimeout(() => router.push(`/assignments/${id}/view`), 1500);
      } else if (a.status === 'failed') {
        setStatus('failed');
        setError('Generation failed. Please try again.');
        if (pollRef.current) clearInterval(pollRef.current);
        if (progressRef.current) clearInterval(progressRef.current);
      }
    } catch {
      // Assignment may not be ready yet, keep polling
    }
  }, [id, router]);

  useEffect(() => {
    // Initial check
    checkStatus();

    // Start smooth progress simulation
    startProgressSimulation();

    // Poll the server every 3 seconds to check if generation is done
    pollRef.current = setInterval(checkStatus, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [id, checkStatus, startProgressSimulation]);

  const handleRetry = async () => {
    setError('');
    setStatus('processing');
    setProgress(5);
    completedRef.current = false;
    try {
      await api.regenerate(id);
      startProgressSimulation();
      pollRef.current = setInterval(checkStatus, 3000);
    } catch {
      setError('Failed to retry');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
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

      {status === 'failed' && (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-veda-dark mb-2">
            Generation Failed
          </h2>
          <p className="text-sm text-red-500 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="px-8 py-3 bg-veda-dark text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {error && status !== 'failed' && (
        <div className="text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
