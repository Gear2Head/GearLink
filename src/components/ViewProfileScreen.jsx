import { useState } from 'react';
import { ArrowLeft, Phone, Video, Search, UserPlus, MoreVertical, ChevronRight } from 'lucide-react';
import { Button, Avatar } from './ui';

const ViewProfileScreen = ({ user, onBack }) => {
    const [isMuted, setIsMuted] = useState(false);

    return (
        <div className="h-screen flex flex-col bg-dark-bg text-white overflow-y-auto">
            {/* Header */}
            <div className="p-2 flex items-center justify-between sticky top-0 z-10 bg-dark-bg/90 backdrop-blur-sm">
                <Button variant="ghost" onClick={onBack} className="p-2 rounded-full">
                    <ArrowLeft size={24} />
                </Button>
                <Button variant="ghost" className="p-2 rounded-full">
                    <MoreVertical size={24} />
                </Button>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col items-center pt-2 pb-6">
                <Avatar
                    src={user.photoURL}
                    fallback={user.name?.[0]}
                    className="w-32 h-32 text-4xl mb-4 border-2 border-dark-bg shadow-xl"
                />
                <h2 className="text-2xl font-semibold mb-1">{user.name}</h2>
                <p className="text-gray-400 text-lg">
                    {user.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4 px-6 mb-6">
                <div className="flex flex-col items-center gap-2">
                    <Button
                        variant="outline"
                        className="w-12 h-12 rounded-xl border-gray-700 bg-dark-surface hover:bg-dark-hover flex items-center justify-center"
                        onClick={() => console.log('Voice call')}
                    >
                        <Phone size={24} className="text-green-500" />
                    </Button>
                    <span className="text-sm font-medium">Sesli</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Button
                        variant="outline"
                        className="w-12 h-12 rounded-xl border-gray-700 bg-dark-surface hover:bg-dark-hover flex items-center justify-center"
                        onClick={() => console.log('Video call')}
                    >
                        <Video size={24} className="text-green-500" />
                    </Button>
                    <span className="text-sm font-medium">Görüntülü</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Button
                        variant="outline"
                        className="w-12 h-12 rounded-xl border-gray-700 bg-dark-surface hover:bg-dark-hover flex items-center justify-center"
                        onClick={() => console.log('Search')}
                    >
                        <Search size={24} className="text-green-500" />
                    </Button>
                    <span className="text-sm font-medium">Ara</span>
                </div>
            </div>

            {/* Bio / Status */}
            <div className="bg-dark-surface mb-2 p-4">
                <h3 className="text-green-500 text-sm font-medium mb-1">Hakkında</h3>
                <p className="text-lg">{user.bio || "Müsait"}</p>
                <p className="text-gray-500 text-sm mt-1">14 Ekim 2024</p>
            </div>

            {/* Media, Links, Docs */}
            <div className="bg-dark-surface mb-2 p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 font-medium">Medya, bağlantı ve belgeler</span>
                    <div className="flex items-center text-gray-500 text-sm">
                        37 <ChevronRight size={16} />
                    </div>
                </div>

                {/* Media Strip */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-20 h-20 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                            {/* Placeholder images */}
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                🖼️
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-dark-surface mb-2">
                <div className="p-4 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="text-gray-400">🔔</div>
                        <span className="text-lg">Bildirimler</span>
                    </div>
                    <div className="text-gray-500 text-sm">Tümü</div>
                </div>
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-gray-400">🖼️</div>
                        <span className="text-lg">Medya görünürlüğü</span>
                    </div>
                </div>
            </div>

            {/* Encryption Info */}
            <div className="p-4 text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    🔒 Mesajlar ve aramalar uçtan uca şifrelidir.
                </p>
            </div>
        </div>
    );
};

export default ViewProfileScreen;
