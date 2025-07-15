"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  Chip,
  Divider,
  CircularProgress,
  TextField,
  Alert,
  useTheme,
  alpha,

} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookIcon from '@mui/icons-material/Book';
import LogoutIcon from '@mui/icons-material/Logout';
import { GridLegacy as Grid } from '@mui/material';

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [editError, setEditError] = useState<string | null>(null);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h5">Please log in to view your profile.</Typography>
        <Button variant="contained" onClick={() => router.push('/login')}>Go to Login</Button>
      </Container>
    );
  }

  // Simulate update profile (replace this with your actual update logic)
  const handleSave = async () => {
    setEditError(null);
    if (!displayName.trim()) {
      setEditError("Name cannot be empty.");
      return;
    }
    // ...call API to update display name
    setEditing(false);
  };

  return (
    <Box sx={{ pt: { xs: 8, md: 10 }, pb: { xs: 8, md: 10 }, bgcolor: "background.default" }}>
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: "blur(12px)",
            boxShadow: theme.shadows[6],
            textAlign: "center",
          }}
        >
          <Avatar
            src={user.photoURL || undefined}
            alt={user.displayName || user.email || "User"}
            sx={{
              width: 96,
              height: 96,
              mx: "auto",
              mb: 2,
              fontSize: 40,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            {(user.displayName || user.email || "U")[0]}
          </Avatar>

          {/* Name */}
          {editing ? (
            <Box sx={{ mb: 2 }}>
              <TextField
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                label="Your Name"
                size="small"
                sx={{ width: 220 }}
                autoFocus
              />
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
                <Button variant="contained" size="small" onClick={handleSave}>Save</Button>
                <Button variant="outlined" size="small" onClick={() => setEditing(false)}>Cancel</Button>
              </Box>
              {editError && <Alert severity="error" sx={{ mt: 2 }}>{editError}</Alert>}
            </Box>
          ) : (
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {user.displayName || "Unnamed User"}
              </Typography>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setEditing(true)}
                sx={{ ml: 1, minWidth: 0, px: 1, borderRadius: 2 }}
              >
                Edit
              </Button>
            </Box>
          )}

          {/* Email */}
          <Chip
            icon={<EmailIcon />}
            label={user.email}
            sx={{
              mb: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: "1rem",
            }}
          />

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                <CalendarTodayIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  Joined: {user.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                <BookIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  {/* Replace with actual count */}
                  Books Listed: <b>--</b>
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Sign Out
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
