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

  // Poll server every 2s to check status — never fails
  const checkStatus = useCallback(async () => {
    try {
      const a = await api.getAssignment(id);
      if (a.status === 'completed') handleComplete();
      // Don't show failed — keep waiting, it might still be processing
    } catch {
      // keep polling
    }
  }, [id, handleComplete]);

  useEffect(() => {
    checkStatus();
    startProgressSimulation();
    pollRef.current = setInterval(checkStatus, 2000);

    // Safety: after 3 minutes, if still not done, show a "wait" message (never fail)
    const safetyTimeout = setTimeout(() => {
      if (!completedRef.current) {
        setProgress(95);
        // Keep polling but slower
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(checkStatus, 5000);
      }
    }, 180000);

    return () => {
      cleanup();
      clearTimeout(safetyTimeout);
    };
  }, [id, checkStatus, startProgressSimulation, cleanup]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
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
    </div>
  );
}
