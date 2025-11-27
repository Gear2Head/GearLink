import { useState } from 'react';
import { ArrowLeft, Moon, Bell, Database, Accessibility, Info, Key, Lock, HelpCircle, User, Globe } from 'lucide-react';
import { Button, Avatar } from './ui';
import { getFirebaseAuth } from '../lib/firebase';

const SettingsScreen = ({ onBack, onProfileClick }) => {
    const [tapCount, setTapCount] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    const handleVersionTap = () => {
        const now = Date.now();

        if (now - lastTapTime > 2000) {
            setTapCount(1);
        } else {
            setTapCount(prev => prev + 1);
        }
        setLastTapTime(now);

        if (tapCount + 1 >= 5) {
            setTapCount(0);
            if (window.openAdminPanel) {
                window.openAdminPanel();
            }
        }
    };

    const SettingsItem = ({ icon: Icon, title, subtitle, onClick }) => (
        <div
            className="flex items-center gap-4 p-4 hover:bg-dark-hover cursor-pointer transition"
            onClick={onClick}
        >
            <div className="text-gray-400">
                <Icon size={24} />
            </div>
            <div className="flex-1">
                <h3 className="text-base font-normal text-gray-200">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-dark-bg text-white">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-dark-border bg-dark-surface">
                <Button variant="ghost" size="sm" onClick={onBack} className="p-2 rounded-full">
                    <ArrowLeft size={24} />
                </Button>
                <h2 className="text-xl font-medium">Ayarlar</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Profile Card */}
                <div
                    className="flex items-center gap-4 p-4 border-b border-dark-border cursor-pointer hover:bg-dark-hover transition"
                    onClick={onProfileClick}
                >
                    <Avatar
                        src={currentUser?.photoURL}
                        fallback={currentUser?.displayName?.[0]}
                        className="w-16 h-16"
                    />
                    <div className="flex-1">
                        <h3 className="text-xl font-medium">{currentUser?.displayName}</h3>
                        <p className="text-gray-400 text-sm">Müsait</p>
                    </div>
                </div>

                {/* Settings List */}
                <div className="py-2">
                    <SettingsItem
                        icon={Key}
                        title="Hesap"
                        subtitle="Güvenlik bildirimleri, numara değiştirme"
                    />
                    <SettingsItem
                        icon={Lock}
                        title="Gizlilik"
                        subtitle="Kişileri engelleme, süreli mesajlar"
                    />
                    <SettingsItem
                        icon={User}
                        title="Avatar"
                        subtitle="Oluştur, düzenle, profil fotoğrafı yap"
                    />
                    <SettingsItem
                        icon={Bell}
                        title="Bildirimler"
                        subtitle="Mesaj, grup ve arama sesleri"
                    />
                    <SettingsItem
                        icon={Database}
                        title="Depolama ve veriler"
                        subtitle="Ağ kullanımı, otomatik indirme"
                    />
                    <SettingsItem
                        icon={Globe}
                        title="Uygulama dili"
                        subtitle="Türkçe (cihaz dili)"
                    />
                    <SettingsItem
                        icon={HelpCircle}
                        title="Yardım"
                        subtitle="Yardım merkezi, bize ulaşın, gizlilik ilkesi"
                    />
                </div>

                {/* Footer / Version */}
                <div className="p-8 text-center">
                    <div className="flex flex-col items-center gap-1" onClick={handleVersionTap}>
                        <p className="text-sm text-gray-500">from</p>
                        <p className="text-sm font-bold text-white tracking-widest">GEARLINK</p>
                        <p className="text-xs text-gray-600 mt-4">Versiyon 1.0.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;
