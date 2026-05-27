'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { getSocket, joinAssignment } from '@/lib/socket';
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
  const wsConnectedRef = useRef(false);

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

  const handleFailed = useCallback((errMsg?: string) => {
    setStatus('failed');
    setError(errMsg || 'Generation failed. Please try again.');
    cleanup();
  }, [cleanup]);

  // Smooth simulated progress (caps at 90 until real completion)
  const startProgressSimulation = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : 1;
        return Math.min(90, prev + increment);
      });
    }, 1500);
  }, []);

  // Polling fallback — checks server every 4s
  const checkStatus = useCallback(async () => {
    try {
      const a = await api.getAssignment(id);
      if (a.status === 'completed') handleComplete();
      else if (a.status === 'failed') handleFailed();
    } catch {
      // keep polling
    }
  }, [id, handleComplete, handleFailed]);

  useEffect(() => {
    // 1. Initial status check
    checkStatus();

    // 2. Start simulated progress bar
    startProgressSimulation();

    // 3. WebSocket — real-time updates
    const socket = getSocket();
    joinAssignment(id);

    socket.on('connect', () => {
      wsConnectedRef.current = true;
      console.log('[WS] Connected for assignment:', id);
    });

    socket.on('status', (data: any) => {
      if (data.assignmentId !== id) return;
      wsConnectedRef.current = true;
      // Use real progress from server when available
      if (data.progress) {
        setProgress((prev) => Math.max(prev, data.progress));
      }
      if (data.status === 'completed') handleComplete();
      else if (data.status === 'failed') handleFailed(data.error);
    });

    socket.on('paper-ready', (data: any) => {
      if (data.assignmentId === id) handleComplete();
    });

    // 4. Polling fallback (in case WebSocket doesn't connect)
    pollRef.current = setInterval(checkStatus, 4000);

    return () => {
      socket.off('connect');
      socket.off('status');
      socket.off('paper-ready');
      cleanup();
    };
  }, [id, checkStatus, startProgressSimulation, handleComplete, handleFailed, cleanup]);

  const handleRetry = async () => {
    setError('');
    setStatus('processing');
    setProgress(5);
    completedRef.current = false;
    try {
      await api.regenerate(id);
      startProgressSimulation();
      joinAssignment(id);
      pollRef.current = setInterval(checkStatus, 4000);
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
