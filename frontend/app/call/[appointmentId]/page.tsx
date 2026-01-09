/**
 * Call Page
 * 
 * Main video call page for doctor-patient consultations.
 * Handles WebRTC connection lifecycle, signaling, and call controls.
 * 
 * Flow:
 * 1. User navigates to /call/[appointmentId]
 * 2. Page requests camera/microphone permissions
 * 3. Connects to signaling server with JWT
 * 4. Joins room based on appointment ID
 * 5. If peer already in room, creates offer
 * 6. Exchanges SDP and ICE candidates
 * 7. WebRTC connection established for video/audio
 */

'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { signalingService, RoomJoinedData } from '@/lib/services/signaling.service';
import { webrtcService } from '@/lib/services/webrtc.service';
import { VideoPlayer } from '@/components/call/VideoPlayer';
import { VideoControls } from '@/components/call/VideoControls';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CallPageProps {
    params: Promise<{ appointmentId: string }>;
}

export default function CallPage({ params }: CallPageProps) {
    const { appointmentId } = use(params);
    const router = useRouter();
    const { user, token, isLoading: authLoading, isAuthenticated } = useAuth();

    // Call state
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [peerRole, setPeerRole] = useState<string | null>(null);

    // Media state
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    // Error state
    const [error, setError] = useState<string | null>(null);

    // Flag to track if we should create offer
    const [shouldCreateOffer, setShouldCreateOffer] = useState(false);

    /**
     * Handle WebRTC offer creation and sending
     */
    const createAndSendOffer = useCallback(async () => {
        try {
            console.log('[CallPage] Creating offer...');
            const offer = await webrtcService.createOffer();
            signalingService.sendOffer(offer);
        } catch (err) {
            console.error('[CallPage] Failed to create offer:', err);
            setError('Failed to establish connection');
        }
    }, []);

    /**
     * Handle incoming offer from peer
     */
    const handleOffer = useCallback(async (data: { offer: RTCSessionDescriptionInit }) => {
        try {
            console.log('[CallPage] Handling offer...');
            const answer = await webrtcService.createAnswer(data.offer);
            signalingService.sendAnswer(answer);
        } catch (err) {
            console.error('[CallPage] Failed to handle offer:', err);
            setError('Failed to connect to peer');
        }
    }, []);

    /**
     * Handle incoming answer from peer
     */
    const handleAnswer = useCallback(async (data: { answer: RTCSessionDescriptionInit }) => {
        try {
            console.log('[CallPage] Handling answer...');
            await webrtcService.setRemoteAnswer(data.answer);
        } catch (err) {
            console.error('[CallPage] Failed to handle answer:', err);
        }
    }, []);

    /**
     * Initialize call - setup WebRTC and signaling
     */
    const initializeCall = useCallback(async () => {
        if (!token || !appointmentId) return;

        setIsConnecting(true);
        setError(null);

        try {
            // Setup WebRTC event handlers
            webrtcService.setHandlers({
                onLocalStream: (stream) => {
                    console.log('[CallPage] Local stream received');
                    setLocalStream(stream);
                },
                onRemoteStream: (stream) => {
                    console.log('[CallPage] Remote stream received');
                    setRemoteStream(stream);
                    setIsConnected(true);
                    setIsConnecting(false);
                },
                onIceCandidate: (candidate) => {
                    signalingService.sendIceCandidate(candidate);
                },
                onConnectionStateChange: (state) => {
                    console.log('[CallPage] Connection state:', state);
                    if (state === 'connected') {
                        setIsConnected(true);
                        setIsConnecting(false);
                    } else if (state === 'disconnected' || state === 'failed') {
                        setIsConnected(false);
                    }
                },
                onError: (err) => {
                    setError(err.message);
                    setIsConnecting(false);
                },
            });

            // Initialize WebRTC (get media permissions)
            await webrtcService.initialize();

            // Setup signaling event handlers
            signalingService.setHandlers({
                onConnected: () => {
                    console.log('[CallPage] Signaling connected, joining room');
                    signalingService.joinRoom(appointmentId);
                },
                onRoomJoined: async (data: RoomJoinedData) => {
                    console.log('[CallPage] Room joined:', data);
                    if (data.peerConnected && data.shouldCreateOffer) {
                        // Peer already in room, we create the offer
                        setShouldCreateOffer(true);
                    }
                },
                onPeerJoined: (data) => {
                    console.log('[CallPage] Peer joined:', data.role);
                    setPeerRole(data.role);
                    // We're first in room, peer joined - peer will create offer
                },
                onPeerDisconnected: (data) => {
                    console.log('[CallPage] Peer disconnected:', data.role);
                    setRemoteStream(null);
                    setIsConnected(false);
                    setPeerRole(null);
                    // Also navigate back when peer disconnects
                    webrtcService.cleanup();
                    router.push(`/dashboard/${user?.role || 'patient'}`);
                },
                onOffer: handleOffer,
                onAnswer: handleAnswer,
                onIceCandidate: async (data) => {
                    await webrtcService.addIceCandidate(data.candidate);
                },
                onCallEnded: (data) => {
                    console.log('[CallPage] Call ended by:', data.endedBy);
                    // Clean up and navigate when other party ends call
                    webrtcService.cleanup();
                    signalingService.disconnect();
                    router.push(`/dashboard/${user?.role || 'patient'}`);
                },
                onError: (data) => {
                    setError(data.message);
                    setIsConnecting(false);
                },
            });

            // Connect to signaling server
            signalingService.connect(token);

        } catch (err) {
            console.error('[CallPage] Failed to initialize call:', err);
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    setError('Camera/microphone permission denied. Please allow access and try again.');
                } else if (err.name === 'NotFoundError') {
                    setError('No camera or microphone found.');
                } else {
                    setError(err.message);
                }
            }
            setIsConnecting(false);
        }
    }, [token, appointmentId, handleOffer, handleAnswer]);

    /**
     * Create offer when shouldCreateOffer becomes true
     */
    useEffect(() => {
        if (shouldCreateOffer) {
            createAndSendOffer();
            setShouldCreateOffer(false);
        }
    }, [shouldCreateOffer, createAndSendOffer]);

    /**
     * Handle ending the call
     */
    const handleEndCall = useCallback(() => {
        // Send end call event to notify peer
        signalingService.endCall();
        // Clean up WebRTC
        webrtcService.cleanup();
        // Wait a moment for the event to be sent before disconnecting
        setTimeout(() => {
            signalingService.disconnect();
            router.push(`/dashboard/${user?.role || 'patient'}`);
        }, 100);
    }, [router, user]);

    /**
     * Toggle audio
     */
    const handleToggleAudio = useCallback(() => {
        const enabled = webrtcService.toggleAudio();
        setIsAudioEnabled(enabled);
    }, []);

    /**
     * Toggle video
     */
    const handleToggleVideo = useCallback(() => {
        const enabled = webrtcService.toggleVideo();
        setIsVideoEnabled(enabled);
    }, []);

    /**
     * Initialize call when authenticated
     */
    useEffect(() => {
        if (!authLoading && isAuthenticated && token) {
            initializeCall();
        }

        // Cleanup on unmount
        return () => {
            signalingService.disconnect();
            webrtcService.cleanup();
        };
    }, [authLoading, isAuthenticated, token, initializeCall]);

    /**
     * Redirect if not authenticated
     */
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/auth/login?redirect=/call/${appointmentId}`);
        }
    }, [authLoading, isAuthenticated, router, appointmentId]);

    // Loading state
    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 rounded-xl p-6 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Call Error</h2>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/dashboard/${user?.role || 'patient'}`)}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                        <Button
                            onClick={() => {
                                setError(null);
                                initializeCall();
                            }}
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="absolute top-4 left-4 z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEndCall}
                    className="text-white/70 hover:text-white hover:bg-slate-800/50 gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Leave Call
                </Button>
            </div>

            {/* Role indicator */}
            <div className="absolute top-4 right-4 z-10">
                <div className="px-3 py-1.5 rounded-full bg-slate-800/80 backdrop-blur-sm">
                    <span className="text-sm text-slate-300">
                        You: <span className="font-medium text-white capitalize">{user?.role}</span>
                    </span>
                    {peerRole && (
                        <span className="text-sm text-slate-300 ml-3">
                            Peer: <span className="font-medium text-white capitalize">{peerRole}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Video container */}
            <div className="flex-1 relative p-4">
                {/* Remote video (full size) */}
                <VideoPlayer
                    stream={remoteStream}
                    label={peerRole ? `${peerRole.charAt(0).toUpperCase()}${peerRole.slice(1)}` : 'Waiting for peer...'}
                    isVideoEnabled={true}
                    className="w-full h-full min-h-[400px]"
                />

                {/* Local video (picture-in-picture) */}
                <div className="absolute bottom-20 right-4 w-48 h-36 md:w-64 md:h-48 shadow-xl rounded-lg overflow-hidden border-2 border-slate-700">
                    <VideoPlayer
                        stream={localStream}
                        muted={true}
                        mirror={true}
                        label="You"
                        isVideoEnabled={isVideoEnabled}
                        className="w-full h-full"
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <VideoControls
                    isAudioEnabled={isAudioEnabled}
                    isVideoEnabled={isVideoEnabled}
                    isConnected={isConnected}
                    isConnecting={isConnecting}
                    onToggleAudio={handleToggleAudio}
                    onToggleVideo={handleToggleVideo}
                    onEndCall={handleEndCall}
                />
            </div>
        </div>
    );
}
