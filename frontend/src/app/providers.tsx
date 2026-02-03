'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { VideoCallProvider } from '../contexts/VideoCallContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <VideoCallProvider>
        {children}
      </VideoCallProvider>
    </AuthProvider>
  );
}
