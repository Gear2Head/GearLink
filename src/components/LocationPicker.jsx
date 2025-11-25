import React, { useState } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { Button } from './ui';
import { getCurrentPosition, getGoogleMapsUrl, formatCoordinates } from '../lib/locationService';

const LocationPicker = ({ onSend, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);

    const handleGetLocation = async () => {
        setLoading(true);
        try {
            const position = await getCurrentPosition();
            setLocation(position);
        } catch (error) {
            console.error('Location error:', error);
            alert(error.message || 'Konum alınamadı. Lütfen GPS izni verin.');
        }
        setLoading(false);
    };

    const handleSend = () => {
        if (location) {
            onSend({
                type: 'location',
                latitude: location.latitude,
                longitude: location.longitude,
                mapUrl: getGoogleMapsUrl(location.latitude, location.longitude)
            });
        }
    };

    return (
        <div className="p-4 bg-dark-surface border-t border-dark-border">
            <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <MapPin size={20} />
                    Konum Paylaş
                </h3>

                {!location ? (
                    <Button
                        onClick={handleGetLocation}
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" size={20} />
                                Konum Alınıyor...
                            </>
                        ) : (
                            <>
                                <Navigation className="mr-2" size={20} />
                                Şu Anki Konumum
                            </>
                        )}
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <div className="p-3 bg-dark-bg rounded-lg">
                            <p className="text-sm text-gray-400">Konum</p>
                            <p className="font-mono text-sm">{formatCoordinates(location.latitude, location.longitude)}</p>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={onCancel} variant="ghost" className="flex-1">
                                İptal
                            </Button>
                            <Button onClick={handleSend} className="flex-1 bg-success hover:bg-success/90">
                                Gönder
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationPicker;
