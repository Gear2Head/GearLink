import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, PhoneOff, User, Video, VideoOff } from 'lucide-react';
import { Button, Avatar } from './ui';

const ActiveCallScreen = ({
    caller,
    isMuted,
    isVideoEnabled = false,
    onToggleMute,
    onToggleVideo,
    onEndCall,
    connectionState,
    localStream,
    remoteStream
}) => {
    const [duration, setDuration] = useState(0);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-dark-bg flex flex-col items-center justify-center z-[60]">
            {isVideoEnabled ? (
                // Video Call Layout
                <div className="w-full h-full relative">
                    {/* Remote Video (Full Screen) */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    
                    {/* Local Video (Picture in Picture) */}
                    <div className="absolute top-4 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-dark-border shadow-2xl bg-dark-surface">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Overlay Info */}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                        <h2 className="text-white font-semibold">{caller?.name || 'Kullanıcı'}</h2>
                        <p className="text-sm text-gray-300">{formatDuration(duration)}</p>
                    </div>
                </div>
            ) : (
                // Audio Call Layout
                <div className="relative w-full h-full">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
                        <Avatar
                            src={caller?.photoURL}
                            fallback={caller?.name ? caller.name[0] : <User />}
                            className="w-32 h-32 mb-6 ring-4 ring-dark-surface shadow-2xl"
                        />

                        <h2 className="text-3xl font-semibold mb-2 text-white">{caller?.name || 'Kullanıcı'}</h2>

                        <div className="flex flex-col items-center mb-12">
                            <p className="text-xl font-mono text-primary/90 mb-2">{formatDuration(duration)}</p>
                            <p className="text-sm text-gray-500 bg-dark-surface/50 px-3 py-1 rounded-full">
                                {connectionState === 'connected' ? 'Sesli Arama' : 'Bağlanıyor...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            {isVideoEnabled ? (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 z-20">
                    <Button
                        onClick={onToggleMute}
                        className={`w-14 h-14 rounded-full transition-all duration-300 ${isMuted ? 'bg-white text-dark-bg' : 'bg-dark-surface text-white hover:bg-dark-border'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </Button>
                    {onToggleVideo && (
                        <Button
                            onClick={onToggleVideo}
                            className="w-14 h-14 rounded-full transition-all duration-300 bg-white text-dark-bg"
                        >
                            <Video size={24} />
                        </Button>
                    )}
                    <Button className="w-14 h-14 rounded-full bg-dark-surface text-white hover:bg-dark-border opacity-50 cursor-not-allowed">
                        <Volume2 size={24} />
                    </Button>
                    <Button
                        onClick={onEndCall}
                        className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-transform active:scale-95"
                    >
                        <PhoneOff size={24} />
                    </Button>
                </div>
            ) : (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                    <div className="flex gap-8 mb-6 items-center">
                        <div className="flex flex-col items-center gap-2">
                            <Button
                                onClick={onToggleMute}
                                className={`w-16 h-16 rounded-full transition-all duration-300 ${isMuted ? 'bg-white text-dark-bg' : 'bg-dark-surface text-white hover:bg-dark-border'}`}
                            >
                                {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                            </Button>
                            <span className="text-xs text-gray-400">{isMuted ? 'Sessiz' : 'Mikrofon'}</span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <Button className="w-16 h-16 rounded-full bg-dark-surface text-white hover:bg-dark-border opacity-50 cursor-not-allowed">
                                <Volume2 size={28} />
                            </Button>
                            <span className="text-xs text-gray-400">Hoparlör</span>
                        </div>
                    </div>

                    <Button
                        onClick={onEndCall}
                        className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-transform active:scale-95"
                    >
                        <PhoneOff size={32} />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ActiveCallScreen;
