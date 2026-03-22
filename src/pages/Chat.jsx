import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService } from '../services/chatService';
import { Send, ArrowLeft, CheckCheck, MessageCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getPhotoUrl = (photos) => {
    if (!photos?.length) return null;
    const p = photos[0];
    return p?.startsWith('http') ? p : `${BASE_URL}${p}`;
};

// ── Message bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ message, isMe }) => (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMe
                ? 'bg-primary-600 text-white rounded-br-sm'
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
        }`}>
            <p>{message.text}</p>
            <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                <span className="text-[10px]">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && <CheckCheck className="w-3 h-3" />}
            </div>
        </div>
    </div>
);

// ── Conversation list ─────────────────────────────────────────────────────────
const ConversationList = ({ conversations, selectedId, onSelect, currentUserId }) => (
    <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No conversations yet</p>
                <p className="text-gray-400 text-sm mt-1">Chat unlocks when you mutually accept interests</p>
            </div>
        ) : (
            conversations.map(conv => {
                const other = conv.participants?.find(p => p._id !== currentUserId);
                const photo = getPhotoUrl(other?.photos);
                const unread = conv.unreadCount?.[currentUserId] || 0;

                return (
                    <button
                        key={conv._id}
                        onClick={() => onSelect(conv)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                            selectedId === conv._id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                        }`}
                    >
                        <div className="relative flex-shrink-0">
                            {photo ? (
                                <img src={photo} alt={other?.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                                    <span className="text-primary-700 font-bold text-lg">
                                        {(other?.name || 'U')[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                            {other?.verificationBadge && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Shield className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-800 text-sm truncate">
                                    {other?.fullName || other?.name}
                                </p>
                                {unread > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex-shrink-0">
                                        {unread}
                                    </span>
                                )}
                            </div>
                            {conv.lastMessage && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                    {conv.lastMessage.text || 'Sent a message'}
                                </p>
                            )}
                        </div>
                    </button>
                );
            })
        )}
    </div>
);

// ── Main Chat page ────────────────────────────────────────────────────────────
const Chat = () => {
    const { userId: directUserId } = useParams(); // If navigated from /chat/:userId
    const navigate = useNavigate();
    const { user } = useAuth();
    const { joinConversation, leaveConversation, onNewMessage, emitTyping, onTyping } = useSocket();

    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [showConvList, setShowConvList] = useState(true);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    // Load conversations
    useEffect(() => {
        const load = async () => {
            setLoadingConvs(true);
            try {
                const data = await chatService.getConversations();
                setConversations(data);
            } catch {
                toast.error('Failed to load conversations');
            } finally {
                setLoadingConvs(false);
            }
        };
        load();
    }, []);

    // If direct userId param, open/create conversation
    useEffect(() => {
        if (!directUserId) return;
        const openDirect = async () => {
            try {
                const conv = await chatService.getOrCreateConversation(directUserId);
                setSelectedConv(conv);
                setShowConvList(false);
                // Update conversation list
                setConversations(prev => {
                    const exists = prev.find(c => c._id === conv._id);
                    return exists ? prev : [conv, ...prev];
                });
            } catch (err) {
                toast.error(err.response?.data?.message || 'Cannot open chat');
                navigate('/chat');
            }
        };
        openDirect();
    }, [directUserId, navigate]);

    // Load messages when conversation changes
    useEffect(() => {
        if (!selectedConv) return;

        const loadMessages = async () => {
            setLoadingMsgs(true);
            try {
                const data = await chatService.getMessages(selectedConv._id);
                setMessages(data.messages || []);
            } catch {
                toast.error('Failed to load messages');
            } finally {
                setLoadingMsgs(false);
            }
        };

        loadMessages();
        joinConversation(selectedConv._id);
        inputRef.current?.focus();

        return () => leaveConversation(selectedConv._id);
    }, [selectedConv?._id]);

    // Socket: new message — sole source of truth for appending messages
    useEffect(() => {
        const cleanup = onNewMessage((msg) => {
            if (msg.conversation === selectedConv?._id) {
                setMessages(prev => [...prev, msg]);
            }
            // Update conversation list preview
            setConversations(prev =>
                prev.map(c => c._id === msg.conversation
                    ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt }
                    : c
                )
            );
        });
        return cleanup;
    }, [selectedConv?._id, onNewMessage]);

    // Socket: typing indicator
    useEffect(() => {
        const cleanup = onTyping(({ userId, isTyping }) => {
            if (userId !== user?._id) {
                setTypingUser(isTyping ? userId : null);
            }
        });
        return cleanup;
    }, [user?._id, onTyping]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectConv = (conv) => {
        setSelectedConv(conv);
        setShowConvList(false);
        setMessages([]);
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!text.trim() || !selectedConv || sending) return;

        const msgText = text.trim();
        setText('');
        setSending(true);

        try {
            // Don't add to messages here — the socket will echo it back to the sender
            // (sender is in the conversation room) and the onNewMessage handler will add it.
            // This prevents the double-message bug on the sender's end.
            await chatService.sendMessage(selectedConv._id, msgText);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send message');
            setText(msgText); // Restore text on failure
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleTyping = (e) => {
        setText(e.target.value);
        if (selectedConv) {
            emitTyping(selectedConv._id, true);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                emitTyping(selectedConv._id, false);
            }, 1500);
        }
    };

    const getOtherParticipant = (conv) =>
        conv?.participants?.find(p => p._id !== user?._id);

    const other = getOtherParticipant(selectedConv);
    const otherPhoto = getPhotoUrl(other?.photos);

    return (
        <div className="max-w-6xl mx-auto px-0 sm:px-4 lg:px-8 py-0 sm:py-6 h-[calc(100vh-80px)]">
            <div className="bg-white rounded-none sm:rounded-2xl shadow-soft border border-gray-100 h-full flex overflow-hidden">

                {/* ── Left: Conversation List ─────────────────────────── */}
                <div className={`${showConvList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-gray-100 flex-shrink-0`}>
                    <div className="px-4 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 font-serif">Messages</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Chat with your mutual matches</p>
                    </div>

                    {loadingConvs ? (
                        <div className="flex items-center justify-center flex-1">
                            <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <ConversationList
                            conversations={conversations}
                            selectedId={selectedConv?._id}
                            onSelect={handleSelectConv}
                            currentUserId={user?._id}
                        />
                    )}
                </div>

                {/* ── Right: Chat Window ──────────────────────────────── */}
                <div className={`${!showConvList ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-w-0`}>
                    {!selectedConv ? (
                        // Empty state
                        <div className="flex flex-col items-center justify-center h-full text-center px-8">
                            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-10 h-10 text-primary-400" />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">Select a conversation</h3>
                            <p className="text-gray-500 text-sm max-w-xs">
                                Chat is available only with mutual matches — profiles where both of you accepted interests.
                            </p>
                            <Link to="/matches" className="mt-4 text-primary-600 hover:text-primary-800 text-sm font-semibold">
                                View your matches →
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white">
                                <button
                                    onClick={() => setShowConvList(true)}
                                    className="md:hidden p-1 text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>

                                {otherPhoto ? (
                                    <img src={otherPhoto} alt={other?.name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                        <span className="text-primary-700 font-bold">
                                            {(other?.name || 'U')[0].toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-semibold text-gray-800 text-sm truncate">
                                            {other?.fullName || other?.name}
                                        </h3>
                                        {other?.verificationBadge && (
                                            <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {typingUser ? 'Typing...' : 'Mutual match'}
                                    </p>
                                </div>

                                <Link
                                    to={`/profiles/${other?._id}`}
                                    className="text-xs text-primary-600 hover:text-primary-800 font-medium flex-shrink-0"
                                >
                                    View profile
                                </Link>
                            </div>

                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
                                {loadingMsgs ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                        <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map(msg => (
                                            <MessageBubble
                                                key={msg._id}
                                                message={msg}
                                                isMe={msg.sender?._id === user?._id || msg.sender === user?._id}
                                            />
                                        ))}
                                        {typingUser && (
                                            <div className="flex justify-start mb-2">
                                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                                                    <div className="flex gap-1 items-center">
                                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Input area */}
                            <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-white">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={text}
                                    onChange={handleTyping}

                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none text-gray-800"
                                    maxLength={1000}
                                />
                                <button
                                    type="submit"
                                    disabled={!text.trim() || sending}
                                    className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                                >
                                    {sending ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
