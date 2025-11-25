import { useState, useEffect } from 'react';
import { getFirebaseAuth, getFirebaseDb } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Button, Input } from './ui';
import { ArrowLeft, UserPlus, LogIn } from 'lucide-react';

const SwitchAccountScreen = ({ onBack, onAccountSwitch }) => {
    const [accounts, setAccounts] = useState([]);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    useEffect(() => {
        loadSavedAccounts();
    }, []);

    const loadSavedAccounts = () => {
        const saved = localStorage.getItem('gearlink_accounts');
        if (saved) {
            try {
                setAccounts(JSON.parse(saved));
            } catch (e) {
                console.error('Load accounts error:', e);
            }
        }
    };

    const handleAddAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            const user = auth.currentUser;
            
            const newAccount = {
                email: user.email,
                uid: user.uid,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL
            };

            const updated = [...accounts, newAccount];
            localStorage.setItem('gearlink_accounts', JSON.stringify(updated));
            setAccounts(updated);
            setShowAddAccount(false);
            setEmail('');
            setPassword('');
            
            if (onAccountSwitch) {
                onAccountSwitch(user);
            }
        } catch (error) {
            alert('Giriş hatası: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchAccount = async (account) => {
        setLoading(true);
        try {
            // Current user'ı logout yap
            await signOut(auth);
            
            // New account'a login yap
            await signInWithEmailAndPassword(auth, account.email, account.password || '');
            const user = auth.currentUser;
            
            if (onAccountSwitch) {
                onAccountSwitch(user);
            }
        } catch (error) {
            alert('Hesap değiştirme hatası: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-dark-bg">
            <div className="p-4 bg-dark-surface border-b border-dark-border flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="text-xl font-semibold">Hesap Yönetimi</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {showAddAccount ? (
                    <form onSubmit={handleAddAccount} className="space-y-4 max-w-md mx-auto">
                        <div>
                            <label className="text-sm font-medium mb-2 block">E-posta</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Şifre</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Şifre"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddAccount(false)}
                                className="flex-1"
                            >
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                <LogIn size={18} className="mr-2" />
                                Ekle
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4 max-w-md mx-auto">
                        <Button
                            onClick={() => setShowAddAccount(true)}
                            className="w-full"
                        >
                            <UserPlus size={18} className="mr-2" />
                            Hesap Ekle
                        </Button>

                        <div className="space-y-2">
                            {accounts.map((account, index) => (
                                <div
                                    key={index}
                                    className="bg-dark-surface p-4 rounded-lg flex items-center justify-between"
                                >
                                    <div>
                                        <div className="font-medium">{account.displayName}</div>
                                        <div className="text-sm text-gray-400">{account.email}</div>
                                    </div>
                                    <Button
                                        onClick={() => handleSwitchAccount(account)}
                                        disabled={loading}
                                        variant="outline"
                                    >
                                        Geçiş Yap
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SwitchAccountScreen;

