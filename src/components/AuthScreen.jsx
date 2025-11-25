import { useState } from 'react';
import { getFirebaseAuth, getFirebaseDb } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button, Input } from './ui';
import { Loader2 } from 'lucide-react';

// Create user profile in Firestore
const createUserProfile = async (user) => {
    const db = getFirebaseDb();
    await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.email.split('@')[0],
        photoURL: null,
        bio: '',
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        isOnline: true
    });
};

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const auth = getFirebaseAuth();

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Create user account
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                try {
                    // Create user profile in Firestore first
                    await createUserProfile(userCredential.user);

                    // Then send verification email
                    await sendEmailVerification(userCredential.user);

                    setSuccess("✅ Hesap oluşturuldu! E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.");
                    console.log("Verification email sent successfully");
                } catch (verifyErr) {
                    console.error("Verification email error:", verifyErr);
                    setSuccess("⚠️ Hesap oluşturuldu ama doğrulama maili gönderilemedi. Giriş yaptıktan sonra tekrar deneyebilirsiniz.");
                }
            }
        } catch (err) {
            console.error("Auth error:", err);
            let errorMessage = "Bir hata oluştu.";

            switch (err.code) {
                case 'auth/operation-not-allowed':
                    errorMessage = "⚠️ Giriş yöntemi devre dışı. Firebase Konsolu > Authentication > Sign-in method sekmesinden 'Email/Password' seçeneğini etkinleştirin.";
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = "Bu e-posta adresi zaten kullanımda.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Geçersiz e-posta adresi.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "Şifre çok zayıf. En az 6 karakter olmalı.";
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = "E-posta veya şifre hatalı.";
                    break;
                default:
                    errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px]" />

            <div className="w-full max-w-md bg-dark-surface/50 backdrop-blur-xl border border-dark-border/50 p-8 rounded-3xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        GearLink
                    </h1>
                    <p className="text-gray-400">Hoşgeldiniz, komutan.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm text-gray-400 mb-2">E-posta</label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="ornek@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm text-gray-400 mb-2">Şifre</label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="En az 6 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg">{error}</p>}
                    {success && <p className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded-lg">{success}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Giriş Yap' : 'Hesap Oluştur')}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setSuccess('');
                        }}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        {isLogin ? "Hesabın yok mu? Kayıt ol" : "Zaten hesabın var mı? Giriş yap"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
