import { useState, useEffect, useRef } from 'react';
import { getFirebaseDb, getFirebaseStorage } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Input, Avatar } from './ui';
import { cn } from '../lib/utils';
import { Send, Image as ImageIcon, ArrowLeft, Smile, MoreVertical, FileText, Paperclip, Check, CheckCheck, Mic, MapPin, BarChart, Camera, Phone, Video } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import VoiceMessageRecorder from './VoiceMessageRecorder';
import LocationPicker from './LocationPicker';
import PollCreator from './PollCreator';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { updateChatMetadata } from '../lib/chatMetadata';

const ChatScreenV2 = ({ user, chat, onBack, onViewProfile }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showPollCreator, setShowPollCreator] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const fileMultiInputRef = useRef(null);

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
            setTimeout(scrollToBottom, 100);
        });

        return () => unsubscribe();
    }, [chatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await addDoc(collection(db, `chats/${chatId}/messages`), {
                text: newMessage,
                senderId: user.uid,
                receiverId: chat.id,
                timestamp: serverTimestamp(),
                type: 'text',
                read: false,
                delivered: false
            });

            await updateChatMetadata(user.uid, chat.id, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const takePicture = async () => {
        try {
            const image = await CapacitorCamera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera
            });

            setUploading(true);
            const response = await fetch(image.dataUrl);
            const blob = await response.blob();
            const storageRef = ref(storage, `chat-images/${Date.now()}.jpg`);
            await uploadBytes(storageRef, blob);
            const url = await getDownloadURL(storageRef);

            await addDoc(collection(db, `chats/${chatId}/messages`), {
                type: 'image',
                fileURL: url,
                senderId: user.uid,
                receiverId: chat.id,
                timestamp: serverTimestamp(),
                read: false,
                delivered: false
            });

            await updateChatMetadata(user.uid, chat.id, '📷 Fotoğraf');
            setUploading(false);
        } catch (error) {
            console.error('Camera error:', error);
            setUploading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `chat-files/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';

            await addDoc(collection(db, `chats/${chatId}/messages`), {
                type: fileType,
                fileURL: url,
                fileName: file.name,
                fileSize: file.size,
                senderId: user.uid,
                receiverId: chat.id,
                timestamp: serverTimestamp(),
                read: false,
                delivered: false
            });

            const preview = fileType === 'image' ? '📷 Fotoğraf' : fileType === 'video' ? '🎥 Video' : '📎 Dosya';
            await updateChatMetadata(user.uid, chat.id, preview);
            setUploading(false);
        } catch (error) {
            console.error('Upload error:', error);
            setUploading(false);
        }
    };

    const renderMessageContent = (msg) => {
        switch (msg.type) {
            case 'image':
                return <img src={msg.fileURL} alt="Shared" className="rounded-lg max-w-full" onLoad={scrollToBottom} />;
            case 'video':
                return <video src={msg.fileURL} controls className="rounded-lg max-w-full" />;
            case 'file':
                return (
                    <div className="flex items-center gap-3 p-3 bg-black/10 rounded-lg">
                        <FileText size={32} className="text-white" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-sm">{msg.fileName || 'Dosya'}</p>
                        </div>
                    </div>
                );
            default:
                return <p className="text-sm">{msg.text || ''}</p>;
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#0b141a] max-w-4xl mx-auto">
            {/* Header - WhatsApp Style */}
            <div className="px-4 py-2 bg-[#202c33] flex items-center gap-3">
                <Button variant="ghost" onClick={onBack} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-[#8696a0]" />
                </Button>

                <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => onViewProfile?.(chat)}
                >
                    <Avatar
                        fallback={(chat.displayName || chat.email || '?')[0]}
                        src={chat.photoURL}
                        className="w-10 h-10"
                    />
                    <div className="flex-1">
                        <h2 className="font-medium text-white text-[17px]">
                            {chat.displayName || chat.email || 'Kullanıcı'}
                        </h2>
                        <p className="text-xs text-[#8696a0]">
                            {chat.isOnline ? 'çevrimiçi' : 'çevrimdışı'}
                        </p>
                    </div>
                </div>

                <Button variant="ghost" className="p-2 text-[#8696a0]">
                    <Video size={24} />
                </Button>
                <Button variant="ghost" className="p-2 text-[#8696a0]">
                    <Phone size={24} />
                </Button>
                <Button variant="ghost" className="p-2 text-[#8696a0]">
                    <MoreVertical size={24} />
                </Button>
            </div>

            {/* Messages Area - WhatsApp Background */}
            <div className="flex-1 overflow-y-auto p-2 bg-[#0b141a]" style={{
                backgroundImage: 'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)',
                backgroundRepeat: 'repeat',
                backgroundSize: '412.5px 749.25px',
                opacity: 0.06
            }}>
                <div className="relative" style={{ opacity: 1 }}>
                    {messages.map((msg) => {
                        const isMe = msg.senderId === user.uid;
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex mb-1 max-w-[85%]",
                                    isMe ? "ml-auto" : "mr-auto"
                                )}
                            >
                                <div
                                    className={cn(
                                        "px-2 py-1 rounded-lg shadow-sm relative",
                                        isMe
                                            ? "bg-[#005c4b] text-white rounded-tr-none"
                                            : "bg-[#202c33] text-white rounded-tl-none"
                                    )}
                                >
                                    {renderMessageContent(msg)}

                                    <div className="text-[10px] text-[#8696a0] mt-1 flex items-center gap-1 justify-end">
                                        {msg.timestamp?.toDate?.()
                                            ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : ''}
                                        {isMe && (
                                            msg.read
                                                ? <CheckCheck size={14} className="text-[#53bdeb]" />
                                                : <Check size={14} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 z-50">
                    <EmojiPicker
                        onEmojiClick={(emojiData) => {
                            setNewMessage(prev => prev + emojiData.emoji);
                            setShowEmojiPicker(false);
                        }}
                        theme="dark"
                    />
                </div>
            )}

            {/* Input Area - WhatsApp Style */}
            {showVoiceRecorder ? (
                <VoiceMessageRecorder
                    onSend={async (voiceData) => {
                        await addDoc(collection(db, `chats/${chatId}/messages`), {
                            ...voiceData,
                            senderId: user.uid,
                            receiverId: chat.id,
                            timestamp: serverTimestamp(),
                            read: false,
                            delivered: false
                        });
                        await updateChatMetadata(user.uid, chat.id, '🎤 Sesli Mesaj');
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
                            read: false,
                            delivered: false
                        });
                        await updateChatMetadata(user.uid, chat.id, '📍 Konum');
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
                            read: false,
                            delivered: false
                        });
                        await updateChatMetadata(user.uid, chat.id, '📊 Anket');
                        setShowPollCreator(false);
                    }}
                    onCancel={() => setShowPollCreator(false)}
                />
            ) : (
                <div className="px-2 py-2 bg-[#202c33] flex items-end gap-2">
                    {/* Input Container */}
                    <div className="flex-1 bg-[#2a3942] rounded-3xl flex items-center px-3 py-1.5 min-h-[45px] relative">
                        {/* Emoji Button */}
                        <Button
                            variant="ghost"
                            className="p-1 text-[#8696a0] hover:text-white transition-colors rounded-full w-9 h-9 flex items-center justify-center"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <Smile size={24} />
                        </Button>

                        {/* Text Input */}
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Mesaj"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-[#8696a0] py-2 px-2 text-[15px] leading-5"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />

                        {/* Paperclip Button */}
                        <Button
                            variant="ghost"
                            className="p-1 text-[#8696a0] hover:text-white transition-colors rounded-full w-9 h-9 flex items-center justify-center"
                            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        >
                            <Paperclip size={24} className="rotate-45" />
                        </Button>

                        {/* Attachment Menu */}
                        {showAttachmentMenu && (
                            <div className="absolute bottom-16 right-0 bg-[#2a3942] rounded-xl shadow-2xl p-4 grid grid-cols-3 gap-4 z-30 w-64">
                                <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => { fileInputRef.current?.click(); setShowAttachmentMenu(false); }}>
                                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white"><FileText size={24} /></div>
                                    <span className="text-xs text-white">Belge</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => { takePicture(); setShowAttachmentMenu(false); }}>
                                    <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white"><Camera size={24} /></div>
                                    <span className="text-xs text-white">Kamera</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => { fileMultiInputRef.current?.click(); setShowAttachmentMenu(false); }}>
                                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white"><ImageIcon size={24} /></div>
                                    <span className="text-xs text-white">Galeri</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => { setShowLocationPicker(true); setShowAttachmentMenu(false); }}>
                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white"><MapPin size={24} /></div>
                                    <span className="text-xs text-white">Konum</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => { setShowPollCreator(true); setShowAttachmentMenu(false); }}>
                                    <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white"><BarChart size={24} /></div>
                                    <span className="text-xs text-white">Anket</span>
                                </div>
                            </div>
                        )}

                        {/* Camera Button */}
                        <Button
                            variant="ghost"
                            className="p-1 text-[#8696a0] hover:text-white transition-colors rounded-full w-9 h-9 flex items-center justify-center"
                            onClick={takePicture}
                            disabled={uploading}
                        >
                            <Camera size={24} />
                        </Button>
                    </div>

                    {/* Send / Mic Button */}
                    {newMessage.trim() ? (
                        <Button
                            onClick={handleSend}
                            className="w-12 h-12 rounded-full bg-[#00a884] hover:bg-[#008f6f] flex items-center justify-center shadow-lg transition-all active:scale-95"
                        >
                            <Send size={24} className="ml-0.5 text-white" />
                        </Button>
                    ) : (
                        <Button
                            className="w-12 h-12 rounded-full bg-[#00a884] hover:bg-[#008f6f] flex items-center justify-center shadow-lg transition-all active:scale-95"
                            onClick={() => setShowVoiceRecorder(true)}
                        >
                            <Mic size={24} className="text-white" />
                        </Button>
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
                </div>
            )}
        </div>
    );
};

export default ChatScreenV2;
