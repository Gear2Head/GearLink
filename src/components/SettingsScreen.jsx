import { useState, useEffect } from 'react';
import { getFirebaseAuth } from '../lib/firebase';
import { Button } from './ui';
import { ArrowLeft, Bell, MessageSquare, HardDrive, Eye, Palette, Volume2, Moon, Sun } from 'lucide-react';

const SettingsScreen = ({ user, onBack, onShowProfile, onVersionClick }) => {
    const [activeSection, setActiveSection] = useState('main');
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

    const MainSettings = () => (
        <div className="space-y-4">
            <div className="bg-dark-surface rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare size={20} />
                    Sohbet Ayarları
                </h3>
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

            <div className="bg-dark-surface rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Bell size={20} />
                    Bildirim Ayarları
                </h3>
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
                        <span>Mesaj önizlemesi</span>
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

            <div className="bg-dark-surface rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <HardDrive size={20} />
                    Depolama ve Veri
                </h3>
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
                            className="bg-dark-bg border border-dark-border rounded px-3 py-1"
                        >
                            <option value="low">Düşük</option>
                            <option value="medium">Orta</option>
                            <option value="high">Yüksek</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-dark-surface rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Eye size={20} />
                    Erişilebilirlik
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span>Kontrast</span>
                        <select
                            value={settings.accessibility.contrast}
                            onChange={(e) => saveSettings({
                                accessibility: { ...settings.accessibility, contrast: e.target.value }
                            })}
                            className="bg-dark-bg border border-dark-border rounded px-3 py-1"
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
                            className="bg-dark-bg border border-dark-border rounded px-3 py-1"
                        >
                            <option value="none">Yok</option>
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
                            className="bg-dark-bg border border-dark-border rounded px-3 py-1"
                        >
                            <option value="small">Küçük</option>
                            <option value="medium">Orta</option>
                            <option value="large">Büyük</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-dark-surface rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Palette size={20} />
                    Tema
                </h3>
                <div className="flex gap-2">
                    <Button
                        variant={settings.theme === 'dark' ? 'default' : 'outline'}
                        onClick={() => saveSettings({ theme: 'dark' })}
                        className="flex-1"
                    >
                        <Moon size={18} className="mr-2" />
                        Koyu
                    </Button>
                    <Button
                        variant={settings.theme === 'light' ? 'default' : 'outline'}
                        onClick={() => saveSettings({ theme: 'light' })}
                        className="flex-1"
                    >
                        <Sun size={18} className="mr-2" />
                        Açık
                    </Button>
                </div>
            </div>

            {/* Version - Hidden Admin Access */}
            <div className="bg-dark-surface rounded-lg p-4">
                <div className="text-center">
                    <p className="text-sm text-gray-400">Sürüm 1.0.0</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-dark-bg">
            <div className="p-4 bg-dark-surface border-b border-dark-border flex items-center gap-3">
                {activeSection !== 'main' && (
                    <Button variant="ghost" size="icon" onClick={() => setActiveSection('main')}>
                        <ArrowLeft size={20} />
                    </Button>
                )}
                <h1 className="text-xl font-semibold">Ayarlar</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {activeSection === 'main' && <MainSettings />}
            </div>
        </div>
    );
};

export default SettingsScreen;

