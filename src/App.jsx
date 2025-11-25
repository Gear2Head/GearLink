import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './lib/firebase';
import AuthScreen from './components/AuthScreen';
import ChatListScreen from './components/ChatListScreen';
import ChatScreen from './components/ChatScreen';
import ProfileScreen from './components/ProfileScreen';
import AdminPanel from './components/AdminPanel';
import KubraNisaBotService from './lib/kubraNisaBotService';
import { Loader2, User, LogOut, Wrench, X } from 'lucide-react';
import { Button } from './components/ui';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chat, setChat] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const botServiceRef = useRef(null);

    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    useEffect(() => {
        console.log('App.jsx: useEffect started');

        // Safety timeout for offline scenarios
        const safetyTimeout = setTimeout(() => {
            console.warn('App.jsx: Firebase timeout - continuing anyway');
            setLoading(false);
        }, 3000);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            clearTimeout(safetyTimeout);
            console.log('App.jsx: Auth state changed', { user: user?.email || 'null' });

            try {
                if (user) {
                    console.log('App.jsx: User logged in, updating online status...');

                    const userDoc = await getDoc(doc(db, 'users', user.uid));

                    if (!userDoc.exists()) {
                        // Create new user profile
                        await setDoc(doc(db, 'users', user.uid), {
                            email: user.email,
                            displayName: user.displayName || user.email.split('@')[0],
                            photoURL: user.photoURL || null,
                            bio: '',
                            createdAt: serverTimestamp(),
                            lastSeen: serverTimestamp(),
                            isOnline: true
                        });
                        console.log('App.jsx: Profile created - ONLINE');
                    } else {
                        // Update existing user to online
                        await setDoc(doc(db, 'users', user.uid), {
                            lastSeen: serverTimestamp(),
                            isOnline: true
                        }, { merge: true });
                        console.log('App.jsx: User set to ONLINE');
                    }

                    // Initialize Kübra Nisa AI Bot
                    if (!botServiceRef.current) {
                        console.log('App.jsx: Starting Kübra Nisa AI Bot...');
                        botServiceRef.current = new KubraNisaBotService(user.uid);
                        botServiceRef.current.start();
                        botServiceRef.current.scheduleRandomMessages();
                    }

                    // Set user offline when window closes
                    window.addEventListener('beforeunload', async () => {
                        await setDoc(doc(db, 'users', user.uid), {
                            isOnline: false,
                            lastSeen: serverTimestamp()
                        }, { merge: true });

                        if (botServiceRef.current) {
                            botServiceRef.current.stop();
                        }
                    });
                }

                setUser(user);
                setLoading(false);
                console.log('App.jsx: Ready');
            } catch (error) {
                console.error('App.jsx: Error:', error);
                setUser(user);
                setLoading(false);
            }
        });

        return () => {
            clearTimeout(safetyTimeout);
            unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        try {
            if (user) {
                await setDoc(doc(db, 'users', user.uid), {
                    isOnline: false,
                    lastSeen: serverTimestamp()
                }, { merge: true });
            }
            await signOut(auth);
            setUser(null);
            setChat(null);
            setShowProfile(false);
            setShowAdminPanel(false);
            if (botServiceRef.current) {
                botServiceRef.current.stop();
                botServiceRef.current = null;
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-dark-bg">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <AuthScreen onLogin={setUser} />;
    }

    return (
        <div className="flex justify-center bg-black min-h-screen">
            <div className="w-full max-w-4xl bg-dark-bg shadow-2xl overflow-hidden relative flex flex-col h-[100dvh]">
                {chat ? (
                    <ChatScreen
                        user={user}
                        chat={chat}
                        onBack={() => setChat(null)}
                    />
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-dark-surface flex justify-between items-center sticky top-0 z-10 border-b border-dark-border">
                            <h1 className="text-xl font-bold text-gray-100 tracking-tight">GearLink</h1>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowProfile(true)}
                                    className="p-2 rounded-full hover:bg-dark-bg text-gray-400 hover:text-white"
                                >
                                    <User size={20} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="p-2 rounded-full hover:bg-dark-bg text-gray-400 hover:text-red-400"
                                >
                                    <LogOut size={20} />
                                </Button>
                            </div>
                        </div>

                        <ChatListScreen
                            user={user}
                            onSelectChat={setChat}
                            onShowProfile={() => setShowProfile(true)}
                        />

                        {/* Admin Panel Toggle */}
                        <div className="fixed bottom-4 left-4 z-50">
                            <Button
                                onClick={() => setShowAdminPanel(!showAdminPanel)}
                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2"
                            >
                                <Wrench size={16} />
                                Admin
                            </Button>
                        </div>

                        {/* Admin Panel Modal */}
                        {showAdminPanel && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                                <div className="bg-dark-surface rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border border-dark-border flex flex-col">
                                    <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Wrench size={20} className="text-red-500" />
                                            Admin Paneli
                                        </h2>
                                        <Button variant="ghost" onClick={() => setShowAdminPanel(false)}>
                                            <X size={20} />
                                        </Button>
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-4">
                                        <AdminPanel />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Profile Screen Modal */}
                {showProfile && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="w-full max-w-md bg-dark-surface rounded-2xl overflow-hidden shadow-2xl border border-dark-border">
                            <div className="p-4 border-b border-dark-border flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Profil</h2>
                                <Button variant="ghost" onClick={() => setShowProfile(false)}>
                                    <X size={20} />
                                </Button>
                            </div>
                            <ProfileScreen user={user} onBack={() => setShowProfile(false)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
