import { useState, useEffect, useRef } from 'react';
import { getFirebaseDb, getFirebaseStorage } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Input, Avatar } from './ui';
import { cn } from '../lib/utils';
import { Send, Image as ImageIcon, ArrowLeft, Loader2, Smile, Edit, Trash2, Reply, MoreVertical, X, FileText, Download, Paperclip, Check, CheckCheck, Mic, MapPin, BarChart, Play, Pause, Camera, Plus, CheckSquare, Square } from 'lucide-react';
import { firebaseConfig } from '../firebaseConfig';
import EmojiPicker from 'emoji-picker-react';
import VoiceMessageRecorder from './VoiceMessageRecorder';
import LocationPicker from './LocationPicker';
import PollCreator from './PollCreator';
import { votePoll, getPollResults } from '../lib/pollUtils';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { handleError, ErrorCodes, AppError } from '../lib/errorHandler';
import { CallButton } from './CallButton';

const ChatScreen = ({ user, chat, onBack, onCallStart, onVideoCallStart }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedMessageForReaction, setSelectedMessageForReaction] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [messageMenuOpen, setMessageMenuOpen] = useState(null);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [playingVoice, setPlayingVoice] = useState(null);
    const [messageReactions, setMessageReactions] = useState({});
    const [selectedMessages, setSelectedMessages] = useState(new Set());
    const [selectionMode, setSelectionMode] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const fileMultiInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const audioRef = useRef(null);

    const db = getFirebaseDb();
    const storage = getFirebaseStorage();
    const chatId = [user.uid, chat.id].sort().join('_');

    // Messages listener
    useEffect(() => {
        const messagesRef = collection(db, `chats/${chatId}/messages`);
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            scrollToBottom();

            // Mark as read
            msgs.forEach(async (msg) => {
                if (msg.receiverId === user.uid && !msg.read) {
                    await updateDoc(doc(db, `chats/${chatId}/messages`, msg.id), {
                        read: true,
                        readAt: serverTimestamp()
                    });
                }
            });
        });

        return () => unsubscribe();
    }, [db, chatId, user.uid]);

    // Typing listener
    useEffect(() => {
        const typingRef = doc(db, `chats/${chatId}/typing`, chat.id);
        const unsubscribe = onSnapshot(typingRef, (doc) => {
            setOtherUserTyping(doc.exists() && doc.data()?.isTyping);
        });
        return () => unsubscribe();
    }, [db, chatId, chat.id]);

    // Reactions listener
    useEffect(() => {
        messages.forEach((msg) => {
            const reactionsRef = collection(db, `chats/${chatId}/messages/${msg.id}/reactions`);
            onSnapshot(reactionsRef, (snapshot) => {
                const reactions = {};
                snapshot.docs.forEach(doc => {
                    reactions[doc.id] = doc.data();
                });
                setMessageReactions(prev => ({
                    ...prev,
                    [msg.id]: reactions
                }));
            });
        });
    }, [messages, db, chatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = (text) => {
        setNewMessage(text);
        if (text.trim()) {
            setDoc(doc(db, `chats/${chatId}/typing`, user.uid), {
                isTyping: true,
                timestamp: serverTimestamp()
            });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                deleteDoc(doc(db, `chats/${chatId}/typing`, user.uid));
            }, 3000);
        } else {
            deleteDoc(doc(db, `chats/${chatId}/typing`, user.uid));
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            if (editingMessage) {
                await updateDoc(doc(db, `chats/${chatId}/messages`, editingMessage.id), {
                    text: newMessage,
                    edited: true,
                    editedAt: serverTimestamp()
                });
                setEditingMessage(null);
            } else {
                await addDoc(collection(db, `chats/${chatId}/messages`), {
                    text: newMessage,
                    senderId: user.uid,
                    receiverId: chat.id,
                    timestamp: serverTimestamp(),
                    type: 'text',
                    replyTo: replyingTo?.id || null,
                    sent: true,
                    delivered: false,
                    read: false
                });
                setReplyingTo(null);
            }
            setNewMessage('');
            deleteDoc(doc(db, `chats/${chatId}/typing`, user.uid)).catch(() => { });
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // File size check (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            const error = handleError(
                new AppError('Dosya çok büyük', ErrorCodes.FILE_TOO_LARGE),
                'handleFileUpload'
            );
            alert(error.userMessage);
            return;
        }

        setUploading(true);
        try {
            const storageRef = ref(storage, `chat-files/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            const fileType = file.type.startsWith('image/') ? 'image' :
                file.type.startsWith('video/') ? 'video' :
                    file.type.includes('pdf') ? 'pdf' : 'file';

            await addDoc(collection(db, `chats/${chatId}/messages`), {
                senderId: user.uid,
                receiverId: chat.id,
                timestamp: serverTimestamp(),
                type: fileType,
                fileURL: url,
                fileName: file.name,
                fileSize: file.size,
                text: file.name,
                sent: true,
                delivered: false,
                read: false
            });
        } catch (err) {
            const error = handleError(
                new AppError(err.message, ErrorCodes.UPLOAD_FAILED, { originalError: err }),
                'handleFileUpload'
            );
            alert(error.userMessage);
        } finally {
            setUploading(false);
        }
    };

    const takePicture = async () => {
        setUploading(true);
        try {
            const image = await CapacitorCamera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Prompt
            });

            const response = await fetch(image.webPath);
            const blob = await response.blob();

            const storageRef = ref(storage, `chat-images/${Date.now()}.jpg`);
            await uploadBytes(storageRef, blob);
            const url = await getDownloadURL(storageRef);

            await addDoc(collection(db, `chats/${chatId}/messages`), {
                senderId: user.uid,
                receiverId: chat.id,
                timestamp: serverTimestamp(),
                type: 'image',
                fileURL: url,
                fileName: 'photo.jpg',
                text: 'Fotoğraf',
                sent: true,
                delivered: false,
                read: false
            });
        } catch (error) {
            console.error('Camera error:', error);
            if (error.message !== 'User cancelled photos app') {
                const handledError = handleError(
                    new AppError(error.message, ErrorCodes.CAMERA_PERMISSION_DENIED, { originalError: error }),
                    'takePicture'
                );
                alert(handledError.userMessage);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleReaction = async (messageId, emoji) => {
        try {
            const reactionRef = doc(db, `chats/${chatId}/messages/${messageId}/reactions`, user.uid);
            await setDoc(reactionRef, {
                emoji,
                userId: user.uid,
                timestamp: serverTimestamp()
            });
            setSelectedMessageForReaction(null);
        } catch (err) {
            console.error("Error adding reaction:", err);
        }
    };

    const handleEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const toggleMessageSelection = (messageId) => {
        setSelectedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
            }
            if (newSet.size === 0) {
                setSelectionMode(false);
            }
            return newSet;
        });
    };

    const handleBulkDelete = async () => {
        if (selectedMessages.size === 0) return;
        
        if (!confirm(`${selectedMessages.size} mesajı silmek istediğinize emin misiniz?`)) return;

        try {
            const deletePromises = Array.from(selectedMessages).map(async (messageId) => {
                const messageDoc = doc(db, `chats/${chatId}/messages`, messageId);
                const messageData = messages.find(m => m.id === messageId);
                
                // Store deleted message in admin collection
                if (messageData) {
                    try {
                        await addDoc(collection(db, 'deletedMessages'), {
                            ...messageData,
                            deletedAt: serverTimestamp(),
                            deletedBy: user.uid,
                            chatId: chatId,
                            originalId: messageId
                        });
                    } catch (err) {
                        console.error('Error storing deleted message:', err);
                    }
                }
                
                return deleteDoc(messageDoc);
            });

            await Promise.all(deletePromises);
            setSelectedMessages(new Set());
            setSelectionMode(false);
        } catch (err) {
            console.error('Error deleting messages:', err);
            alert('Mesajlar silinirken bir hata oluştu');
        }
    };

    const selectAllMessages = () => {
        setSelectedMessages(new Set(messages.map(m => m.id)));
    };

    const clearSelection = () => {
        setSelectedMessages(new Set());
        setSelectionMode(false);
    };

    const renderMessageContent = (msg) => {
        switch (msg.type) {
            case 'voice':
                return (
                    <div className="flex items-center gap-3 min-w-[200px]">
                        <Button
                            onClick={() => {
                                if (playingVoice === msg.id) {
                                    audioRef.current?.pause();
                                    setPlayingVoice(null);
                                } else {
                                    if (audioRef.current) {
                                        audioRef.current.src = msg.fileURL;
                                        audioRef.current.play();
                                        setPlayingVoice(msg.id);
                                    }
                                }
                            }}
                            variant="ghost"
                            className="p-2 rounded-full"
                        >
                            {playingVoice === msg.id ? <Pause size={20} /> : <Play size={20} />}
                        </Button>
                        <div className="flex-1">
                            <div className="h-8 flex items-center gap-1">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="w-1 bg-white/40 rounded-full" style={{ height: `${Math.random() * 100}%` }} />
                                ))}
                            </div>
                        </div>
                        <span className="text-xs opacity-70">{msg.duration || '0:00'}</span>
                    </div>
                );

            case 'location':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-400">
                            <MapPin size={16} />
                            <span className="font-medium">Konum Paylaşıldı</span>
                        </div>
                        <a
                            href={`https://www.google.com/maps?q=${msg.location.latitude},${msg.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full h-32 bg-gray-700 rounded-lg relative overflow-hidden hover:opacity-90 transition-opacity"
                        >
                            <img
                                src={`https://maps.googleapis.com/maps/api/staticmap?center=${msg.location.latitude},${msg.location.longitude}&zoom=15&size=400x200&markers=color:red%7C${msg.location.latitude},${msg.location.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}`}
                                alt="Location"
                                className="w-full h-full object-cover"
                            />
                        </a>
                    </div>
                );

            case 'poll':
                return (
                    <div className="min-w-[250px]">
                        <div className="flex items-center gap-2 mb-3 text-yellow-400">
                            <BarChart size={16} />
                            <span className="font-medium">Anket</span>
                        </div>
                        <h3 className="font-semibold mb-3">{msg.question}</h3>
                        <div className="space-y-2">
                            {msg.options.map((option, index) => {
                                const results = getPollResults(msg);
                                const percentage = results.totalVotes > 0
                                    ? Math.round((results.counts[index] || 0) / results.totalVotes * 100)
                                    : 0;
                                const hasVoted = msg.votes?.[user.uid] === index;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => votePoll(db, `chats/${chatId}/messages`, msg.id, user.uid, index)}
                                        className="w-full relative h-10 rounded-lg overflow-hidden bg-black/20 hover:bg-black/30 transition-colors text-left"
                                    >
                                        <div
                                            className="absolute top-0 left-0 h-full bg-primary/30 transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-between px-3">
                                            <span className="truncate flex-1 mr-2">{option}</span>
                                            <div className="flex items-center gap-2 text-xs">
                                                {hasVoted && <Check size={12} className="text-green-400" />}
                                                <span>{percentage}%</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-2 text-xs opacity-60 text-right">
                            {Object.keys(msg.votes || {}).length} oy
                        </div>
                    </div>
                );

            case 'image':
                return (
                    <div className="relative group">
                        <img
                            src={msg.fileURL}
                            alt="Shared"
                            className="rounded-xl max-w-full max-h-80 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => window.open(msg.fileURL, '_blank')}
                        />
                        <a
                            href={msg.fileURL}
                            download
                            className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Download size={16} />
                        </a>
                    </div>
                );

            case 'video':
                return (
                    <video controls className="rounded-xl max-w-full max-h-80">
                        <source src={msg.fileURL} type="video/mp4" />
                        Tarayıcınız video etiketini desteklemiyor.
                    </video>
                );

            case 'pdf':
            case 'file':
                return (
                    <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl hover:bg-black/30 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{msg.fileName}</p>
                            <p className="text-xs opacity-70">{formatFileSize(msg.fileSize)}</p>
                        </div>
                        <a
                            href={msg.fileURL}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Download size={20} />
                        </a>
                    </div>
                );

            default:
                return <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>;
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/95">
            {/* Header */}
            <div className="p-3 bg-dark-surface border-b border-dark-border flex items-center justify-between shadow-sm z-10">
                {selectionMode ? (
                    <>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={clearSelection} className="text-gray-300 hover:text-white hover:bg-dark-bg rounded-full">
                                <X size={20} />
                            </Button>
                            <span className="font-semibold text-gray-100">
                                {selectedMessages.size} mesaj seçildi
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={selectAllMessages} className="text-gray-400 hover:text-white rounded-full" title="Tümünü seç">
                                <CheckSquare size={20} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleBulkDelete} className="text-red-400 hover:text-red-500 rounded-full" title="Sil">
                                <Trash2 size={20} />
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-300 hover:text-white hover:bg-dark-bg rounded-full">
                                <ArrowLeft size={20} />
                            </Button>

                            <div className="relative">
                                <Avatar
                                    src={chat.photoURL}
                                    fallback={chat.name ? chat.name[0] : '?'}
                                    className="w-10 h-10 ring-2 ring-dark-border"
                                />
                                {chat.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-surface"></div>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-100 text-sm">{chat.name}</span>
                                {otherUserTyping ? (
                                    <span className="text-xs text-green-400 font-medium animate-pulse">yazıyor...</span>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        {chat.isOnline ? 'Çevrimiçi' : chat.lastSeen ? `Son görülme: ${new Date(chat.lastSeen?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Çevrimdışı'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <CallButton onClick={onCallStart} onVideoCall={onVideoCallStart} />
                            <Button variant="ghost" size="icon" onClick={() => setSelectionMode(true)} className="text-gray-400 hover:text-white rounded-full" title="Mesaj seç">
                                <CheckSquare size={20} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white rounded-full">
                                <MoreVertical size={20} />
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-5">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user.uid;
                    const reactions = messageReactions[msg.id] || {};

                    const isSelected = selectedMessages.has(msg.id);

                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full group relative",
                                isMe ? "justify-end" : "justify-start",
                                isSelected && "bg-primary/10 rounded-lg p-1"
                            )}
                            onClick={() => selectionMode && toggleMessageSelection(msg.id)}
                        >
                            {selectionMode && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "w-6 h-6 rounded-full",
                                            isSelected ? "bg-primary text-white" : "bg-dark-surface text-gray-400"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMessageSelection(msg.id);
                                        }}
                                    >
                                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                    </Button>
                                </div>
                            )}
                            <div
                                className={cn(
                                    "max-w-[85%] rounded-2xl p-3 shadow-sm relative transition-all message-enter animate-slide-in-up",
                                    isMe
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-dark-surface text-gray-100 rounded-tl-none border border-dark-border",
                                    selectionMode && "ml-8",
                                    isSelected && "ring-2 ring-primary"
                                )}
                            >
                                {/* Reply Context */}
                                {msg.replyTo && (
                                    <div className="mb-2 p-2 rounded bg-black/20 text-xs border-l-2 border-white/50">
                                        <p className="opacity-70">Yanıtlanan mesaj</p>
                                    </div>
                                )}

                                {renderMessageContent(msg)}

                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="text-[10px] opacity-70">
                                        {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                        <span className="text-blue-300">
                                            {msg.read ? <CheckCheck size={14} /> : <Check size={14} />}
                                        </span>
                                    )}
                                </div>

                                {/* Reactions Display */}
                                {Object.keys(reactions).length > 0 && (
                                    <div className="absolute -bottom-3 right-0 bg-dark-surface border border-dark-border rounded-full px-2 py-0.5 text-xs shadow-sm flex items-center gap-1">
                                        {Object.values(reactions).slice(0, 3).map((r, i) => (
                                            <span key={i}>{r.emoji}</span>
                                        ))}
                                        {Object.keys(reactions).length > 1 && (
                                            <span className="text-gray-400 text-[10px]">{Object.keys(reactions).length}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-2 bg-dark-surface border-t border-dark-border">
                {/* Attachment Menu */}
                {showAttachmentMenu && (
                    <div className="absolute bottom-20 right-16 bg-dark-surface border border-dark-border rounded-xl shadow-2xl p-4 grid grid-cols-3 gap-4 animate-in slide-in-from-bottom-5 z-20 w-72">
                        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-2 hover:bg-dark-bg rounded-lg transition-colors">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                                <ImageIcon size={24} />
                            </div>
                            <span className="text-xs text-gray-300">Galeri</span>
                        </button>
                        <button onClick={takePicture} className="flex flex-col items-center gap-2 p-2 hover:bg-dark-bg rounded-lg transition-colors">
                            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500">
                                <Camera size={24} />
                            </div>
                            <span className="text-xs text-gray-300">Kamera</span>
                        </button>
                        <button onClick={() => fileMultiInputRef.current?.click()} className="flex flex-col items-center gap-2 p-2 hover:bg-dark-bg rounded-lg transition-colors">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <FileText size={24} />
                            </div>
                            <span className="text-xs text-gray-300">Belge</span>
                        </button>
                        <button onClick={() => setShowLocationPicker(true)} className="flex flex-col items-center gap-2 p-2 hover:bg-dark-bg rounded-lg transition-colors">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                <MapPin size={24} />
                            </div>
                            <span className="text-xs text-gray-300">Konum</span>
                        </button>
                        <button onClick={() => setShowPollCreator(true)} className="flex flex-col items-center gap-2 p-2 hover:bg-dark-bg rounded-lg transition-colors">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                                <BarChart size={24} />
                            </div>
                            <span className="text-xs text-gray-300">Anket</span>
                        </button>
                    </div>
                )}

                {/* Reply Preview */}
                {replyingTo && (
                    <div className="flex items-center justify-between bg-dark-bg p-2 rounded-lg mb-2 border-l-4 border-primary">
                        <div className="flex flex-col">
                            <span className="text-xs text-primary font-medium">Yanıtlanıyor</span>
                            <span className="text-sm truncate text-gray-400">{replyingTo.text || 'Medya'}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                            <X size={16} />
                        </Button>
                    </div>
                )}

                <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        className="text-gray-400 hover:text-white mb-1"
                    >
                        <Plus size={24} className={cn("transition-transform duration-200", showAttachmentMenu && "rotate-45")} />
                    </Button>

                    <div className="flex-1 bg-dark-bg rounded-2xl flex items-end p-2 border border-dark-border focus-within:border-primary/50 transition-colors">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-gray-400 hover:text-yellow-400 mb-0.5"
                        >
                            <Smile size={24} />
                        </Button>

                        <textarea
                            value={newMessage}
                            onChange={(e) => handleTyping(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Mesaj yazın..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-100 placeholder-gray-500 min-h-[40px] max-h-[120px] resize-none py-2 px-2 scrollbar-thin scrollbar-thumb-gray-700"
                            rows={1}
                            inputMode="text"
                            autoCapitalize="sentences"
                        />

                        {newMessage.trim() ? (
                            <Button
                                type="submit"
                                size="icon"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-10 h-10 mb-0.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                                disabled={uploading}
                            >
                                {uploading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="icon"
                                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                                className="text-gray-400 hover:text-white hover:bg-dark-surface rounded-full w-10 h-10 mb-0.5"
                            >
                                <Mic size={24} />
                            </Button>
                        )}
                    </div>
                </form>

                {/* Hidden Inputs */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                />
                <input
                    type="file"
                    ref={fileMultiInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleFileUpload}
                />

                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="absolute bottom-20 left-4 z-20">
                        <EmojiPicker
                            theme="dark"
                            onEmojiClick={handleEmojiClick}
                            lazyLoadEmojis={true}
                        />
                    </div>
                )}

                {/* Voice Recorder Modal */}
                {showVoiceRecorder && (
                    <VoiceMessageRecorder
                        onSend={async (audioBlob, duration) => {
                            setUploading(true);
                            try {
                                const storageRef = ref(storage, `voice-messages/${Date.now()}.webm`);
                                await uploadBytes(storageRef, audioBlob);
                                const url = await getDownloadURL(storageRef);

                                await addDoc(collection(db, `chats/${chatId}/messages`), {
                                    senderId: user.uid,
                                    receiverId: chat.id,
                                    timestamp: serverTimestamp(),
                                    type: 'voice',
                                    fileURL: url,
                                    duration: duration,
                                    sent: true,
                                    delivered: false,
                                    read: false
                                });
                            } catch (err) {
                                console.error("Error sending voice message:", err);
                            } finally {
                                setUploading(false);
                                setShowVoiceRecorder(false);
                            }
                        }}
                        onCancel={() => setShowVoiceRecorder(false)}
                    />
                )}

                {/* Location Picker Modal */}
                {showLocationPicker && (
                    <LocationPicker
                        onSend={async (location) => {
                            await addDoc(collection(db, `chats/${chatId}/messages`), {
                                senderId: user.uid,
                                receiverId: chat.id,
                                timestamp: serverTimestamp(),
                                type: 'location',
                                location: location,
                                text: 'Konum',
                                sent: true,
                                delivered: false,
                                read: false
                            });
                            setShowLocationPicker(false);
                            setShowAttachmentMenu(false);
                        }}
                        onCancel={() => setShowLocationPicker(false)}
                    />
                )}

                {/* Poll Creator Modal */}
                {showPollCreator && (
                    <PollCreator
                        onSend={async (pollData) => {
                            await addDoc(collection(db, `chats/${chatId}/messages`), {
                                senderId: user.uid,
                                receiverId: chat.id,
                                timestamp: serverTimestamp(),
                                type: 'poll',
                                ...pollData,
                                sent: true,
                                delivered: false,
                                read: false
                            });
                            setShowPollCreator(false);
                            setShowAttachmentMenu(false);
                        }}
                        onCancel={() => setShowPollCreator(false)}
                    />
                )}
            </div>

            <audio ref={audioRef} className="hidden" onEnded={() => setPlayingVoice(null)} />
        </div>
    );
};

export default ChatScreen;
