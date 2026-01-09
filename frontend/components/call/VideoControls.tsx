/**
 * VideoControls Component
 * 
 * Control bar for video calls with mute, camera toggle, and end call buttons.
 * Displays current state of audio/video and connection quality.
 */

'use client';

import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoControlsProps {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isConnected: boolean;
    isConnecting: boolean;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onEndCall: () => void;
}

export function VideoControls({
    isAudioEnabled,
    isVideoEnabled,
    isConnected,
    isConnecting,
    onToggleAudio,
    onToggleVideo,
    onEndCall,
}: VideoControlsProps) {
    return (
        <div className="flex items-center justify-center gap-4 p-4 bg-slate-900/90 backdrop-blur-sm rounded-full">
            {/* Connection status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 mr-2">
                {isConnecting ? (
                    <>
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                        <span className="text-sm text-amber-400">Connecting...</span>
                    </>
                ) : isConnected ? (
                    <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-sm text-emerald-400">Connected</span>
                    </>
                ) : (
                    <>
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        <span className="text-sm text-slate-400">Waiting...</span>
                    </>
                )}
            </div>

            {/* Audio toggle button */}
            <Button
                variant="outline"
                size="icon"
                onClick={onToggleAudio}
                className={`rounded-full w-12 h-12 border-2 transition-colors ${isAudioEnabled
                        ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-white'
                        : 'bg-red-600 border-red-500 hover:bg-red-500 text-white'
                    }`}
                title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
                {isAudioEnabled ? (
                    <Mic className="w-5 h-5" />
                ) : (
                    <MicOff className="w-5 h-5" />
                )}
            </Button>

            {/* Video toggle button */}
            <Button
                variant="outline"
                size="icon"
                onClick={onToggleVideo}
                className={`rounded-full w-12 h-12 border-2 transition-colors ${isVideoEnabled
                        ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-white'
                        : 'bg-red-600 border-red-500 hover:bg-red-500 text-white'
                    }`}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
                {isVideoEnabled ? (
                    <Video className="w-5 h-5" />
                ) : (
                    <VideoOff className="w-5 h-5" />
                )}
            </Button>

            {/* End call button */}
            <Button
                variant="destructive"
                size="icon"
                onClick={onEndCall}
                className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-500 border-0 ml-2"
                title="End call"
            >
                <PhoneOff className="w-6 h-6" />
            </Button>
        </div>
    );
}
