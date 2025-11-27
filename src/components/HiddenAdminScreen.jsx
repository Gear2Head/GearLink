import { useState, useEffect } from 'react';
import { getFirebaseDb } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Button } from './ui';
import { X, Database, Users, MessageSquare, MapPin, Server } from 'lucide-react';

const HiddenAdminScreen = ({ user, onClose }) => {
    const [stats, setStats] = useState({
        users: 0,
        messages: 0,
        chats: 0,
        deletedMessages: 0
    });
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const db = getFirebaseDb();

            // Count users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllUsers(users);

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
                users: users.length,
                messages: totalMessages,
                chats: chatsSnapshot.size,
                deletedMessages: deletedSnapshot.size
            });
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-dark-surface rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-red-500/50 flex flex-col">
                <div className="p-4 border-b border-red-500/50 flex justify-between items-center bg-red-500/10">
                    <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                        <Server size={24} />
                        Gizli Admin Paneli
                    </h2>
                    <Button variant="ghost" onClick={onClose}>
                        <X size={20} />
                    </Button>
                </div>

                <div className="overflow-y-auto flex-1 p-4">
                    {loading ? (
                        <div className="text-center text-gray-400 py-8">Yükleniyor...</div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                                    <Users className="text-primary mb-2" size={24} />
                                    <div className="text-2xl font-bold">{stats.users}</div>
                                    <div className="text-sm text-gray-400">Kullanıcı</div>
                                </div>
                                <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                                    <MessageSquare className="text-primary mb-2" size={24} />
                                    <div className="text-2xl font-bold">{stats.messages}</div>
                                    <div className="text-sm text-gray-400">Mesaj</div>
                                </div>
                                <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                                    <Database className="text-primary mb-2" size={24} />
                                    <div className="text-2xl font-bold">{stats.chats}</div>
                                    <div className="text-sm text-gray-400">Sohbet</div>
                                </div>
                                <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                                    <X className="text-red-500 mb-2" size={24} />
                                    <div className="text-2xl font-bold">{stats.deletedMessages}</div>
                                    <div className="text-sm text-gray-400">Silinen</div>
                                </div>
                            </div>

                            {/* Users List */}
                            <div className="bg-dark-bg rounded-lg p-4 mb-4">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Users size={20} />
                                    Kayıtlı Kullanıcılar ({allUsers.length})
                                </h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {allUsers.map(u => (
                                        <div key={u.id} className="bg-dark-surface p-3 rounded-lg flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium">{u.displayName || u.email}</div>
                                                <div className="text-sm text-gray-400">{u.email}</div>
                                                {u.lastLocation && (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <MapPin size={12} />
                                                        {u.lastLocation.city || 'Konum bilgisi yok'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {u.isOnline ? '🟢 Çevrimiçi' : '⚫ Çevrimdışı'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HiddenAdminScreen;

