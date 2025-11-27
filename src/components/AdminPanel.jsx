// Admin Panel - Message & User Management
import { useState, useEffect } from 'react';
import { getFirebaseDb } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Button } from './ui';
import { X, Trash2, RefreshCw, Eye, MessageSquare, Users, Server, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const AdminPanel = ({ onClose, currentUser }) => {
    const db = getFirebaseDb();
    const [activeTab, setActiveTab] = useState('messages');
    const [allMessages, setAllMessages] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [stats, setStats] = useState({ totalMessages: 0, totalChats: 0, totalUsers: 0 });
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState('Online');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load Users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllUsers(usersList);

            // Load Messages & Stats
            const chatsSnapshot = await getDocs(collection(db, 'chats'));
            let msgCount = 0;
            const messages = [];

            for (const chatDoc of chatsSnapshot.docs) {
                const messagesSnapshot = await getDocs(collection(db, `chats/${chatDoc.id}/messages`));
                msgCount += messagesSnapshot.size;

                messagesSnapshot.docs.forEach(msgDoc => {
                    messages.push({
                        id: msgDoc.id,
                        chatId: chatDoc.id,
                        ...msgDoc.data()
                    });
                });
            }

            setStats({
                totalMessages: msgCount,
                totalChats: chatsSnapshot.size,
                totalUsers: usersSnapshot.size
            });

            setAllMessages(messages.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds).slice(0, 50));
            setServerStatus('Online');
        } catch (error) {
            console.error('Load data error:', error);
            setServerStatus('Error');
        }
        setLoading(false);
    };

    const deleteMessage = async (chatId, messageId) => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
        try {
            await deleteDoc(doc(db, `chats/${chatId}/messages`, messageId));
            loadData();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-dark-surface rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-dark-border shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-bg/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Activity className="text-primary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                            <div className="flex items-center gap-2 text-xs">
                                <span className={`w-2 h-2 rounded-full ${serverStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-gray-400">Sunucu: {serverStatus}</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="rounded-full hover:bg-white/10">
                        <X size={24} />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-dark-border">
                    <button
                        className={`flex-1 p-3 text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-400 hover:bg-white/5'}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        Mesajlar
                    </button>
                    <button
                        className={`flex-1 p-3 text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-400 hover:bg-white/5'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Kullanıcılar
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-dark-bg/30">
                    <div className="bg-dark-bg p-3 rounded-lg border border-dark-border flex items-center gap-3">
                        <MessageSquare className="text-blue-400" size={20} />
                        <div>
                            <div className="text-lg font-bold text-white">{stats.totalMessages}</div>
                            <div className="text-xs text-gray-500">Mesaj</div>
                        </div>
                    </div>
                    <div className="bg-dark-bg p-3 rounded-lg border border-dark-border flex items-center gap-3">
                        <Users className="text-green-400" size={20} />
                        <div>
                            <div className="text-lg font-bold text-white">{stats.totalUsers}</div>
                            <div className="text-xs text-gray-500">Kullanıcı</div>
                        </div>
                    </div>
                    <div className="bg-dark-bg p-3 rounded-lg border border-dark-border flex items-center gap-3">
                        <Server className="text-purple-400" size={20} />
                        <div>
                            <div className="text-lg font-bold text-white">{stats.totalChats}</div>
                            <div className="text-xs text-gray-500">Sohbet</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-dark-bg">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <RefreshCw className="animate-spin mr-2" /> Yükleniyor...
                        </div>
                    ) : activeTab === 'messages' ? (
                        <div className="space-y-2">
                            {allMessages.map(msg => (
                                <div key={msg.id} className="bg-dark-surface p-3 rounded-lg border border-dark-border flex items-start gap-3 hover:border-primary/30 transition">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-mono text-gray-500">{msg.id.slice(0, 8)}</span>
                                            <span className="text-xs text-gray-500">
                                                {msg.timestamp?.toDate().toLocaleString('tr-TR')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300 break-words">{msg.text || `[${msg.type}]`}</p>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {msg.senderId === currentUser?.uid ? 'Siz' : 'Kullanıcı'} → Alıcı
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteMessage(msg.chatId, msg.id)}
                                        className="text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {allUsers.map(user => (
                                <div key={user.id} className="bg-dark-surface p-3 rounded-lg border border-dark-border flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {user.displayName?.[0] || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-white">{user.displayName || 'İsimsiz'}</h3>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs px-2 py-1 rounded-full ${user.isOnline ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                            {user.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                                        </div>
                                        {user.lastSeen && (
                                            <p className="text-[10px] text-gray-600 mt-1">
                                                {formatDistanceToNow(user.lastSeen.toDate(), { addSuffix: true, locale: tr })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
