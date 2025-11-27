import { useState, useRef, useEffect } from 'react';
import { X, GripVertical } from 'lucide-react';
import { Button } from './ui';
import AdminPanel from './AdminPanel';

const DraggableAdminPanel = ({ onClose, currentUser }) => {
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - 400, y: window.innerHeight / 2 - 300 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const panelRef = useRef(null);

    const handleMouseDown = (e) => {
        if (e.target.closest('.drag-handle')) {
            setIsDragging(true);
            const rect = panelRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <div
                ref={panelRef}
                className="absolute bg-dark-surface rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border border-dark-border flex flex-col pointer-events-auto"
                style={{
                    left: `${Math.max(0, Math.min(position.x, window.innerWidth - 600))}px`,
                    top: `${Math.max(0, Math.min(position.y, window.innerHeight - 400))}px`,
                    cursor: isDragging ? 'grabbing' : 'default'
                }}
            >
                <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-bg/50 drag-handle cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-2">
                        <GripVertical size={20} className="text-gray-400" />
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Admin Paneli
                        </h2>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="hover:bg-dark-hover">
                        <X size={20} />
                    </Button>
                </div>
                <div className="overflow-y-auto flex-1 p-4" onMouseDown={handleMouseDown}>
                    <AdminPanel currentUser={currentUser} />
                </div>
            </div>
        </div>
    );
};

export default DraggableAdminPanel;

