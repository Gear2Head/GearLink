// Admin Panel - Message Management
import { useState, useEffect } from 'react';
import { getFirebaseDb } from '../lib/firebase';
import { collection, query, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Button } from './ui';
import { X, Trash2, RefreshCw, Eye, MessageSquare } from 'lucide-react';

const AdminPanel = ({ onClose, currentUser }) => {
    const db = getFirebaseDb();
    const [allMessages, setAllMessages] = useState([]);
    const [deletedMessages, setDeletedMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'deleted'
    const [stats, setStats] = useState({ total: 0, chats: 0, deleted: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStats();
        loadMessages();
        loadDeletedMessages();
        
        // Listen to deleted messages in real-time
        const unsubscribe = onSnapshot(collection(db, 'deletedMessages'), (snapshot) => {
            const deleted = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDeletedMessages(deleted.sort((a, b) => {
                const aTime = a.deletedAt?.toDate ? a.deletedAt.toDate() : new Date(a.deletedAt);
                const bTime = b.deletedAt?.toDate ? b.deletedAt.toDate() : new Date(b.deletedAt);
                return bTime - aTime;
            }));
            setStats(prev => ({ ...prev, deleted: deleted.length }));
        });

        return () => unsubscribe();
    }, []);

    const loadStats = async () => {
        try {
            // Count messages
            const chatsSnapshot = await getDocs(collection(db, 'chats'));
            let totalMessages = 0;

            for (const chatDoc of chatsSnapshot.docs) {
                const messagesSnapshot = await getDocs(collection(db, `chats/${chatDoc.id}/messages`));
                totalMessages += messagesSnapshot.size;
            }

            // Count deleted messages
            const deletedSnapshot = await getDocs(collection(db, 'deletedMessages'));

            setStats({
                total: totalMessages,
                chats: chatsSnapshot.size,
                deleted: deletedSnapshot.size
            });
        } catch (error) {
            console.error('Stats error:', error);
        }
    };

    const loadDeletedMessages = async () => {
        try {
            const deletedSnapshot = await getDocs(collection(db, 'deletedMessages'));
            const deleted = deletedSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDeletedMessages(deleted.sort((a, b) => {
                const aTime = a.deletedAt?.toDate ? a.deletedAt.toDate() : new Date(a.deletedAt);
                const bTime = b.deletedAt?.toDate ? b.deletedAt.toDate() : new Date(b.deletedAt);
                return bTime - aTime;
            }));
        } catch (error) {
            console.error('Load deleted messages error:', error);
        }
    };

    const loadMessages = async () => {
        setLoading(true);
        try {
            const messages = [];
            const chatsSnapshot = await getDocs(collection(db, 'chats'));

            for (const chatDoc of chatsSnapshot.docs) {
                const messagesSnapshot = await getDocs(collection(db, `chats/${chatDoc.id}/messages`));
                messagesSnapshot.docs.forEach(msgDoc => {
                    messages.push({
                        id: msgDoc.id,
                        chatId: chatDoc.id,
                        ...msgDoc.data()
                    });
                });
            }

            setAllMessages(messages.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds).slice(0, 50));
        } catch (error) {
            console.error('Load messages error:', error);
        }
        setLoading(false);
    };

    const deleteAllMessages = async () => {
        if (!confirm('TÜM mesajları silmek istediğinize emin misiniz?')) return;

        setLoading(true);
        try {
            const chatsSnapshot = await getDocs(collection(db, 'chats'));

            for (const chatDoc of chatsSnapshot.docs) {
                const messagesSnapshot = await getDocs(collection(db, `chats/${chatDoc.id}/messages`));
                for (const msgDoc of messagesSnapshot.docs) {
                    await deleteDoc(doc(db, `chats/${chatDoc.id}/messages`, msgDoc.id));
                }
            }

            alert('Tüm mesajlar silindi!');
            loadStats();
            loadMessages();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
        setLoading(false);
    };

    const deleteMessage = async (chatId, messageId) => {
        try {
            await deleteDoc(doc(db, `chats/${chatId}/messages`, messageId));
            loadMessages();
            loadStats();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-surface rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-dark-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Admin Panel</h2>
                        <p className="text-sm text-gray-400">Mesaj Yönetimi</p>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="rounded-full w-10 h-10 p-0">
                        <X size={20} />
                    </Button>
                </div>

                {/* Stats */}
                <div className="p-4 grid grid-cols-3 gap-4 border-b border-dark-border">
                    <div className="bg-dark-bg p-4 rounded-lg">
                        <MessageSquare className="text-primary mb-2" size={24} />
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-sm text-gray-400">Toplam Mesaj</div>
                    </div>
                    <div className="bg-dark-bg p-4 rounded-lg">
                        <Eye className="text-primary mb-2" size={24} />
                        <div className="text-2xl font-bold">{stats.chats}</div>
                        <div className="text-sm text-gray-400">Sohbet Sayısı</div>
                    </div>
                    <div className="bg-dark-bg p-4 rounded-lg">
                        <Trash2 className="text-red-500 mb-2" size={24} />
                        <div className="text-2xl font-bold">{stats.deleted}</div>
                        <div className="text-sm text-gray-400">Silinen Mesaj</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="p-4 border-b border-dark-border flex gap-2">
                    <Button
                        variant={activeTab === 'messages' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('messages')}
                        className="flex-1"
                    >
                        Aktif Mesajlar
                    </Button>
                    <Button
                        variant={activeTab === 'deleted' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('deleted')}
                        className="flex-1"
                    >
                        Silinen Mesajlar ({deletedMessages.length})
                    </Button>
                </div>

                {/* Actions */}
                <div className="p-4 border-b border-dark-border flex gap-2">
                    <Button
                        onClick={loadMessages}
                        disabled={loading}
                        className="flex-1"
                    >
                        <RefreshCw size={18} className="mr-2" />
                        Yenile
                    </Button>
                    <Button
                        onClick={deleteAllMessages}
                        disabled={loading}
                        className="flex-1 bg-error hover:bg-error/90"
                    >
                        <Trash2 size={18} className="mr-2" />
                        Tümünü Sil
                    </Button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center text-gray-400 py-8">Yükleniyor...</div>
                    ) : activeTab === 'messages' ? (
                        allMessages.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">Mesaj yok</div>
                        ) : (
                            <div className="space-y-2">
                                {allMessages.map(msg => (
                                    <div key={msg.id} className="bg-dark-bg p-3 rounded-lg flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-gray-400 mb-1">
                                                {msg.senderId.substring(0, 8)}... → {msg.receiverId.substring(0, 8)}...
                                            </div>
                                            <div className="truncate">{msg.text || `[${msg.type}]`}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {msg.timestamp?.toDate().toLocaleString('tr-TR') || 'Tarih yok'}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => deleteMessage(msg.chatId, msg.id)}
                                            className="text-error hover:text-error/80"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        deletedMessages.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">Silinen mesaj yok</div>
                        ) : (
                            <div className="space-y-2">
                                {deletedMessages.map(msg => (
                                    <div key={msg.id} className="bg-dark-bg p-3 rounded-lg border border-red-500/20">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-red-400 mb-1">
                                                Silindi - {msg.deletedBy?.substring(0, 8)}... tarafından
                                            </div>
                                            <div className="text-sm text-gray-400 mb-1">
                                                {msg.senderId?.substring(0, 8)}... → {msg.receiverId?.substring(0, 8)}...
                                            </div>
                                            <div className="truncate text-gray-300">{msg.text || `[${msg.type}]`}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Silinme: {msg.deletedAt?.toDate ? msg.deletedAt.toDate().toLocaleString('tr-TR') : 'Tarih yok'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Orijinal: {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString('tr-TR') : 'Tarih yok'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
