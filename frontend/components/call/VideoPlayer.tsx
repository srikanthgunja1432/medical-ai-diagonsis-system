/**
 * VideoPlayer Component
 * 
 * Displays a video stream with overlay for status indicators.
 * Used for both local and remote video in the call page.
 */

'use client';

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
    stream: MediaStream | null;
    muted?: boolean;
    mirror?: boolean;
    label?: string;
    isVideoEnabled?: boolean;
    className?: string;
}

export function VideoPlayer({
    stream,
    muted = false,
    mirror = false,
    label,
    isVideoEnabled = true,
    className = '',
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className={`relative rounded-lg overflow-hidden bg-slate-900 ${className}`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={muted}
                className={`w-full h-full object-cover ${mirror ? 'scale-x-[-1]' : ''} ${!isVideoEnabled ? 'invisible' : ''
                    }`}
            />

            {/* Video disabled overlay */}
            {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                </div>
            )}

            {/* Label overlay */}
            {label && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 text-white text-sm">
                    {label}
                </div>
            )}

            {/* No stream loading state */}
            {!stream && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <div className="animate-pulse text-slate-400">
                        <svg
                            className="w-12 h-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
