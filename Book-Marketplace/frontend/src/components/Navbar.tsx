"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem,
  IconButton, Tooltip, Divider, ListItemIcon, TextField, InputAdornment,
  useTheme, useMediaQuery, Drawer, List, ListItem, ListItemButton,
  ListItemText, Container, alpha, Chip
} from '@mui/material';
import {
  Book as BookIcon, ArrowDropDown as ArrowDropDownIcon, Person as PersonIcon,
  ListAlt as ListAltIcon, Chat as ChatIcon, Logout as LogoutIcon,
  Search as SearchIcon, Menu as MenuIcon, Close as CloseIcon,
  Sell as SellIcon, LocalOffer as OfferIcon
} from '@mui/icons-material';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /* ---------------- state ---------------- */
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const open = Boolean(anchorEl);

  /* --------------- effects --------------- */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* --------------- handlers -------------- */
  const handleClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSignOut = async () => {
    handleClose();
    await signOut(auth);
    router.push('/');
  };
  const handleNavigation = (path: string) => {
    handleClose();
    setMobileOpen(false);
    router.push(path);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };
  const handleMobileToggle = () => setMobileOpen(!mobileOpen);

  /* --------------- nav data -------------- */
  const navItems = [
    { label: 'Browse', href: '/browse', icon: <BookIcon /> },
    { label: 'Categories', href: '/categoriies', icon: <OfferIcon /> }
  ];

  const userMenuItems = [
    { label: 'My Profile', href: '/dashboard/profile', icon: <PersonIcon /> },
    { label: 'My Books',  href: '/dashboard/my-ads',   icon: <ListAltIcon /> },
    { label: 'Messages', href: '/dashboard/my-chats', icon: <ChatIcon /> }
  ];

  /* --------------- drawer ---------------- */
  const drawer = (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider',
                 display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          BookMarket
        </Typography>
        <IconButton onClick={handleMobileToggle}><CloseIcon /></IconButton>
      </Box>
      <List sx={{ pt: 0 }}>
        {navItems.map(item => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => handleNavigation(item.href)}>
              <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        {user ? (
          <>
            {userMenuItems.map(item => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton onClick={() => handleNavigation(item.href)}>
                  <ListItemIcon sx={{ color: 'text.secondary' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation('/sell-a-book')}
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}><SellIcon /></ListItemIcon>
                <ListItemText primary="Sell a Book" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={handleSignOut}>
                <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Sign Out" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/login')}>
              <ListItemIcon sx={{ color: 'primary.main' }}><PersonIcon /></ListItemIcon>
              <ListItemText primary="Sign In" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  /* --------------- render ---------------- */
  return (
    <>
      <AppBar position="fixed" elevation={scrolled ? 4 : 0}
        sx={{
          backgroundColor: scrolled
            ? alpha(theme.palette.background.paper, 0.95)
            : alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          borderBottom: scrolled ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1 }}>
            {isMobile && (
              <IconButton edge="start" onClick={handleMobileToggle} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                <BookIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'var(--font-playfair-display)',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  BookMarket
                </Typography>
              </Box>
            </Link>

            {/* Desktop nav */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 3 }}>
                {navItems.map(item => (
                  <Button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    startIcon={item.icon}
                    sx={{
                      color: 'text.primary', fontWeight: 500, px: 2, py: 1,
                      borderRadius: 2,
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1),
                                   color: 'primary.main' }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Search bar (taken from main SearchBox) */}
            <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, maxWidth: 500, mx: 2 }}>
              <TextField
                fullWidth
                placeholder="Search for books, authors, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: isSearchFocused && searchQuery && (
                    <InputAdornment position="end">
                      <Chip label="Enter" size="small" variant="outlined" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    transition: 'all .3s',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.divider, 0.4) },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 2 }
                  }
                }}
                size="small"
              />
            </Box>

            {/* Right actions */}
            {!isMobile && (
              <Button
                variant="contained"
                startIcon={<SellIcon />}
                onClick={() => router.push('/sell-a-book')}
                sx={{
                  borderRadius: 3, px: 3, py: 1, fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                               transform: 'translateY(-2px)', boxShadow: theme.shadows[8] }
                }}>
                Sell Book
              </Button>
            )}

            {user ? (
              <Tooltip title="Account settings">
                <Button onClick={handleClick} endIcon={<ArrowDropDownIcon />}
                  sx={{ ml: 1, color: 'text.primary', borderRadius: 3, px: 2 }}>
                  <Avatar src={user.photoURL || undefined}
                    sx={{ width: 32, height: 32, mr: 1 }}>
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </Avatar>
                  {!isMobile && <Typography>{user.displayName || 'User'}</Typography>}
                </Button>
              </Tooltip>
            ) : (
              <Button variant="outlined" onClick={() => router.push('/login')}
                sx={{ borderRadius: 3, ml: 1, px: 3, fontWeight: 600 }}>
                Sign In
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* User menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            mt: 1.5, borderRadius: 2, minWidth: 200,
            '&:before': { content: '""', display: 'block', position: 'absolute',
                          top: 0, right: 14, width: 10, height: 10,
                          bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 }
          }
        }}>
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2">Hi, {user?.displayName || 'User'}!</Typography>
        </Box>
        {userMenuItems.map(item => (
          <MenuItem key={item.label} onClick={() => handleNavigation(item.href)}>
            <ListItemIcon>{item.icon}</ListItemIcon>{item.label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon /></ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>

      {/* Mobile drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={handleMobileToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280 }
        }}>
        {drawer}
      </Drawer>
    </>
  );
}
