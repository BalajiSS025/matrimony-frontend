import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!user || !token) {
            // Disconnect if logged out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setConnected(false);
            }
            return;
        }

        // Create socket connection
        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            setConnected(true);
            // Join personal notification room
            socket.emit('join_user', user._id);
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setConnected(false);
        };
    }, [user, token]);

    const joinConversation = (conversationId) => {
        socketRef.current?.emit('join_conversation', conversationId);
    };

    const leaveConversation = (conversationId) => {
        socketRef.current?.emit('leave_conversation', conversationId);
    };

    const emitTyping = (conversationId, isTyping) => {
        socketRef.current?.emit('typing', {
            conversationId,
            userId: user?._id,
            isTyping,
        });
    };

    const onNewMessage = (callback) => {
        socketRef.current?.on('new_message', callback);
        return () => socketRef.current?.off('new_message', callback);
    };

    const onTyping = (callback) => {
        socketRef.current?.on('typing', callback);
        return () => socketRef.current?.off('typing', callback);
    };

    return (
        <SocketContext.Provider value={{
            socket: socketRef.current,
            connected,
            joinConversation,
            leaveConversation,
            emitTyping,
            onNewMessage,
            onTyping,
        }}>
            {children}
        </SocketContext.Provider>
    );
};
