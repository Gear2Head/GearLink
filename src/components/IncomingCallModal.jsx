import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { Button, Avatar } from './ui';

export const IncomingCallModal = ({ caller, onAccept, onReject }) => {
    if (!caller) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-surface p-8 rounded-2xl text-center max-w-sm w-full shadow-2xl border border-dark-border">
                <div className="mb-6 relative inline-block">
                    <Avatar
                        src={caller.photoURL}
                        fallback={caller.name ? caller.name[0] : '?'}
                        className="w-24 h-24 mx-auto ring-4 ring-dark-bg"
                    />
                    <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-dark-surface animate-pulse"></div>
                </div>

                <h2 className="text-2xl font-semibold mb-2 text-white">{caller.name || 'Bilinmeyen Numara'}</h2>
                <p className="text-gray-400 mb-8 flex items-center justify-center gap-2">
                    <Phone size={16} className="animate-bounce" />
                    Sesli arama geliyor...
                </p>

                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={onReject}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full py-4 transition-transform active:scale-95"
                    >
                        <PhoneOff size={24} />
                    </Button>
                    <Button
                        onClick={onAccept}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-full py-4 transition-transform active:scale-95 animate-pulse"
                    >
                        <Phone size={24} />
                    </Button>
                </div>
                <div className="flex justify-between px-2 mt-2 text-xs text-gray-500 font-medium">
                    <span>Reddet</span>
                    <span>Cevapla</span>
                </div>
            </div>
        </div>
    );
};
