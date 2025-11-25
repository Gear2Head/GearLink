import React from 'react';
import { Phone, Video } from 'lucide-react';
import { Button } from './ui';

export const CallButton = ({ onClick, onVideoCall, disabled }) => {
    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                onClick={onClick}
                disabled={disabled}
                className="rounded-full w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-dark-surface"
                title="Sesli Arama"
            >
                <Phone size={20} />
            </Button>
            {onVideoCall && (
                <Button
                    variant="ghost"
                    onClick={onVideoCall}
                    disabled={disabled}
                    className="rounded-full w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-dark-surface"
                    title="Görüntülü Arama"
                >
                    <Video size={20} />
                </Button>
            )}
        </div>
    );
};
