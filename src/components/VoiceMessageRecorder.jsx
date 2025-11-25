import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from './ui';
import { startRecording, stopRecording, uploadVoiceMessage } from '../lib/voiceRecorder';
import { getAuth } from 'firebase/auth';

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
            alert('Mikrofon erişimi reddedildi. Lütfen ayarlardan izin verin.');
        }
    };

    const handleStopAndSend = async () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);

        setIsUploading(true);

        try {
            const audioData = await stopRecording();

            if (!audioData) {
                alert('Ses kaydedilemedi');
                setIsUploading(false);
                return;
            }

            const auth = getAuth();
            const user = auth.currentUser;

            const url = await uploadVoiceMessage(audioData, user?.uid || 'unknown');

            onSend({
                type: 'voice',
                url: url,
                duration: Math.floor(audioData.duration / 1000)
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
        onCancel();
    };

    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const seconds = secs % 60;
        return `${mins}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-4 bg-dark-surface border-t border-dark-border flex items-center gap-3">
            {!isRecording ? (
                <Button
                    onClick={handleStartRecording}
                    className="flex-1 bg-error hover:bg-error/90"
                    disabled={isUploading}
                >
                    <Mic size={20} className="mr-2" />
                    Sesli Mesaj Kaydet
                </Button>
            ) : (
                <>
                    <div className="flex-1 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-error animate-pulse" />
                        <span className="font-mono text-lg">{formatTime(duration)}</span>
                        <div className="flex-1">
                            <div className="h-12 flex items-center gap-1">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-primary rounded-full"
                                        style={{
                                            height: `${Math.random() * 100}%`,
                                            opacity: 0.7
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleCancel} variant="ghost">
                        İptal
                    </Button>
                    <Button onClick={handleStopAndSend} className="bg-success hover:bg-success/90" disabled={isUploading}>
                        {isUploading ? <Loader2 className="animate-spin" size={20} /> : 'Gönder'}
                    </Button>
                </>
            )}
        </div>
    );
};

export default VoiceMessageRecorder;
