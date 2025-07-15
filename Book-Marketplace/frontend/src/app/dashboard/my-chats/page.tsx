// E:\pro-book-marketplace\frontend\src\app\dashboard/my-chats/page.tsx

"use client";

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Forum';
import BookIcon from '@mui/icons-material/AutoStories';
import apiClient from '@/lib/api';
interface Participant {
  _id: string;
  name: string;
  firebaseUid: string;
}

interface BookInfo {
  _id: string;
  title: string;
  imageUrls: string[];
}

interface Chat {
  _id: string;
  participants: Participant[];
  book: BookInfo | null;
  updatedAt: string;
}

const fetchUserChats = async (token: string): Promise<Chat[]> => {
  const { data } = await apiClient.get('/chats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export default function MyChatsPage() {
  const { user, idToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const { data: chats, isLoading, isError } = useQuery({
    queryKey: ['myChats', user?.uid],
    queryFn: () => fetchUserChats(idToken!),
    enabled: !!idToken && !!user,
  });

  // Only show chats with a valid book
  const validChats = React.useMemo(() => {
    if (!chats) return [];
    return chats.filter((chat) => chat.book !== null);
  }, [chats]);

  const getOtherParticipant = (participants: Participant[]) =>
    participants.find((p) => p.firebaseUid !== user?.uid);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Could not load your chats.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        My Conversations
      </Typography>
      <Paper
        sx={{
          borderRadius: 4,
          background: alpha(theme.palette.background.paper, 0.7),
          boxShadow: theme.shadows[2],
          p: 0,
        }}
      >
        {validChats && validChats.length > 0 ? (
          <List disablePadding>
            {validChats.map((chat, index) => {
              const otherUser = getOtherParticipant(chat.participants);
              return (
                <React.Fragment key={chat._id}>
                  <ListItem
                    disablePadding
                    secondaryAction={
                      chat.book?.imageUrls?.[0] ? (
                        <Avatar
                          variant="rounded"
                          src={chat.book.imageUrls[0]}
                          alt={chat.book.title}
                          sx={{
                            width: 48,
                            height: 64,
                            ml: 2,
                            borderRadius: 2,
                            boxShadow: theme.shadows[1],
                          }}
                        />
                      ) : (
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 48,
                            height: 64,
                            ml: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                          }}
                        >
                          <BookIcon />
                        </Avatar>
                      )
                    }
                  >
                    <ListItemButton
                      onClick={() => router.push(`/dashboard/chat/${chat._id}`)}
                      sx={{
                        py: 3,
                        px: 2,
                        borderRadius: 0,
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.06),
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: theme.palette.primary.main,
                            fontWeight: 700,
                          }}
                        >
                          {otherUser?.name?.[0] || <ChatIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {otherUser?.name || 'Unknown User'}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mt: 0.5,
                            }}
                          >
                            <BookIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
                            {chat.book?.title}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < validChats.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              You have no active conversations.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
