import { useState } from 'react';
import { ArrowLeft, Moon, Bell, Database, Accessibility, Info } from 'lucide-react';
import { Button } from './ui';

const SettingsScreen = ({ onBack }) => {
    const [tapCount, setTapCount] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);

    const handleVersionTap = () => {
        const now = Date.now();

        // Reset if more than 2 seconds between taps
        if (now - lastTapTime > 2000) {
            setTapCount(1);
        } else {
            setTapCount(prev => prev + 1);
        }

        setLastTapTime(now);

        // Open admin panel after 5 taps
        if (tapCount + 1 >= 5) {
            setTapCount(0);
            if (window.openAdminPanel) {
                window.openAdminPanel();
            }
        }
    };

    return (
        <div className="h-screen flex flex-col bg-dark-bg">
            {/* Header */}
            <div className="p-4 bg-dark-surface border-b border-dark-border">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                        <ArrowLeft size={20} />
                    </Button>
                    <h2 className="text-lg font-semibold">Ayarlar</h2>
                </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Theme Settings */}
                <div className="p-4 border-b border-dark-border">
                    <div className="flex items-center gap-3 mb-3">
                        <Moon size={20} className="text-primary" />
                        <h3 className="text-sm font-semibold">Tema</h3>
                    </div>
                    <div className="bg-dark-surface rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Koyu Tema</span>
                            <div className="w-12 h-6 bg-primary rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="p-4 border-b border-dark-border">
                    <div className="flex items-center gap-3 mb-3">
                        <Bell size={20} className="text-primary" />
                        <h3 className="text-sm font-semibold">Bildirimler</h3>
                    </div>
                    <div className="bg-dark-surface rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Bildirim Sesi</span>
                            <div className="w-12 h-6 bg-primary rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Titreşim</span>
                            <div className="w-12 h-6 bg-primary rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Storage Settings */}
                <div className="p-4 border-b border-dark-border">
                    <div className="flex items-center gap-3 mb-3">
                        <Database size={20} className="text-primary" />
                        <h3 className="text-sm font-semibold">Depolama</h3>
                    </div>
                    <div className="bg-dark-surface rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Otomatik İndirme</span>
                            <div className="w-12 h-6 bg-gray-600 rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accessibility */}
                <div className="p-4 border-b border-dark-border">
                    <div className="flex items-center gap-3 mb-3">
                        <Accessibility size={20} className="text-primary" />
                        <h3 className="text-sm font-semibold">Erişilebilirlik</h3>
                    </div>
                    <div className="bg-dark-surface rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Büyük Yazı</span>
                            <div className="w-12 h-6 bg-gray-600 rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section - Tap 5 times for admin */}
                <div className="p-4 border-b border-dark-border">
                    <div className="flex items-center gap-3 mb-3">
                        <Info size={20} className="text-primary" />
                        <h3 className="text-sm font-semibold">Hakkında</h3>
                    </div>
                    <div
                        className="bg-dark-surface rounded-lg p-4 cursor-pointer active:bg-dark-hover transition"
                        onClick={handleVersionTap}
                    >
                        <p className="text-sm text-gray-300 mb-2">GearLink</p>
                        <p className="text-xs text-gray-500">
                            Versiyon 1.0.0
                            {tapCount > 0 && tapCount < 5 && (
                                <span className="ml-2 text-primary">({tapCount}/5)</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;

