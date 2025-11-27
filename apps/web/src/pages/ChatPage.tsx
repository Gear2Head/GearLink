import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addMessage } from '../store/chat.slice';
import { Send, Phone, Video, MoreVertical } from 'lucide-react';

export default function ChatPage() {
    const [message, setMessage] = useState('');
    const activeConversationId = '1'; // Mock
    const messages = useSelector((state: RootState) => state.chat.messages[activeConversationId] || []);
    const dispatch = useDispatch();

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        dispatch(addMessage({
            conversationId: activeConversationId,
            message: {
                id: Date.now().toString(),
                content: message,
                senderId: 'me',
                createdAt: new Date().toISOString(),
            }
        }));
        setMessage('');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-white border-r border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold">Chats</h2>
                </div>
                <div className="overflow-y-auto h-full">
                    {/* Mock Chat List Item */}
                    <div className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer bg-blue-50">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                            <div>
                                <p className="font-medium">Test User</p>
                                <p className="text-sm text-gray-500 truncate">Last message...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                        <div>
                            <p className="font-medium">Test User</p>
                            <p className="text-sm text-green-500">Online</p>
                        </div>
                    </div>
                    <div className="flex space-x-4 text-gray-600">
                        <Phone className="w-5 h-5 cursor-pointer hover:text-primary" />
                        <Video className="w-5 h-5 cursor-pointer hover:text-primary" />
                        <MoreVertical className="w-5 h-5 cursor-pointer hover:text-primary" />
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ded8]">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${msg.senderId === 'me'
                                        ? 'bg-[#dcf8c6] text-black'
                                        : 'bg-white text-black'
                                    } shadow-sm`}
                            >
                                <p>{msg.content}</p>
                                <p className="text-xs text-gray-500 text-right mt-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSend} className="flex space-x-4">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <button
                            type="submit"
                            className="bg-primary text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
