import { useState, useEffect, useRef } from 'react';
import { getFirebaseDb, getFirebaseStorage } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Input, Avatar } from './ui';
import { cn } from '../lib/utils';
import { Send, Image as ImageIcon, ArrowLeft, Loader2, Smile, Edit, Trash2, Reply, MoreVertical, X, FileText, Download, Paperclip, Check, CheckCheck, Mic, MapPin, BarChart, Play, Pause, Camera, Plus, Phone, Video } from 'lucide-react';
import { firebaseConfig } from '../firebaseConfig';
import EmojiPicker from 'emoji-picker-react';
import VoiceMessageRecorder from './VoiceMessageRecorder';
import LocationPicker from './LocationPicker';
import PollCreator from './PollCreator';
import { votePoll, getPollResults } from '../lib/pollUtils';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { handleError, ErrorCodes, AppError } from '../lib/errorHandler';

const ChatScreen = ({ user, chat, onBack }) => {
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
                                        audioRef.current.src = msg.url;
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
                        <div className="flex items-center gap-2 text-primary">
                            <MapPin size={20} />
                            <span className="font-medium">Konum Paylaşıldı</span>
                        </div>
                        <a
                            href={`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-dark-bg/30 rounded-lg p-2 hover:bg-dark-bg/50 transition"
                        >
                            <p className="text-sm">Haritada Görüntüle →</p>
                            <p className="text-xs opacity-60 mt-1">
                                {msg.latitude.toFixed(6)}, {msg.longitude.toFixed(6)}
                            </p>
                        </a>
                    </div>
                );

            case 'poll':
                const userVoted = msg.poll?.voters?.includes(user.uid);
                const results = msg.poll ? getPollResults(msg.poll) : [];

                return (
                    <div className="space-y-3 min-w-[250px]">
                        <p className="font-medium text-lg">{msg.poll?.question}</p>
                        <div className="space-y-2">
                            {msg.poll?.options.map((opt, index) => {
                                const result = results[index] || { votes: 0, percentage: 0 };
                                const userVotedThis = msg.poll?.voters?.some(v =>
                                    msg.poll.votes?.[v] === index
                                );

                                return (
                                    <button
                                        key={index}
                                        onClick={async () => {
                                            if (!userVoted) {
                                                const updatedPoll = votePoll(msg.poll, index, user.uid);
                                                await updateDoc(doc(db, `chats/${chatId}/messages`, msg.id), {
                                                    poll: updatedPoll
                                                });
                                            }
                                        }}
                                        disabled={userVoted}
                                        className={cn(
                                            "w-full text-left p-2 rounded-lg transition-all relative overflow-hidden",
                                            userVotedThis ? "bg-primary/30 ring-2 ring-primary" : "bg-white/10 hover:bg-white/20",
                                            userVoted && "cursor-default"
                                        )}
                                    >
                                        <div
                                            className="absolute inset-0 bg-primary/20 transition-all"
                                            style={{ width: `${result.percentage}%` }}
                                        />
                                        <div className="relative flex items-center justify-between">
                                            <span className="text-sm">{opt.text}</span>
                                            <span className="text-xs opacity-70">
                                                {userVoted ? `${result.percentage}% (${result.votes})` : ''}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs opacity-60 text-center">
                            {msg.poll.totalVotes || 0} oy
                        </p>
                    </div>
                );

            case 'image':
                return <img src={msg.fileURL} alt="Shared" className="rounded-xl max-w-full" onLoad={scrollToBottom} />;

            case 'video':
                return <video src={msg.fileURL} controls className="rounded-xl max-w-full" />;

            case 'pdf':
            case 'file':
                return (
                    <div className="flex items-center gap-3 p-3 bg-dark-bg/50 rounded-xl">
                        <FileText size={32} className="text-primary" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{msg.fileName}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(msg.fileSize)}</p>
                        </div>
                        <a href={msg.fileURL} download={msg.fileName} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" className="p-2">
                                <Download size={20} />
                            </Button>
                        </a>
                    </div>
                );

            default:
                return <p>{msg.text}</p>;
        }
    };

    return (
        <div className="h-screen flex flex-col bg-dark-bg max-w-4xl mx-auto border-x border-dark-border">
            {/* Header */}
            <div className="p-4 border-b border-dark-border flex items-center gap-4 bg-dark-bg/80 backdrop-blur-md sticky top-0 z-10">
                <Button variant="ghost" onClick={onBack} className="px-2">
                    <ArrowLeft size={20} />
                </Button>
                <div
                    className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-dark-hover/30 rounded-lg p-1 -m-1 transition"
                    onClick={() => {
                        const info = `İsim: ${chat.name}\nDurum: ${chat.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}\nID: ${chat.id}`;
                        alert(info);
                    }}
                >
                    <Avatar fallback={chat.name[0]} src={chat.photoURL} className="w-8 h-8 bg-gradient-to-br from-primary to-secondary" />
                    <div className="flex-1">
                        <h2 className="font-semibold text-sm">{chat.name}</h2>
                        {otherUserTyping ? (
                            <span className="text-xs text-primary flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                                yazıyor
                            </span>
                        ) : chat.isOnline ? (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Çevrimiçi
                            </span>
                        ) : (
                            <span className="text-xs text-gray-400">Çevrimdışı</span>
                        )}
                    </div>
                </div>
                {/* Call Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        className="p-2 rounded-full hover:bg-dark-hover"
                        onClick={() => console.log('Voice call:', chat.name)}
                        title="Sesli Arama"
                    >
                        <Phone size={20} />
                    </Button>
                    <Button
                        variant="ghost"
                        className="p-2 rounded-full hover:bg-dark-hover"
                        onClick={() => console.log('Video call:', chat.name)}
                        title="Görüntülü Arama"
                    >
                        <Video size={20} />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user.uid;
                    const replyToMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
                    const reactions = messageReactions[msg.id] || {};

                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full",
                                isMe ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[75%] sm:max-w-[85%] rounded-2xl p-3 break-words relative group shadow-md",
                                    isMe
                                        ? "bg-message-sent text-white rounded-tr-sm"
                                        : "bg-message-received text-gray-100 rounded-tl-sm"
                                )}
                            >
                                {/* Reply preview */}
                                {replyToMsg && (
                                    <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/30 text-xs">
                                        <p className="font-semibold opacity-70">
                                            {replyToMsg.senderId === user.uid ? 'Siz' : chat.name}
                                        </p>
                                        <p className="opacity-60 truncate">{replyToMsg.text || '📎 Dosya'}</p>
                                    </div>
                                )}

                                {renderMessageContent(msg)}

                                <div className="flex items-center justify-between mt-1.5 gap-2">
                                    <span className="text-[10px] opacity-80 inline-flex items-center gap-1.5">
                                        {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.edited && <span className="text-[9px]">(düzenlendi)</span>}
                                    </span>
                                    {isMe && (
                                        <span className="inline-flex items-center">
                                            {msg.read ? (
                                                <CheckCheck size={16} className="text-blue-300" strokeWidth={2.5} />
                                            ) : msg.delivered ? (
                                                <CheckCheck size={16} className="text-white/60" strokeWidth={2} />
                                            ) : (
                                                <Check size={16} className="text-white/60" strokeWidth={2} />
                                            )}
                                        </span>
                                    )}
                                </div>

                                {/* Message menu */}
                                {isMe && (
                                    <button
                                        onClick={() => setMessageMenuOpen(messageMenuOpen === msg.id ? null : msg.id)}
                                        className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-surface rounded-full p-1 shadow-lg"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                )}

                                {messageMenuOpen === msg.id && (
                                    <div className="absolute top-full right-0 mt-2 bg-dark-surface border border-dark-border rounded-xl shadow-xl z-20 overflow-hidden">
                                        {msg.type === 'text' && (
                                            <button
                                                onClick={() => {
                                                    setEditingMessage(msg);
                                                    setNewMessage(msg.text);
                                                    setMessageMenuOpen(null);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-dark-border w-full text-left text-sm"
                                            >
                                                <Edit size={16} />
                                                Düzenle
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setReplyingTo(msg);
                                                setMessageMenuOpen(null);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-dark-border w-full text-left text-sm"
                                        >
                                            <Reply size={16} />
                                            Yanıtla
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Mesajı silmek istediğinizden emin misiniz?')) {
                                                    try {
                                                        await deleteDoc(doc(db, `chats/${chatId}/messages`, msg.id));
                                                        setMessageMenuOpen(null);
                                                    } catch (err) {
                                                        console.error("Error deleting message:", err);
                                                    }
                                                }
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/20 text-red-400 w-full text-left text-sm"
                                        >
                                            <Trash2 size={16} />
                                            Sil
                                        </button>
                                    </div>
                                )}

                                {/* Reaction button */}
                                <button
                                    onClick={() => setSelectedMessageForReaction(selectedMessageForReaction === msg.id ? null : msg.id)}
                                    className="absolute -top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-surface rounded-full p-1 shadow-lg"
                                >
                                    <Smile size={16} />
                                </button>

                                {/* Reaction picker */}
                                {selectedMessageForReaction === msg.id && (
                                    <div className="absolute top-full mt-2 bg-dark-surface border border-dark-border rounded-xl p-2 shadow-xl flex gap-2 z-20">
                                        {['❤️', '👍', '😂', '😮', '😢', '🔥'].map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => handleReaction(msg.id, emoji)}
                                                className="hover:scale-125 transition-transform text-xl"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Display reactions */}
                                {Object.keys(reactions).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {Object.entries(reactions).map(([userId, reactionData]) => (
                                            <span
                                                key={userId}
                                                className="inline-flex items-center bg-dark-bg/50 rounded-full px-2 py-0.5 text-sm"
                                            >
                                                {reactionData.emoji}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply preview */}
            {replyingTo && (
                <div className="px-4 py-2 bg-dark-surface/50 flex items-center gap-2 border-t border-dark-border">
                    <Reply size={16} className="text-primary" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{replyingTo.senderId === user.uid ? 'Siz' : chat.name}</p>
                        <p className="text-xs text-gray-400 truncate">{replyingTo.text || '📎 Dosya'}</p>
                    </div>
                    <Button variant="ghost" onClick={() => setReplyingTo(null)} className="p-1">
                        <X size={16} />
                    </Button>
                </div>
            )}

            {/* Edit preview */}
            {editingMessage && (
                <div className="px-4 py-2 bg-yellow-500/10 flex items-center gap-2 border-t border-yellow-500/30">
                    <Edit size={16} className="text-yellow-500" />
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-yellow-500">Düzenleniyor</p>
                    </div>
                    <Button variant="ghost" onClick={() => { setEditingMessage(null); setNewMessage(''); }} className="p-1">
                        <X size={16} />
                    </Button>
                </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 z-30">
                    <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                </div>
            )}

            {/* Input area */}
            {showVoiceRecorder ? (
                <VoiceMessageRecorder
                    onSend={async (voiceData) => {
                        await addDoc(collection(db, `chats/${chatId}/messages`), {
                            ...voiceData,
                            senderId: user.uid,
                            receiverId: chat.id,
                            timestamp: serverTimestamp(),
                            sent: true,
                            delivered: false,
                            read: false
                        });
                        setShowVoiceRecorder(false);
                    }}
                    onCancel={() => setShowVoiceRecorder(false)}
                />
            ) : showLocationPicker ? (
                <LocationPicker
                    onSend={async (locationData) => {
                        await addDoc(collection(db, `chats/${chatId}/messages`), {
                            ...locationData,
                            senderId: user.uid,
                            receiverId: chat.id,
                            timestamp: serverTimestamp(),
                            sent: true,
                            delivered: false,
                            read: false
                        });
                        setShowLocationPicker(false);
                    }}
                    onCancel={() => setShowLocationPicker(false)}
                />
            ) : showPollCreator ? (
                <PollCreator
                    onSend={async (pollData) => {
                        await addDoc(collection(db, `chats/${chatId}/messages`), {
                            ...pollData,
                            senderId: user.uid,
                            receiverId: chat.id,
                            timestamp: serverTimestamp(),
                            sent: true,
                            delivered: false,
                            read: false
                        });
                        setShowPollCreator(false);
                    }}
                    onCancel={() => setShowPollCreator(false)}
                />
            ) : (
                <>
                    {/* Typing Indicator */}
                    {otherUserTyping && (
                        <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400">
                            <div className="flex space-x-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-150"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-300"></span>
                            </div>
                            <span>yazıyor...</span>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="p-4 border-t border-dark-border bg-dark-bg/80 backdrop-blur-md flex items-center gap-3 relative">
                        {/* Camera Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full w-12 h-12 p-0 bg-primary text-white"
                            onClick={takePicture}
                            disabled={uploading}
                            title="Fotoğraf Çek"
                        >
                            <Camera size={24} />
                        </Button>

                        {/* Text Input */}
                        <Input
                            id="message-input"
                            name="message"
                            type="text"
                            value={newMessage}
                            onChange={(e) => handleTyping(e.target.value)}
                            placeholder={editingMessage ? "Mesajı düzenle..." : "Bir mesaj yazın..."}
                            className="flex-1 py-2.5 px-3 rounded-lg bg-dark-surface text-white"
                            autoComplete="off"
                            inputMode="text"
                            autoCapitalize="sentences"
                        />

                        {/* Attachment Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full w-10 h-10 p-0"
                            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                            title="Ekler"
                        >
                            <Plus size={20} />
                        </Button>

                        {/* Send Button */}
                        <Button
                            type="submit"
                            className="rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary-hover"
                            disabled={!newMessage.trim() && !uploading}
                        >
                            <Send size={18} />
                        </Button>

                        {/* Attachment Popup Menu */}
                        {showAttachmentMenu && (
                            <div className="absolute bottom-20 right-16 z-30 bg-dark-surface rounded-lg shadow-lg p-3 flex flex-col space-y-2">
                                <Button variant="ghost" className="flex items-center gap-2" onClick={() => fileInputRef.current?.click()}>
                                    <ImageIcon size={16} /> Fotoğraf
                                </Button>
                                <Button variant="ghost" className="flex items-center gap-2" onClick={() => fileMultiInputRef.current?.click()}>
                                    <Paperclip size={16} /> Dosya
                                </Button>
                                <Button variant="ghost" className="flex items-center gap-2" onClick={() => { setShowVoiceRecorder(true); setShowAttachmentMenu(false); }}>
                                    <Mic size={16} /> Sesli Mesaj
                                </Button>
                                <Button variant="ghost" className="flex items-center gap-2" onClick={() => { setShowLocationPicker(true); setShowAttachmentMenu(false); }}>
                                    <MapPin size={16} /> Konum
                                </Button>
                                <Button variant="ghost" className="flex items-center gap-2" onClick={() => { setShowPollCreator(true); setShowAttachmentMenu(false); }}>
                                    <BarChart size={16} /> Anket
                                </Button>
                                <Button variant="ghost" className="flex items-center gap-2" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                    <Smile size={16} /> Emoji
                                </Button>
                            </div>
                        )}

                        {/* Hidden file inputs */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <input
                            ref={fileMultiInputRef}
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </form>
                </>
            )}

            {/* Hidden audio element */}
            <audio ref={audioRef} onEnded={() => setPlayingVoice(null)} />
        </div>
    );
};

export default ChatScreen;
