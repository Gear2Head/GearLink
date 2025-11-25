import { useState } from 'react';
import { Button } from './ui';
import { initializeFirebase } from '../lib/firebase';
import { Settings, AlertCircle } from 'lucide-react';

const SetupScreen = ({ onSetupComplete }) => {
    const [configJson, setConfigJson] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSetup = () => {
        setLoading(true);
        setError('');

        try {
            const config = JSON.parse(configJson);

            // Basic validation
            if (!config.apiKey || !config.authDomain || !config.projectId) {
                throw new Error("Geçersiz yapılandırma: apiKey, authDomain ve projectId gereklidir.");
            }

            const success = initializeFirebase(config);
            if (success) {
                // Save to localStorage
                localStorage.setItem('gearlink_firebase_config', JSON.stringify(config));
                onSetupComplete();
            } else {
                throw new Error("Firebase başlatılamadı. Yapılandırmayı kontrol edin.");
            }
        } catch (err) {
            setError(err.message || "Geçersiz JSON formatı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg">
            <div className="w-full max-w-lg bg-dark-surface border border-dark-border p-8 rounded-3xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                        <Settings size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Sistem Kurulumu</h1>
                    <p className="text-gray-400">Devam etmek için Firebase yapılandırmanızı girin.</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-dark-bg/50 p-4 rounded-xl border border-dark-border text-sm text-gray-400">
                        <p className="mb-2 font-semibold text-gray-300">Nasıl Yapılır?</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Firebase Konsolu&apos;na gidin.</li>
                            <li>Proje Ayarları {'>'} Genel sekmesini açın.</li>
                            <li>&quot;SDK setup and configuration&quot; altındaki Config objesini kopyalayın.</li>
                            <li>Aşağıdaki alana yapıştırın.</li>
                        </ol>
                    </div>

                    <textarea
                        className="w-full h-48 bg-dark-bg border border-dark-border rounded-xl p-4 text-sm font-mono text-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                        placeholder='{ "apiKey": "...", "authDomain": "...", ... }'
                        value={configJson}
                        onChange={(e) => setConfigJson(e.target.value)}
                    />

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <Button onClick={handleSetup} className="w-full" disabled={loading || !configJson.trim()}>
                        {loading ? 'Yapılandırılıyor...' : 'Kurulumu Tamamla'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SetupScreen;
