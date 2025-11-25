import { useState, useEffect } from 'react';
import { getFirebaseDb } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button, Avatar } from './ui';
import { ArrowLeft, Phone, Video, MessageCircle, MapPin, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const ViewProfileScreen = ({ userId, onBack, onStartChat, onCall, onVideoCall }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const db = getFirebaseDb();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    setUser({
                        id: userDoc.id,
                        ...userDoc.data()
                    });
                }
            } catch (error) {
                console.error('Error loading user:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            loadUser();
        }
    }, [userId, db]);

    const getStatusText = () => {
        if (!user) return '';
        if (user.isOnline) return 'Çevrimiçi';
        if (user.lastSeen) {
            try {
                const lastSeenDate = user.lastSeen.toDate ? user.lastSeen.toDate() : new Date(user.lastSeen);
                return 'Son görülme ' + formatDistanceToNow(lastSeenDate, { addSuffix: false, locale: tr });
            } catch {
                return 'Çevrimdışı';
            }
        }
        return 'Çevrimdışı';
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col bg-dark-bg text-white">
                <div className="p-4 border-b border-dark-border bg-dark-surface flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack} className="rounded-full w-10 h-10 p-0">
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-xl font-semibold">Profil</h1>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-screen flex flex-col bg-dark-bg text-white">
                <div className="p-4 border-b border-dark-border bg-dark-surface flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack} className="rounded-full w-10 h-10 p-0">
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-xl font-semibold">Profil</h1>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400">Kullanıcı bulunamadı</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-dark-bg text-white">
            {/* Header */}
            <div className="p-4 border-b border-dark-border bg-dark-surface flex items-center gap-4">
                <Button variant="ghost" onClick={onBack} className="rounded-full w-10 h-10 p-0">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="text-xl font-semibold">Profil</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Profile Photo and Name */}
                <div className="flex flex-col items-center py-8 px-4 bg-dark-surface">
                    <Avatar
                        src={user.photoURL}
                        fallback={user.displayName?.[0] || user.email[0]}
                        className="w-32 h-32 text-4xl bg-primary/20 mb-4"
                    />
                    <h2 className="text-2xl font-semibold mb-1">{user.displayName || user.email}</h2>
                    <p className="text-sm text-gray-400 mb-2">{getStatusText()}</p>
                    {user.bio && (
                        <p className="text-center text-gray-300 max-w-md mt-2">{user.bio}</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-4 space-y-3 border-b border-dark-border">
                    {onStartChat && (
                        <Button
                            onClick={() => {
                                onStartChat({
                                    id: user.id,
                                    name: user.displayName || user.email,
                                    photoURL: user.photoURL,
                                    isOnline: user.isOnline,
                                    lastSeen: user.lastSeen
                                });
                            }}
                            className="w-full bg-primary hover:bg-primary-hover flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={20} />
                            Mesaj Gönder
                        </Button>
                    )}
                    <div className="flex gap-3">
                        {onCall && (
                            <Button
                                onClick={() => onCall(user.id)}
                                variant="outline"
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <Phone size={20} />
                                Ara
                            </Button>
                        )}
                        {onVideoCall && (
                            <Button
                                onClick={() => onVideoCall(user.id)}
                                variant="outline"
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <Video size={20} />
                                Görüntülü Ara
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="px-4 py-4 space-y-4">
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase">Hakkında</h3>
                        
                        {user.email && (
                            <div className="flex items-center gap-3 py-2">
                                <div className="w-10 h-10 rounded-full bg-dark-surface flex items-center justify-center">
                                    <span className="text-gray-400">@</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">E-posta</p>
                                    <p className="text-white">{user.email}</p>
                                </div>
                            </div>
                        )}

                        {user.lastKnownLocation && (
                            <div className="flex items-center gap-3 py-2">
                                <div className="w-10 h-10 rounded-full bg-dark-surface flex items-center justify-center">
                                    <MapPin size={18} className="text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-400">Konum</p>
                                    {user.lastKnownLocation.link ? (
                                        <a
                                            href={user.lastKnownLocation.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {user.lastKnownLocation.cityName || 'Konum görüntüle'}
                                        </a>
                                    ) : (
                                        <p className="text-white">Konum paylaşılmamış</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {user.lastSeen && (
                            <div className="flex items-center gap-3 py-2">
                                <div className="w-10 h-10 rounded-full bg-dark-surface flex items-center justify-center">
                                    <Calendar size={18} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Son görülme</p>
                                    <p className="text-white">{getStatusText()}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewProfileScreen;

