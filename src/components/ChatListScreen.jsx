import { useState, useEffect } from 'react';
import { getFirebaseDb, getFirebaseAuth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Button, Avatar } from './ui';
import { LogOut, User, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const ChatListScreen = ({ onSelectChat, onShowProfile }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    const currentUser = auth.currentUser;

    useEffect(() => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('__name__', '!=', currentUser.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersList);
            setLoading(false);
        });

        updateDoc(doc(db, 'users', currentUser.uid), {
            isOnline: true,
            lastSeen: new Date()
        });

        return () => {
            updateDoc(doc(db, 'users', currentUser.uid), {
                isOnline: false,
                lastSeen: new Date()
            });
            unsubscribe();
        };
    }, [currentUser.uid, db]);

    const getStatusText = (user) => {
        if (user.isOnline) return 'Çevrimiçi';
        if (user.lastSeen) {
            try {
                const lastSeenDate = user.lastSeen.toDate();
                return 'Son görülme ' + formatDistanceToNow(lastSeenDate, { addSuffix: false, locale: tr });
            } catch {
                return 'Çevrimdışı';
            }
        }
        return 'Çevrimdışı';
    };

    const filteredUsers = users.filter(user =>
        (user.displayName || user.email).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen flex flex-col bg-dark-bg">
            {/* Header - WhatsApp Style */}
            <div className="p-4 bg-dark-surface">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold">GearLink</h1>
                    <div className="flex gap-3">
                        <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0" onClick={onShowProfile} title="Profil">
                            <User size={20} />
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0" onClick={() => signOut(auth)} title="Çıkış Yap">
                            <LogOut size={20} />
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Ara veya yeni sohbet başlat"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-dark-bg rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="text-center text-gray-400 py-8">Yükleniyor...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 px-4">
                        <p>{searchQuery ? 'Sonuç bulunamadı' : 'Henüz başka kullanıcı yok'}</p>
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <div
                            key={user.id}
                            onClick={() => onSelectChat({
                                id: user.id,
                                name: user.displayName || user.email,
                                photoURL: user.photoURL,
                                isOnline: user.isOnline,
                                lastSeen: user.lastSeen
                            })}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-dark-hover cursor-pointer border-b border-dark-border/30"
                        >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <Avatar
                                    src={user.photoURL}
                                    fallback={user.displayName?.[0] || user.email[0]}
                                    className="w-12 h-12 bg-primary/20 text-primary font-semibold"
                                />
                                {user.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-dark-bg rounded-full" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-medium truncate">
                                        {user.displayName || user.email}
                                    </h3>
                                    <span className="text-xs text-gray-500 ml-2">14:47</span>
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                    <p className="text-sm text-gray-400 truncate">
                                        {user.bio || getStatusText(user)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatListScreen;
