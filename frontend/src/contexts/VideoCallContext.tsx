'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StreamVideoClient,
  Call,
  StreamVideo,
  User,
} from '@stream-io/video-react-sdk';
import { useAuth } from './AuthContext';
import { videoCallsApi } from '../lib/api';

interface VideoCallContextType {
  client: StreamVideoClient | null;
  activeCall: Call | null;
  isInitializing: boolean;
  initializeCall: (callId: string) => Promise<Call>;
  joinCall: (callId: string) => Promise<Call>;
  leaveCall: () => Promise<void>;
  endCall: () => Promise<void>;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export function VideoCallProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize client when user is authenticated
  useEffect(() => {
    if (!user) {
        if (client) {
            client.disconnectUser();
            setClient(null);
        }
        return;
    }

    const initClient = async () => {
      try {
        const tokenData = await videoCallsApi.getToken();

        if (!tokenData.api_key || !tokenData.token) {
            console.error('Failed to get video call token configuration');
            return;
        }

        const streamUser: User = {
          id: tokenData.user_id,
          name: tokenData.user_name || user.email,
          type: 'authenticated',
        };

        const newClient = new StreamVideoClient({
          apiKey: tokenData.api_key,
          user: streamUser,
          token: tokenData.token,
        });

        setClient(newClient);
      } catch (error) {
        console.error('Failed to initialize video client:', error);
      }
    };

    if (!client) {
        initClient();
    }

    return () => {
        // Cleanup handled by dependency change logic or unmount
    };
  }, [user]);

  const initializeCall = async (appointmentId: string): Promise<Call> => {
    if (!client) throw new Error('Video client not initialized');

    setIsInitializing(true);
    try {
      // Get call details from backend which validates access
      const callDetails = await videoCallsApi.createCall(appointmentId);

      const call = client.call('default', callDetails.call_id);

      await call.join({ create: true });

      setActiveCall(call);
      return call;
    } catch (error) {
      console.error('Error initializing call:', error);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  };

  const joinCall = async (appointmentId: string): Promise<Call> => {
      // For now, initializeCall handles both joining and creation logic via backend
      return initializeCall(appointmentId);
  };

  const leaveCall = async () => {
    if (activeCall) {
      await activeCall.leave();
      setActiveCall(null);
    }
  };

  const endCall = async () => {
      if (activeCall) {
          // If doctor, we might want to end it for everyone
          await activeCall.endCall();
          await activeCall.leave();
          setActiveCall(null);
      }
  };

  return (
    <VideoCallContext.Provider
      value={{
        client,
        activeCall,
        isInitializing,
        initializeCall,
        joinCall,
        leaveCall,
        endCall,
      }}
    >
      <StreamVideo client={client!}>
        {children}
      </StreamVideo>
    </VideoCallContext.Provider>
  );
}

export function useVideoCall() {
  const context = useContext(VideoCallContext);
  if (context === undefined) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
}
