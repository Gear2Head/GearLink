import { useState } from 'react';
import { getFirebaseAuth } from '../lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from './ui';
import { AlertCircle, Mail, RefreshCw } from 'lucide-react';

const EmailVerificationBanner = () => {
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    const handleResend = async () => {
        setSending(true);
        setMessage('');
        try {
            await sendEmailVerification(user);
            setMessage('Doğrulama e-postası gönderildi! Lütfen gelen kutunuzu kontrol edin.');
        } catch (err) {
            setMessage('Hata: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    if (!user || user.emailVerified) return null;

    return (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 p-4">
            <div className="max-w-md mx-auto flex items-start gap-3">
                <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                    <h3 className="font-semibold text-yellow-200 mb-1">E-posta Doğrulaması Gerekli</h3>
                    <p className="text-sm text-gray-300 mb-3">
                        Hesabınızı kullanmaya devam etmek için e-posta adresinizi doğrulamanız gerekiyor.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleResend}
                            disabled={sending}
                            variant="secondary"
                            className="text-sm py-2 px-3"
                        >
                            {sending ? <RefreshCw size={16} className="animate-spin" /> : <Mail size={16} />}
                            Yeniden Gönder
                        </Button>
                        <Button
                            onClick={handleRefresh}
                            variant="ghost"
                            className="text-sm py-2 px-3"
                        >
                            <RefreshCw size={16} />
                            Yenile
                        </Button>
                    </div>
                    {message && (
                        <p className={`text-xs mt-2 ${message.startsWith('Hata') ? 'text-red-400' : 'text-green-400'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationBanner;
