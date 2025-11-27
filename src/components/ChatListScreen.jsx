import { useState, useEffect, useRef } from 'react';
import { getFirebaseDb, getFirebaseAuth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Button, Avatar } from './ui';
import { LogOut, User, Search, MoreVertical, Settings, Camera, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const ChatListScreen = ({ onSelectChat, onShowProfile, onSettingsClick }) => {
    const [users, setUsers] = useState([]);
    const [recentChats, setRecentChats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('chats');
    const menuRef = useRef(null);
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    const currentUser = auth.currentUser;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch Users and Recent Chats
    useEffect(() => {
        const usersRef = collection(db, 'users');
        const qUsers = query(usersRef, where('__name__', '!=', currentUser.uid));

        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersList);
        });

        const recentChatsRef = collection(db, `users/${currentUser.uid}/recentChats`);
        const unsubscribeChats = onSnapshot(recentChatsRef, (snapshot) => {
            const chats = {};
            snapshot.docs.forEach(doc => {
                chats[doc.id] = doc.data();
            });
            setRecentChats(chats);
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
            unsubscribeUsers();
            unsubscribeChats();
        };
    }, [currentUser.uid, db]);

    const getStatusText = (user) => {
        const chatData = recentChats[user.id];
        if (chatData?.lastMessage) {
            return chatData.lastMessage;
        }
        if (user.isOnline) return 'Çevrimiçi';
        if (user.lastSeen?.toDate) {
            try {
                const lastSeenDate = user.lastSeen.toDate();
                return 'Son görülme ' + formatDistanceToNow(lastSeenDate, { addSuffix: false, locale: tr });
            } catch {
                return 'Çevrimdışı';
            }
        }
        return 'Çevrimdışı';
    };

    const getLastMessageTime = (user) => {
        const chatData = recentChats[user.id];
        if (chatData?.timestamp?.toDate) {
            try {
                return formatDistanceToNow(chatData.timestamp.toDate(), { addSuffix: false, locale: tr });
            } catch {
                return '';
            }
        }
        return '';
    };

    const getUnreadCount = (user) => {
        return recentChats[user.id]?.unreadCount || 0;
    };

    const filteredUsers = users.filter(user => {
        const name = user.displayName || user.email || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    }).sort((a, b) => {
        const timeA = recentChats[a.id]?.timestamp?.toMillis ? recentChats[a.id].timestamp.toMillis() : 0;
        const timeB = recentChats[b.id]?.timestamp?.toMillis ? recentChats[b.id].timestamp.toMillis() : 0;
        return timeB - timeA; // Sort by newest first
    });

    return (
        <div className="h-screen flex flex-col bg-dark-bg text-white">
            {/* Header */}
            <div className="bg-dark-surface p-4 pb-0 shadow-md z-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-200">GearLink</h1>
                    <div className="flex gap-4 items-center">
                        <Button variant="ghost" size="sm" className="p-1 text-gray-300">
                            <Camera size={20} />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1 text-gray-300">
                            <Search size={20} />
                        </Button>
                        <div className="relative" ref={menuRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 text-gray-300"
                                onClick={() => setShowMenu(!showMenu)}
                            >
                                <MoreVertical size={20} />
                            </Button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-dark-surface border border-dark-border rounded-lg shadow-xl py-2 z-50 origin-top-right">
                                    <button className="w-full text-left px-4 py-3 hover:bg-dark-hover text-sm text-white">Yeni Grup</button>
                                    <button className="w-full text-left px-4 py-3 hover:bg-dark-hover text-sm text-white">Yeni Toplu Mesaj</button>
                                    <button className="w-full text-left px-4 py-3 hover:bg-dark-hover text-sm text-white">Bağlı Cihazlar</button>
                                    <button className="w-full text-left px-4 py-3 hover:bg-dark-hover text-sm text-white">Yıldızlı Mesajlar</button>
                                    <button
                                        className="w-full text-left px-4 py-3 hover:bg-dark-hover text-sm text-white"
                                        onClick={() => {
                                            setShowMenu(false);
                                            onSettingsClick();
                                        }}
                                    >
                                        Ayarlar
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-3 hover:bg-dark-hover text-sm text-white"
                                        onClick={() => {
                                            setShowMenu(false);
                                            signOut(auth);
                                        }}
                                    >
                                        Çıkış Yap
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between text-gray-400 font-medium text-sm uppercase">
                    <button className="pb-3 w-8 flex justify-center">
                        <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                            <span className="text-xs">👥</span>
                        </div>
                    </button>
                    <button
                        className={`pb-3 flex-1 text-center border-b-2 transition-colors ${activeTab === 'chats' ? 'border-primary text-primary' : 'border-transparent'}`}
                        onClick={() => setActiveTab('chats')}
                    >
                        Sohbetler
                    </button>
                    <button
                        className={`pb-3 flex-1 text-center border-b-2 transition-colors ${activeTab === 'status' ? 'border-primary text-primary' : 'border-transparent'}`}
                        onClick={() => setActiveTab('status')}
                    >
                        Durum
                    </button>
                    <button
                        className={`pb-3 flex-1 text-center border-b-2 transition-colors ${activeTab === 'calls' ? 'border-primary text-primary' : 'border-transparent'}`}
                        onClick={() => setActiveTab('calls')}
                    >
                        Aramalar
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto relative">
                {activeTab === 'chats' ? (
                    loading ? (
                        <div className="flex justify-center items-center h-full text-gray-400">Yükleniyor...</div>
                    ) : (
                        <div className="divide-y divide-dark-border">
                            {filteredUsers.map(user => {
                                const unreadCount = getUnreadCount(user);
                                return (
                                    <div
                                        key={user.id}
                                        className="p-4 flex items-center gap-4 hover:bg-dark-hover cursor-pointer transition"
                                        onClick={() => onSelectChat(user)}
                                    >
                                        <div className="relative">
                                            <Avatar src={user.photoURL} fallback={user.displayName?.[0]} className="w-12 h-12" />
                                            {user.isOnline && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-bg rounded-full"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-semibold text-white truncate">{user.displayName}</h3>
                                                <span className={`text-xs ${unreadCount > 0 ? 'text-green-500 font-bold' : 'text-gray-500'}`}>
                                                    {getLastMessageTime(user)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                                                    {getStatusText(user)}
                                                </p>
                                                {unreadCount > 0 && (
                                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                        <span className="text-xs text-black font-bold">{unreadCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
                        <p className="mb-2">Bu özellik yakında eklenecek</p>
                        <p className="text-xs">Şu an sadece Sohbetler sekmesi aktif.</p>
                    </div>
                )}

                {/* FAB */}
                <div className="absolute bottom-6 right-6">
                    <Button className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center">
                        <MessageSquare size={24} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatListScreen;
