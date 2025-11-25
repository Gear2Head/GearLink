import { useState, useEffect, useRef } from 'react';
import { getFirebaseAuth } from '../lib/firebase';
import { Button } from './ui';
import { ArrowLeft, Bell, MessageSquare, HardDrive, Eye, Palette, Volume2, Moon, Sun, Info, ChevronRight, Accessibility } from 'lucide-react';

const SettingsScreen = ({ user, onBack, onShowProfile, onVersionClick }) => {
    const [activeSection, setActiveSection] = useState('main');
    const [versionClickCount, setVersionClickCount] = useState(0);
    const versionClickTimeoutRef = useRef(null);
    const [settings, setSettings] = useState({
        notifications: {
            sound: true,
            vibration: true,
            preview: true
        },
        chat: {
            enterToSend: true,
            showReadReceipts: true,
            showOnlineStatus: true
        },
        storage: {
            autoDownload: true,
            mediaQuality: 'high'
        },
        accessibility: {
            contrast: 'normal',
            animationIntensity: 'normal',
            fontSize: 'medium'
        },
        theme: 'dark'
    });

    useEffect(() => {
        // Load saved settings from localStorage
        const saved = localStorage.getItem('gearlink_settings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error('Settings load error:', e);
            }
        }
    }, []);

    const saveSettings = (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem('gearlink_settings', JSON.stringify(updated));
    };

    const handleVersionClick = () => {
        setVersionClickCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 5 && onVersionClick) {
                onVersionClick();
                return 0;
            }
            if (versionClickTimeoutRef.current) {
                clearTimeout(versionClickTimeoutRef.current);
            }
            versionClickTimeoutRef.current = setTimeout(() => {
                setVersionClickCount(0);
            }, 1000);
            return newCount;
        });
    };

    return (
        <div className="h-screen flex flex-col bg-dark-bg text-white">
            <div className="p-4 bg-dark-surface border-b border-dark-border flex items-center gap-3">
                {activeSection !== 'main' && (
                    <Button variant="ghost" size="icon" onClick={() => setActiveSection('main')}>
                        <ArrowLeft size={20} />
                    </Button>
                )}
                <h1 className="text-xl font-semibold">Ayarlar</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {activeSection === 'main' && (
                    <div className="space-y-4">
                        {/* Settings Menu Items */}
                        <button 
                            onClick={() => setActiveSection('chat')} 
                            className="w-full bg-dark-surface rounded-lg p-4 flex items-center justify-between hover:bg-dark-hover transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <MessageSquare size={20} className="text-primary" />
                                <span>Sohbet Ayarları</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </button>
                        
                        <button 
                            onClick={() => setActiveSection('notifications')} 
                            className="w-full bg-dark-surface rounded-lg p-4 flex items-center justify-between hover:bg-dark-hover transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-primary" />
                                <span>Bildirim Ayarları</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </button>
                        
                        <button 
                            onClick={() => setActiveSection('storage')} 
                            className="w-full bg-dark-surface rounded-lg p-4 flex items-center justify-between hover:bg-dark-hover transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <HardDrive size={20} className="text-primary" />
                                <span>Depolama ve Veri</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </button>
                        
                        <button 
                            onClick={() => setActiveSection('accessibility')} 
                            className="w-full bg-dark-surface rounded-lg p-4 flex items-center justify-between hover:bg-dark-hover transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <Accessibility size={20} className="text-primary" />
                                <span>Erişilebilirlik</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </button>
                        
                        <button 
                            onClick={() => setActiveSection('about')} 
                            className="w-full bg-dark-surface rounded-lg p-4 flex items-center justify-between hover:bg-dark-hover transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <Info size={20} className="text-primary" />
                                <span>Uygulama Hakkında</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </button>
                    </div>
                )}

                {/* Chat Settings Section */}
                {activeSection === 'chat' && (
                    <div className="space-y-4">
                        <div className="bg-dark-surface rounded-lg p-4">
                            <h3 className="font-semibold mb-4">Sohbet Ayarları</h3>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between">
                                    <span>Enter ile gönder</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.chat.enterToSend}
                                        onChange={(e) => saveSettings({
                                            chat: { ...settings.chat, enterToSend: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded"
                                    />
                                </label>
                                <label className="flex items-center justify-between">
                                    <span>Okundu bilgisi göster</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.chat.showReadReceipts}
                                        onChange={(e) => saveSettings({
                                            chat: { ...settings.chat, showReadReceipts: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded"
                                    />
                                </label>
                                <label className="flex items-center justify-between">
                                    <span>Çevrimiçi durumu göster</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.chat.showOnlineStatus}
                                        onChange={(e) => saveSettings({
                                            chat: { ...settings.chat, showOnlineStatus: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Settings Section */}
                {activeSection === 'notifications' && (
                    <div className="space-y-4">
                        <div className="bg-dark-surface rounded-lg p-4">
                            <h3 className="font-semibold mb-4">Bildirim Ayarları</h3>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between">
                                    <span>Ses</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.sound}
                                        onChange={(e) => saveSettings({
                                            notifications: { ...settings.notifications, sound: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded"
                                    />
                                </label>
                                <label className="flex items-center justify-between">
                                    <span>Titreşim</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.vibration}
                                        onChange={(e) => saveSettings({
                                            notifications: { ...settings.notifications, vibration: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded"
                                    />
                                </label>
                                <label className="flex items-center justify-between">
                                    <span>Önizleme</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.preview}
                                        onChange={(e) => saveSettings({
                                            notifications: { ...settings.notifications, preview: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Storage Settings Section */}
                {activeSection === 'storage' && (
                    <div className="space-y-4">
                        <div className="bg-dark-surface rounded-lg p-4">
                            <h3 className="font-semibold mb-4">Depolama ve Veri</h3>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between">
                                    <span>Otomatik indirme</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.storage.autoDownload}
                                        onChange={(e) => saveSettings({
                                            storage: { ...settings.storage, autoDownload: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded"
                                    />
                                </label>
                                <div className="flex items-center justify-between">
                                    <span>Medya kalitesi</span>
                                    <select
                                        value={settings.storage.mediaQuality}
                                        onChange={(e) => saveSettings({
                                            storage: { ...settings.storage, mediaQuality: e.target.value }
                                        })}
                                        className="bg-dark-bg border border-dark-border rounded px-3 py-1 text-white"
                                    >
                                        <option value="low">Düşük</option>
                                        <option value="medium">Orta</option>
                                        <option value="high">Yüksek</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Accessibility Settings Section */}
                {activeSection === 'accessibility' && (
                    <div className="space-y-4">
                        <div className="bg-dark-surface rounded-lg p-4">
                            <h3 className="font-semibold mb-4">Erişilebilirlik</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span>Kontrast</span>
                                    <select
                                        value={settings.accessibility.contrast}
                                        onChange={(e) => saveSettings({
                                            accessibility: { ...settings.accessibility, contrast: e.target.value }
                                        })}
                                        className="bg-dark-bg border border-dark-border rounded px-3 py-1 text-white"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="high">Yüksek</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Animasyon yoğunluğu</span>
                                    <select
                                        value={settings.accessibility.animationIntensity}
                                        onChange={(e) => saveSettings({
                                            accessibility: { ...settings.accessibility, animationIntensity: e.target.value }
                                        })}
                                        className="bg-dark-bg border border-dark-border rounded px-3 py-1 text-white"
                                    >
                                        <option value="low">Düşük</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">Yüksek</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Yazı boyutu</span>
                                    <select
                                        value={settings.accessibility.fontSize}
                                        onChange={(e) => saveSettings({
                                            accessibility: { ...settings.accessibility, fontSize: e.target.value }
                                        })}
                                        className="bg-dark-bg border border-dark-border rounded px-3 py-1 text-white"
                                    >
                                        <option value="small">Küçük</option>
                                        <option value="medium">Orta</option>
                                        <option value="large">Büyük</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* About Section */}
                {activeSection === 'about' && (
                    <div className="space-y-4">
                        <div className="bg-dark-surface rounded-lg p-4 text-center">
                            <h3 className="font-semibold mb-4">Uygulama Hakkında</h3>
                            <p className="text-gray-400 mb-2">GearLink</p>
                            <p className="text-gray-400 mb-4">Çapraz Platform Mesajlaşma Uygulaması</p>
                            <p 
                                className="text-sm text-gray-400 cursor-pointer select-none hover:text-primary transition-colors"
                                onClick={handleVersionClick}
                            >
                                Sürüm 1.0.0
                            </p>
                            <p className="text-xs text-gray-500 mt-4">© 2024 Tüm Hakları Saklıdır.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsScreen;
