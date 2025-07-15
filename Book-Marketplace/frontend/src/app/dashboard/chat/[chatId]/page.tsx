"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';
import io, { Socket } from 'socket.io-client';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Toolbar,
  Avatar,
  alpha,
  Fade,
  Zoom,
  Chip,
  Badge,
  Tooltip,
  Card,
  CardContent,
  Container
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreVertIcon,
  Circle as OnlineIcon,
  FiberManualRecord as TypingDotIcon
} from '@mui/icons-material';
import Image from 'next/image';

import apiClient from '@/lib/api';
// --- Types ---
interface Sender { _id: string; name: string; firebaseUid: string; }
interface Message { _id: string; sender: Sender; text: string; createdAt: string; status?: 'sending' | 'sent' | 'delivered' | 'read'; }
interface Participant { _id: string; name: string; firebaseUid: string; }
interface BookInfo { title: string; imageUrls: string[]; }
interface ChatDetails { _id: string; participants: Participant[]; book: BookInfo; }
interface TypingUser { userId: string; name: string; timestamp: number; }

// --- API Calls ---
const fetchMessages = async (chatId: string, token: string): Promise<Message[]> => {
  const { data } = await apiClient.get(`/chats/${chatId}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};
const fetchChatDetails = async (chatId: string, token: string): Promise<ChatDetails> => {
  const { data } = await apiClient.get(`/chats/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

// --- Message Bubble ---
const MessageBubble = ({
  message,
  isMe,
  otherUser
}: {
  message: Message;
  isMe: boolean;
  otherUser: Participant | undefined;
}) => {
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <Fade in timeout={300}>
      <Box sx={{
        display: 'flex',
        flexDirection: isMe ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        mb: 2,
        gap: 1,
      }}>
        {!isMe && (
          <Avatar
            sx={{
              width: 32, height: 32, fontSize: '0.875rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid white'
            }}
          >
            {otherUser?.name.charAt(0)}
          </Avatar>
        )}
        <Paper
          elevation={0}
          sx={{
            maxWidth: '70%',
            p: 2,
            borderRadius: isMe ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
            background: isMe
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : alpha('#ffffff', 0.1),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#ffffff', 0.2)}`,
            color: isMe ? 'white' : 'text.primary',
            position: 'relative'
          }}
        >
          <Typography variant="body1" sx={{ wordBreak: 'break-word', lineHeight: 1.5, fontSize: '0.95rem' }}>
            {message.text}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.75rem' }}>
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            {isMe && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                
                
                {message.status === 'delivered' && <Box sx={{ width: 12, height: 12, opacity: 0.7 }}>✓✓</Box>}
                
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};

// --- Typing Indicator ---
const TypingIndicator = ({ typingUsers }: { typingUsers: TypingUser[] }) => {
  if (typingUsers.length === 0) return null;
  return (
    <Fade in>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, ml: 5 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '20px 20px 20px 6px',
            background: alpha('#ffffff', 0.1),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#ffffff', 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {[0, 1, 2].map((i) => (
              <TypingDotIcon
                key={i}
                sx={{
                  fontSize: 8,
                  color: 'primary.main',
                  animation: `pulse 1.4s infinite ${i * 0.2}s`,
                  '@keyframes pulse': {
                    '0%': { opacity: 0.3 },
                    '50%': { opacity: 1 },
                    '100%': { opacity: 0.3 }
                  }
                }}
              />
            ))}
          </Box>
          
        </Paper>
      </Box>
    </Fade>
  );
};

export default function ChatScreen() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;
  const { user, idToken } = useAuth();
  const queryClient = useQueryClient();
 
  

  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Fetch chat data
  const { data: chatDetails } = useQuery({
    queryKey: ['chatDetails', chatId],
    queryFn: () => fetchChatDetails(chatId, idToken!),
    enabled: !!idToken && !!chatId,
  });

  const { data: messages, isLoading, isError } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => fetchMessages(chatId, idToken!),
    enabled: !!idToken && !!chatId,
  });

  const otherUser = chatDetails?.participants.find(p => p.firebaseUid !== user?.uid);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Socket.IO connection and event handlers
  useEffect(() => {
    if (!idToken || !user || !mounted) return;
    const socket = io('http://localhost:5001', { transports: ['websocket'], upgrade: true });
    socketRef.current = socket;
    socket.emit('join chat', chatId);
    socket.on('connect', () => setIsOnline(true));
    socket.on('disconnect', () => setIsOnline(false));
    socket.on('message received', (newMessage: Message) => {
      queryClient.setQueryData(['messages', chatId], (oldData: Message[] = []) => {
        if (oldData.some(msg => msg._id === newMessage._id)) return oldData;
        return [...oldData, { ...newMessage, status: 'delivered' }];
      });
      setTypingUsers(prev => prev.filter(u => u.userId !== newMessage.sender.firebaseUid));
    });
    socket.on('user typing', ({ userId, name }: { userId: string; name: string }) => {
      if (userId === user.uid) return;
      setTypingUsers(prev => {
        const existing = prev.find(u => u.userId === userId);
        if (existing) {
          return prev.map(u => u.userId === userId ? { ...u, timestamp: Date.now() } : u);
        }
        return [...prev, { userId, name, timestamp: Date.now() }];
      });
    });
    socket.on('user stopped typing', ({ userId }: { userId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });
    return () => { socket.disconnect(); };
  }, [idToken, user, chatId, queryClient, mounted]);

  // Clean up typing indicators after timeout
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => prev.filter(u => now - u.timestamp < 3000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle typing events
  const handleTyping = useCallback(() => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit('typing', { chatId, userId: user.uid, name: user.displayName || 'User' });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && user) {
        socketRef.current.emit('stop typing', { chatId, userId: user.uid });
      }
    }, 2000);
  }, [chatId, user]);

  // Send message handler
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !user) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socketRef.current.emit('stop typing', { chatId, userId: user.uid });
    }
    const tempMessage: Message = {
      _id: `temp_${Date.now()}`,
      sender: { _id: user.uid, name: user.displayName || 'You', firebaseUid: user.uid },
      text: newMessage.trim(),
      createdAt: new Date().toISOString(),
      status: 'sending'
    };
    queryClient.setQueryData(['messages', chatId], (oldData: Message[] = []) => [
      ...oldData,
      tempMessage
    ]);
    socketRef.current.emit('new message', {
      chatId,
      text: newMessage.trim(),
      sender: { _id: user.uid }
    });
    setNewMessage('');
    messageInputRef.current?.focus();
  }, [newMessage, user, chatId, queryClient]);

  if (!mounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }
  if (isError) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Could not load messages. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          background: alpha('#ffffff', 0.1),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha('#ffffff', 0.2)}`,
          borderRadius: 0
        }}
      >
        <Toolbar sx={{ gap: 2, py: 1 }}>
          <IconButton
            onClick={() => router.back()}
            sx={{
              background: alpha('#ffffff', 0.1),
              backdropFilter: 'blur(10px)',
              '&:hover': { background: alpha('#ffffff', 0.2), transform: 'translateY(-1px)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <OnlineIcon
                  sx={{
                    color: isOnline ? '#10b981' : '#94a3b8',
                    fontSize: 12,
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    p: 0.2
                  }}
                />
              }
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '1.25rem',
                  fontWeight: 700
                }}
              >
                {otherUser?.name.charAt(0) || '?'}
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {otherUser?.name || 'Loading...'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Regarding: {chatDetails?.book.title || '...'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="More Options">
              <IconButton
                sx={{
                  background: alpha('#ffffff', 0.1),
                  backdropFilter: 'blur(10px)',
                  '&:hover': { background: alpha('#ffffff', 0.2) }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Paper>

      {/* Book Info Card */}
      {chatDetails?.book && (
        <Card
          sx={{
            m: 2,
            background: alpha('#ffffff', 0.1),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#ffffff', 0.2)}`,
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {chatDetails.book.imageUrls[0] && (
                <Box
                  sx={{
                    position: 'relative',
                    width: 60,
                    height: 80,
                    borderRadius: 2,
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  <Image
                    src={chatDetails.book.imageUrls[0]}
                    alt={chatDetails.book.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="60px"
                  />
                </Box>
              )}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {chatDetails.book.title}
                </Typography>
                <Chip
                  label="Book Discussion"
                  size="small"
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 2,
          py: 1,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            background: alpha('#000000', 0.2),
            borderRadius: 3,
          },
        }}
      >
        {messages?.map((msg) => {
          const isMe = msg.sender.firebaseUid === user?.uid;
          return (
            <MessageBubble
              key={msg._id}
              message={msg}
              isMe={isMe}
              otherUser={otherUser}
            />
          );
        })}
        <TypingIndicator typingUsers={typingUsers} />
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper
        elevation={0}
        sx={{
          background: alpha('#ffffff', 0.1),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha('#ffffff', 0.2)}`,
          borderRadius: 0,
          p: 2
        }}
      >
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            maxWidth: 1200,
            mx: 'auto'
          }}
        >
          <Tooltip title="Attach File">
            <IconButton
              sx={{
                background: alpha('#ffffff', 0.1),
                backdropFilter: 'blur(10px)',
                '&:hover': { background: alpha('#ffffff', 0.2) }
              }}
            >
              <AttachFileIcon />
            </IconButton>
          </Tooltip>
          <TextField
            ref={messageInputRef}
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 6,
                background: alpha('#ffffff', 0.8),
                backdropFilter: 'blur(10px)',
                border: 'none',
                '& fieldset': { border: 'none' },
                '&:hover': { background: alpha('#ffffff', 0.9) },
                '&.Mui-focused': {
                  background: alpha('#ffffff', 1),
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                }
              }
            }}
          />
          <Tooltip title="Emoji">
            <IconButton
              sx={{
                background: alpha('#ffffff', 0.1),
                backdropFilter: 'blur(10px)',
                '&:hover': { background: alpha('#ffffff', 0.2) }
              }}
            >
              <EmojiIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send Message">
            <Zoom in={newMessage.trim().length > 0}>
              <IconButton
                type="submit"
                disabled={!newMessage.trim()}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  },
                  '&:disabled': {
                    background: alpha('#667eea', 0.3),
                    color: alpha('#ffffff', 0.5),
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Zoom>
          </Tooltip>
        </Box>
      </Paper>

      {/* Connection Status */}
      {!isOnline && (
        <Alert
          severity="warning"
          sx={{
            position: 'absolute',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            borderRadius: 3
          }}
        >
          Connection lost. Trying to reconnect...
        </Alert>
      )}
    </Box>
  );
}
