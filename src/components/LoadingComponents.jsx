import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Yükleniyor...' }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-dark-bg">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-400">{text}</p>
    </div>
);

export const LoadingOverlay = ({ text = 'İşleniyor...' }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-dark-surface p-6 rounded-2xl shadow-xl flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
            <p className="text-white font-medium">{text}</p>
        </div>
    </div>
);

export const InlineLoader = ({ size = 16, className = '' }) => (
    <Loader2 size={size} className={`animate-spin ${className}`} />
);
