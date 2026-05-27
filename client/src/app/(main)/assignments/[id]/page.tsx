'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { getSocket, joinAssignment } from '@/lib/socket';
import { Loader2 } from 'lucide-react';

export default function AssignmentDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check current status
    api.getAssignment(id).then((a: any) => {
      if (a.status === 'completed') {
        router.push(`/assignments/${id}/view`);
        return;
      }
      if (a.status === 'failed') {
        setStatus('failed');
        setError('Generation failed. Please try again.');
        return;
      }
      setStatus(a.status);
    }).catch(() => {
      setError('Assignment not found');
    });

    // WebSocket
    const socket = getSocket();
    joinAssignment(id);

    socket.on('status', (data: any) => {
      if (data.assignmentId === id) {
        setStatus(data.status);
        // Only increase progress, never decrease
        setProgress((prev) => Math.max(prev, data.progress || 0));
        if (data.status === 'failed') {
          setError(data.error || 'Generation failed');
        }
      }
    });

    socket.on('paper-ready', (data: any) => {
      if (data.assignmentId === id) {
        router.push(`/assignments/${id}/view`);
      }
    });

    return () => {
      socket.off('status');
      socket.off('paper-ready');
    };
  }, [id, router]);

  const handleRetry = async () => {
    setError('');
    setStatus('processing');
    setProgress(0);
    try {
      await api.regenerate(id);
    } catch {
      setError('Failed to retry');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {status === 'processing' && (
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-6 text-veda-orange animate-spin" />
          <h2 className="text-xl font-bold text-veda-dark mb-2">
            Generating Your Question Paper
          </h2>
          <p className="text-sm text-veda-muted mb-6">
            AI is creating your assessment. This may take a moment...
          </p>

          {/* Progress bar */}
          <div className="w-64 mx-auto bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-veda-orange h-2 rounded-full transition-all duration-500"
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
