import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './lib/firebase';
import AuthScreen from './components/AuthScreen';
import ChatListScreen from './components/ChatListScreen';
import ChatScreen from './components/ChatScreen';
import ProfileScreen from './components/ProfileScreen';
import ViewProfileScreen from './components/ViewProfileScreen';
import SettingsScreen from './components/SettingsScreen';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import AdminPanel from './components/AdminPanel';
import IncomingCallModal from './components/IncomingCallModal';
import ActiveCallScreen from './components/ActiveCallScreen';
import KubraNisaBotService from './lib/kubraNisaBotService';
import { useVoiceCall } from './hooks/useVoiceCall';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentChat, setCurrentChat] = useState(null);
    const [viewingProfile, setViewingProfile] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const botServiceRef = useRef(null);

    // Get Firebase instances
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    // Initialize voice/video calling
    const {
        callState,
        currentCall,
        remoteUser,
        isMuted,
        isVideoEnabled,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo
    } = useVoiceCall(db, user);

    // Responsive resize listener
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        console.log('App.jsx: useEffect started');

        try {
            const auth = getFirebaseAuth();
            const db = getFirebaseDb();

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

                        // Initialize Kübra Nisa AI Bot
                        if (!botServiceRef.current) {
                            console.log('App.jsx: Starting Kübra Nisa AI Bot...');
                            botServiceRef.current = new KubraNisaBotService(user.uid);
                            botServiceRef.current.start();
                            botServiceRef.current.scheduleRandomMessages();
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
        } catch (error) {
            console.error('App.jsx: Fatal error:', error);
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">Yükleniyor...</div>
            </div>
        );
    }

    if (!user) {
        return <AuthScreen />;
    }

    if (showProfile) {
        // Setup window.openSettings for ProfileScreen (legacy support if needed)
        window.openSettings = () => {
            setShowProfile(false);
            setShowSettings(true);
        };
        return <ProfileScreen onBack={() => setShowProfile(false)} />;
    }

    if (viewingProfile) {
        return <ViewProfileScreen user={viewingProfile} onBack={() => setViewingProfile(null)} />;
    }

    if (showSettings) {
        // Setup window.openAdminPanel for SettingsScreen
        window.openAdminPanel = () => {
            setShowSettings(false);
            setShowAdmin(true);
        };
        return (
            <SettingsScreen
                onBack={() => setShowSettings(false)}
                onProfileClick={() => {
                    setShowSettings(false);
                    setShowProfile(true);
                }}
            />
        );
    }

    // WhatsApp-style responsive layout
    return (
        <>
            <EmailVerificationBanner />

            {/* Admin Panel */}
            {showAdmin && (
                <AdminPanel
                    onClose={() => setShowAdmin(false)}
                    currentUser={user}
                />
            )}

            {isMobile ? (
                // Mobile: Single screen with toggle
                currentChat ? (
                    <ChatScreen
                        key={currentChat.id}
                        user={user}
                        chat={currentChat}
                        onBack={() => setCurrentChat(null)}
                        onViewProfile={setViewingProfile}
                    />
                ) : (
                    <ChatListScreen
                        user={user}
                        onSelectChat={setCurrentChat}
                        onShowProfile={() => setShowProfile(true)}
                        onSettingsClick={() => setShowSettings(true)}
                    />
                )
            ) : (
                // Tablet/Desktop: Split screen
                <div className="flex h-screen">
                    {/* Left: Chat List (30%) */}
                    <div className="w-[30%] border-r border-dark-border">
                        <ChatListScreen
                            user={user}
                            onSelectChat={setCurrentChat}
                            onShowProfile={() => setShowProfile(true)}
                            onSettingsClick={() => setShowSettings(true)}
                        />
                    </div>

                    {/* Right: Active Chat (70%) */}
                    <div className="flex-1">
                        {currentChat ? (
                            <ChatScreen
                                key={currentChat.id}
                                user={user}
                                chat={currentChat}
                                onBack={() => setCurrentChat(null)}
                                onViewProfile={setViewingProfile}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-dark-bg">
                                <div className="text-center p-8">
                                    <div className="text-6xl mb-4">💬</div>
                                    <h2 className="text-2xl font-semibold mb-2">GearLink</h2>
                                    <p className="text-gray-400">Bir sohbet seçin ve konuşmaya başlayın</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Incoming Call Modal */}
            {callState === 'ringing' && remoteUser && (
                <IncomingCallModal
                    caller={remoteUser}
                    isVideo={currentCall?.isVideo || false}
                    onAccept={() => acceptCall(currentCall?.isVideo)}
                    onReject={rejectCall}
                />
            )}

            {/* Active Call Screen */}
            {callState === 'active' && remoteUser && (
                <ActiveCallScreen
                    remoteUser={remoteUser}
                    isMuted={isMuted}
                    isVideoEnabled={isVideoEnabled}
                    onToggleMute={toggleMute}
                    onToggleVideo={toggleVideo}
                    onEndCall={endCall}
                />
            )}
        </>
    );
}

export default App;
