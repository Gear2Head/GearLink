import { ArrowLeft } from 'lucide-react';
import { Button } from './ui';

const SettingsScreen = ({ onBack }) => {
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
                {/* About Section */}
                <div className="p-4 border-b border-dark-border">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Hakkında</h3>
                    <div className="bg-dark-surface rounded-lg p-4">
                        <p className="text-sm text-gray-300 mb-2">GearLink</p>
                        <p className="text-xs text-gray-500">Versiyon 1.0.0</p>
                    </div>
                </div>

                {/* Placeholder for future settings */}
                <div className="p-4">
                    <p className="text-sm text-gray-500 text-center">
                        Daha fazla ayar yakında eklenecek...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;
