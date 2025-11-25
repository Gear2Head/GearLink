import { useState, useEffect, useMemo } from 'react';
import { getFirebaseDb, getFirebaseAuth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, limit, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Button, Avatar } from './ui';
import { LogOut, User, Search, Settings, UserCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';

const ChatListScreen = ({ onSelectChat, onShowProfile, onShowSettings, onShowSwitchAccount, onViewProfile, user: currentUserProp }) => {
    const [users, setUsers] = useState([]);
    const [chatData, setChatData] = useState({}); // { userId: { lastMessage, unreadCount, lastMessageTime } }
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    const currentUser = currentUserProp || auth.currentUser;

    // Fetch users
    useEffect(() => {
        if (!currentUser) return;

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('__name__', '!=', currentUser.uid));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersList);
            setLoading(false);

            // Fetch last messages and unread counts for each user
            const chatDataPromises = usersList.map(async (user) => {
                const chatId = [currentUser.uid, user.id].sort().join('_');
                const messagesRef = collection(db, `chats/${chatId}/messages`);
                const lastMessageQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
                
                try {
                    const lastMessageSnapshot = await getDocs(lastMessageQuery);
                    const allMessagesSnapshot = await getDocs(query(messagesRef, orderBy('timestamp', 'desc')));
                    
                    let lastMessage = null;
                    let lastMessageTime = null;
                    let unreadCount = 0;

                    if (!lastMessageSnapshot.empty) {
                        const lastMsg = lastMessageSnapshot.docs[0].data();
                        lastMessage = lastMsg;
                        lastMessageTime = lastMsg.timestamp;
                    }

                    // Count unread messages (messages not sent by current user and not read)
                    allMessagesSnapshot.docs.forEach(doc => {
                        const msg = doc.data();
                        if (msg.senderId !== currentUser.uid && (!msg.read || !msg.read[currentUser.uid])) {
                            unreadCount++;
                        }
                    });

                    return {
                        userId: user.id,
                        lastMessage,
                        lastMessageTime,
                        unreadCount
                    };
                } catch (error) {
                    console.error(`Error fetching chat data for ${user.id}:`, error);
                    return { userId: user.id, lastMessage: null, lastMessageTime: null, unreadCount: 0 };
                }
            });

            const chatDataResults = await Promise.all(chatDataPromises);
            const chatDataMap = {};
            chatDataResults.forEach(result => {
                chatDataMap[result.userId] = {
                    lastMessage: result.lastMessage,
                    lastMessageTime: result.lastMessageTime,
                    unreadCount: result.unreadCount
                };
            });
            setChatData(chatDataMap);
        });

        if (currentUser.uid) {
            updateDoc(doc(db, 'users', currentUser.uid), {
                isOnline: true,
                lastSeen: new Date()
            });
        }

        return () => {
            if (currentUser.uid) {
                updateDoc(doc(db, 'users', currentUser.uid), {
                    isOnline: false,
                    lastSeen: new Date()
                });
            }
            unsubscribe();
        };
    }, [currentUser?.uid, db]);

    // Listen to real-time message updates for unread counts
    useEffect(() => {
        if (!currentUser || users.length === 0) return;

        const unsubscribes = users.map(user => {
            const chatId = [currentUser.uid, user.id].sort().join('_');
            const messagesRef = collection(db, `chats/${chatId}/messages`);
            
            return onSnapshot(query(messagesRef, orderBy('timestamp', 'desc')), (snapshot) => {
                let unreadCount = 0;
                let lastMessage = null;
                let lastMessageTime = null;

                snapshot.docs.forEach(doc => {
                    const msg = doc.data();
                    if (!lastMessage) {
                        lastMessage = msg;
                        lastMessageTime = msg.timestamp;
                    }
                    if (msg.senderId !== currentUser.uid && (!msg.read || !msg.read[currentUser.uid])) {
                        unreadCount++;
                    }
                });

                setChatData(prev => ({
                    ...prev,
                    [user.id]: {
                        ...prev[user.id],
                        lastMessage,
                        lastMessageTime,
                        unreadCount
                    }
                }));
            });
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [currentUser?.uid, users, db]);

    const getStatusText = (user) => {
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

    const getLastMessageText = (message) => {
        if (!message) return '';
        if (message.type === 'image') return '📷 Fotoğraf';
        if (message.type === 'video') return '🎥 Video';
        if (message.type === 'file') return '📎 Dosya';
        if (message.type === 'voice') return '🎤 Sesli mesaj';
        if (message.type === 'location') return '📍 Konum';
        if (message.type === 'poll') return '📊 Anket';
        if (message.type === 'gif') return 'GIF';
        return message.text || '';
    };

    const getLastMessageTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (days === 0) {
                return format(date, 'HH:mm', { locale: tr });
            } else if (days === 1) {
                return 'Dün';
            } else if (days < 7) {
                return format(date, 'EEEE', { locale: tr });
            } else {
                return format(date, 'dd/MM/yyyy', { locale: tr });
            }
        } catch {
            return '';
        }
    };

    // Sort users by last message time (most recent first)
    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            const aData = chatData[a.id];
            const bData = chatData[b.id];
            
            if (!aData?.lastMessageTime && !bData?.lastMessageTime) return 0;
            if (!aData?.lastMessageTime) return 1;
            if (!bData?.lastMessageTime) return -1;
            
            try {
                const aTime = aData.lastMessageTime.toDate ? aData.lastMessageTime.toDate() : new Date(aData.lastMessageTime);
                const bTime = bData.lastMessageTime.toDate ? bData.lastMessageTime.toDate() : new Date(bData.lastMessageTime);
                return bTime - aTime;
            } catch {
                return 0;
            }
        });
    }, [users, chatData]);

    const filteredUsers = sortedUsers.filter(user =>
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
                        {onShowSettings && (
                            <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0" onClick={onShowSettings} title="Ayarlar">
                                <Settings size={20} />
                            </Button>
                        )}
                        {onShowSwitchAccount && (
                            <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0" onClick={onShowSwitchAccount} title="Hesap Değiştir">
                                <UserCircle size={20} />
                            </Button>
                        )}
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
                        className="w-full pl-10 pr-4 py-2 bg-dark-bg rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
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
                    filteredUsers.map(user => {
                        const chatInfo = chatData[user.id] || {};
                        const unreadCount = chatInfo.unreadCount || 0;
                        const lastMessage = chatInfo.lastMessage;
                        const lastMessageTime = chatInfo.lastMessageTime;

                        return (
                            <div
                                key={user.id}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-dark-hover border-b border-dark-border/30 transition-colors"
                            >
                                {/* Avatar - Clickable for profile view */}
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onViewProfile) {
                                            onViewProfile(user.id);
                                        }
                                    }}
                                    className="relative flex-shrink-0 cursor-pointer"
                                >
                                    <Avatar
                                        src={user.photoURL}
                                        fallback={user.displayName?.[0] || user.email[0]}
                                        className="w-12 h-12 bg-primary/20 text-primary font-semibold"
                                    />
                                    {user.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-dark-bg rounded-full" />
                                    )}
                                    {unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-primary text-white text-xs font-semibold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </div>
                                    )}
                                </div>

                                {/* Info - Clickable for chat */}
                                <div
                                    onClick={() => onSelectChat({
                                        id: user.id,
                                        name: user.displayName || user.email,
                                        photoURL: user.photoURL,
                                        isOnline: user.isOnline,
                                        lastSeen: user.lastSeen
                                    })}
                                    className="flex-1 min-w-0 cursor-pointer"
                                >
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-medium truncate text-white">
                                            {user.displayName || user.email}
                                        </h3>
                                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                            {getLastMessageTime(lastMessageTime)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <p className="text-sm text-gray-400 truncate flex-1">
                                            {lastMessage ? getLastMessageText(lastMessage) : (user.bio || getStatusText(user))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChatListScreen;
