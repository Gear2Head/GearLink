import { useState, useRef, useEffect } from 'react';
import { Mic, Trash2, Send, StopCircle } from 'lucide-react';
import { Button } from './ui';
import { startRecording, stopRecording, uploadVoiceMessage } from '../lib/voiceRecorder';
import { getAuth } from 'firebase/auth';
import { cn } from '../lib/utils';

const VoiceMessageRecorder = ({ onSend, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleStartRecording = async () => {
        const success = await startRecording();
        if (success) {
            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            alert('Mikrofon erişimi reddedildi.');
        }
    };

    const handleStopAndSend = async () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);

        setIsUploading(true);

        try {
            const audioData = await stopRecording();

            if (!audioData) {
                setIsUploading(false);
                return;
            }

            const auth = getAuth();
            const user = auth.currentUser;

            const url = await uploadVoiceMessage(audioData, user?.uid || 'unknown');

            onSend({
                type: 'voice',
                url: url,
                duration: formatTime(Math.floor(audioData.duration / 1000))
            });
        } catch (error) {
            console.error('Voice message error:', error);
            alert('Sesli mesaj gönderilemedi');
        }

        setIsUploading(false);
    };

    const handleCancel = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        stopRecording(); // Stop actual recording
        onCancel();
    };

    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const seconds = secs % 60;
        return `${mins}:${seconds.toString().padStart(2, '0')}`;
    };

    if (isRecording) {
        return (
            <div className="flex items-center gap-2 flex-1 animate-in fade-in duration-200">
                <div className="flex-1 flex items-center gap-2 bg-dark-surface rounded-full px-4 py-2 border border-dark-border">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono text-sm text-white min-w-[40px]">{formatTime(duration)}</span>
                    <span className="text-xs text-gray-400">Kaydediliyor...</span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full w-10 h-10"
                >
                    <Trash2 size={20} />
                </Button>

                <Button
                    onClick={handleStopAndSend}
                    className="bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Send size={20} className="ml-0.5" />
                    )}
                </Button>
            </div>
        );
    }

    return (
        <Button
            onClick={handleStartRecording}
            className="w-12 h-12 rounded-full bg-[#00a884] hover:bg-[#008f6f] flex items-center justify-center shadow-lg transition-all active:scale-95"
        >
            <Mic size={24} className="text-white" />
        </Button>
    );
};

export default VoiceMessageRecorder;
