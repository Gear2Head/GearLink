import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './lib/firebase';
import AuthScreen from './components/AuthScreen';
import ChatListScreen from './components/ChatListScreen';
import ChatScreen from './components/ChatScreen';
import ProfileScreen from './components/ProfileScreen';
import SettingsScreen from './components/SettingsScreen';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import AdminPanel from './components/AdminPanel';
import DraggableAdminPanel from './components/DraggableAdminPanel';
import HiddenAdminScreen from './components/HiddenAdminScreen';
import SwitchAccountScreen from './components/SwitchAccountScreen';
import ViewProfileScreen from './components/ViewProfileScreen';
import KubraNisaBotService from './lib/kubraNisaBotService';
import { Loader2, User, LogOut, Wrench, X } from 'lucide-react';
import { Button } from './components/ui';
import { useVoiceCall } from './hooks/useVoiceCall';
import IncomingCallModal from './components/IncomingCallModal';
import ActiveCallScreen from './components/ActiveCallScreen';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chat, setChat] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showHiddenAdmin, setShowHiddenAdmin] = useState(false);
    const [showSwitchAccount, setShowSwitchAccount] = useState(false);
    const [viewProfileUserId, setViewProfileUserId] = useState(null);
    const [versionClickCount, setVersionClickCount] = useState(0);
    const botServiceRef = useRef(null);

    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    useEffect(() => {
        console.log('App.jsx: useEffect started');

        console.log('App.jsx: Firebase instances obtained');

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

                    // Request native permissions
                    import('./lib/permissions').then(({ requestAllPermissions }) => {
                        requestAllPermissions().catch(err => console.error('Permission request failed:', err));
                    });

                    // Initialize push notifications
                    import('./lib/pushNotificationService').then(({ initializePushNotifications }) => {
                        initializePushNotifications().catch(err => console.error('Push notification init failed:', err));
                    });

                    // Initialize Kübra Nisa AI Bot
                    if (!botServiceRef.current) {
                        console.log('App.jsx: Starting Kübra Nisa AI Bot...');
                        botServiceRef.current = new KubraNisaBotService(user.uid);
                        botServiceRef.current.start();
                        botServiceRef.current.scheduleRandomMessages();
                        
                        // Start Kübra location updates (Texas)
                        import('./lib/kubraLocationService').then(({ startKubraLocationUpdates }) => {
                            startKubraLocationUpdates();
                        });
                    }

                    // Set user offline when window closes or loses focus
                    window.addEventListener('beforeunload', async () => {
                        await setDoc(doc(db, 'users', user.uid), {
                            isOnline: false,
                            lastSeen: serverTimestamp()
                        }, { merge: true });

                        // Stop bot
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
                // Still set user even if profile sync fails
                setUser(user);
                setLoading(false);
            }
        });

        return () => {
            clearTimeout(safetyTimeout);
            unsubscribe();
        };
    }, []);

    // Voice Call Hook
    const {
        callState,
        currentCall,
        remoteUser,
        isMuted,
        isVideoEnabled,
        connectionState,
        localStream,
        remoteStream,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo
    } = useVoiceCall(db, user);

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
                        onCallStart={() => startCall(chat.id, false)}
                        onVideoCallStart={() => startCall(chat.id, true)}
                        onViewProfile={(userId) => setViewProfileUserId(userId)}
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
                            onShowSettings={() => setShowSettings(true)}
                            onShowSwitchAccount={() => setShowSwitchAccount(true)}
                            onViewProfile={(userId) => setViewProfileUserId(userId)}
                        />

                        {/* Admin Panel Toggle - Only for specific email */}
                        {user?.email === 'senerkadiralper@gmail.com' && (
                            <div className="fixed bottom-4 left-4 z-50">
                                <Button
                                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2"
                                >
                                    <Wrench size={16} />
                                    Admin
                                </Button>
                            </div>
                        )}

                        {/* Admin Panel Modal - Draggable */}
                        {showAdminPanel && user?.email === 'senerkadiralper@gmail.com' && (
                            <DraggableAdminPanel
                                onClose={() => setShowAdminPanel(false)}
                                currentUser={user}
                            />
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
                            <ProfileScreen user={user} onClose={() => setShowProfile(false)} onShowSettings={() => { setShowProfile(false); setShowSettings(true); }} />
                        </div>
                    </div>
                )}

                {/* Settings Screen */}
                {showSettings && (
                    <div className="fixed inset-0 z-50 bg-dark-bg">
                        <SettingsScreen
                            user={user}
                            onBack={() => setShowSettings(false)}
                            onShowProfile={() => { setShowSettings(false); setShowProfile(true); }}
                            onVersionClick={() => {
                                setVersionClickCount(prev => {
                                    const newCount = prev + 1;
                                    if (newCount >= 5) {
                                        setShowHiddenAdmin(true);
                                        setVersionClickCount(0);
                                    }
                                    setTimeout(() => setVersionClickCount(0), 3000);
                                    return newCount;
                                });
                            }}
                        />
                    </div>
                )}

                {/* Switch Account Screen */}
                {showSwitchAccount && (
                    <div className="fixed inset-0 z-50 bg-dark-bg">
                        <SwitchAccountScreen
                            onBack={() => setShowSwitchAccount(false)}
                            onAccountSwitch={(newUser) => {
                                setUser(newUser);
                                setShowSwitchAccount(false);
                            }}
                        />
                    </div>
                )}

                {/* View Profile Screen */}
                {viewProfileUserId && (
                    <div className="fixed inset-0 z-50 bg-dark-bg">
                        <ViewProfileScreen
                            userId={viewProfileUserId}
                            onBack={() => setViewProfileUserId(null)}
                            onStartChat={(chatUser) => {
                                setChat(chatUser);
                                setViewProfileUserId(null);
                            }}
                            onCall={(userId) => {
                                startCall(userId, false);
                                setViewProfileUserId(null);
                            }}
                            onVideoCall={(userId) => {
                                startCall(userId, true);
                                setViewProfileUserId(null);
                            }}
                        />
                    </div>
                )}

                {/* Hidden Admin Screen */}
                {showHiddenAdmin && user?.email === 'senerkadiralper@gmail.com' && (
                    <HiddenAdminScreen
                        user={user}
                        onClose={() => setShowHiddenAdmin(false)}
                    />
                )}

                {/* Voice Call Modals */}
                {callState === 'ringing' && (
                    <IncomingCallModal
                        caller={remoteUser}
                        onAccept={acceptCall}
                        onReject={rejectCall}
                    />
                )}

                {(callState === 'active' || callState === 'calling') && (
                    <ActiveCallScreen
                        caller={remoteUser}
                        isMuted={isMuted}
                        isVideoEnabled={isVideoEnabled}
                        onToggleMute={toggleMute}
                        onToggleVideo={toggleVideo}
                        onEndCall={endCall}
                        connectionState={connectionState}
                        localStream={localStream}
                        remoteStream={remoteStream}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
