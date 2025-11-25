// GIF Picker Component - Tenor API Integration
import { useState, useEffect } from 'react';
import { Button, Input } from './ui';
import { X, Search, TrendingUp } from 'lucide-react';

const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY || 'AIzaSyAq3OTb9fv-PZb2gOdQPTqCGWNxRBPbHPQ'; // Demo key
const TENOR_ENDPOINT = 'https://tenor.googleapis.com/v2/search';
const TENOR_FEATURED = 'https://tenor.googleapis.com/v2/featured';

const GifPicker = ({ onSelect, onClose }) => {
    const [gifs, setGifs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('trending'); // trending or search

    useEffect(() => {
        loadFeaturedGifs();
    }, []);

    const loadFeaturedGifs = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${TENOR_FEATURED}?key=${TENOR_API_KEY}&limit=20&locale=tr_TR`
            );
            const data = await response.json();
            setGifs(data.results || []);
        } catch (error) {
            console.error('Tenor API error:', error);
        }
        setLoading(false);
    };

    const searchGifs = async (query) => {
        if (!query.trim()) {
            loadFeaturedGifs();
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${TENOR_ENDPOINT}?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=20&locale=tr_TR`
            );
            const data = await response.json();
            setGifs(data.results || []);
            setActiveTab('search');
        } catch (error) {
            console.error('Tenor search error:', error);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchGifs(searchQuery);
    };

    const handleGifClick = (gif) => {
        // Tenor GIF URL'i al (medium quality)
        const gifUrl = gif.media_formats?.gif?.url || gif.media_formats?.tinygif?.url;
        if (gifUrl) {
            onSelect(gifUrl);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-surface rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-dark-border flex items-center justify-between">
                    <h2 className="text-lg font-semibold">GIF Seç</h2>
                    <Button variant="ghost" onClick={onClose} className="rounded-full w-8 h-8 p-0">
                        <X size={20} />
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-dark-border">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="GIF ara..."
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" className="bg-primary">
                            Ara
                        </Button>
                    </form>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-dark-border">
                    <button
                        onClick={() => { setActiveTab('trending'); loadFeaturedGifs(); }}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'trending' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                    >
                        <TrendingUp size={16} className="inline mr-2" />
                        Popüler
                    </button>
                    {searchQuery && (
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'search' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                        >
                            <Search size={16} className="inline mr-2" />
                            Arama
                        </button>
                    )}
                </div>

                {/* GIF Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Yükleniyor...</div>
                    ) : gifs.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">GIF bulunamadı</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {gifs.map((gif) => (
                                <button
                                    key={gif.id}
                                    onClick={() => handleGifClick(gif)}
                                    className="relative aspect-square bg-dark-bg rounded-lg overflow-hidden hover:opacity-80 transition"
                                >
                                    <img
                                        src={gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url}
                                        alt={gif.content_description || 'GIF'}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Powered by Tenor */}
                <div className="p-2 text-center text-xs text-gray-500 border-t border-dark-border">
                    Powered by Tenor
                </div>
            </div>
        </div>
    );
};

export default GifPicker;
