"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Slide,
  CircularProgress,
  Link as MuiLink,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Google as GoogleIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  BookmarkBorder as BookIcon,
  ArrowForward as ArrowForwardIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setMounted(true);
  }, []);

  // If user is already logged in, redirect them to the home page
  if (user && mounted) {
    router.push('/');
    return null;
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err) {
      setError('Failed to sign in with Google.Please try again.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err : unknown) {
      setError("Invalid email or password. Please check your credentials and try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!mounted) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 70%, #f5576c 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        overflow: 'hidden',
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        // Animated background elements
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, ${alpha('#ffffff', 0.1)} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'float 20s linear infinite',
        },
        '@keyframes float': {
          '0%': { transform: 'translateX(-50px) translateY(-50px)' },
          '100%': { transform: 'translateX(50px) translateY(50px)' }
        }
      }}
    >
      <Container component="main" maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Slide direction="up" in={mounted} timeout={800}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '80vh',
            }}
          >
            {/* Main Container with Split Layout */}
            <Paper
              elevation={24}
              sx={{
                display: 'flex',
                borderRadius: 6,
                overflow: 'hidden',
                maxWidth: 1000,
                width: '100%',
                minHeight: 600,
                // Glassmorphism effect
                background: alpha('#ffffff', 0.1),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha('#ffffff', 0.2)}`,
                boxShadow: `0 8px 32px ${alpha('#000000', 0.1)}`,
                flexDirection: { xs: 'column', md: 'row' }
              }}
            >
              {/* Left Side - Welcome Section (Hidden on mobile) */}
              {!isMobile && (
                <Fade in={mounted} timeout={1200}>
                  <Box
                    sx={{
                      flex: 1,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      p: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      color: 'white',
                      position: 'relative'
                    }}
                  >
                    {/* Logo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <BookIcon sx={{ fontSize: 48, mr: 2, color: '#ffffff' }} />
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: 'var(--font-playfair-display)',
                          fontWeight: 700,
                          color: '#ffffff'
                        }}
                      >
                        BookMarket
                      </Typography>
                    </Box>

                    <Typography
                      variant="h3"
                      sx={{
                        fontFamily: 'var(--font-playfair-display)',
                        fontWeight: 700,
                        mb: 3,
                        lineHeight: 1.2
                      }}
                    >
                      Welcome Back to Your Literary Journey
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                      Discover, buy, and sell amazing books with our vibrant community of book lovers.
                    </Typography>

                    {/* Feature Highlights */}
                    <Box sx={{ mt: 4 }}>
                      {[
                        { icon: <BookIcon />, text: 'Vast collection of pre-loved books' },
                        { icon: <SecurityIcon />, text: 'Secure & trusted transactions' },
                        { icon: <SpeedIcon />, text: 'Lightning-fast search & discovery' }
                      ].map((feature, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: alpha('#ffffff', 0.2),
                              mr: 2
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {feature.text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Fade>
              )}

              {/* Right Side - Login Form */}
              <Fade in={mounted} timeout={1000}>
                <Box
                  sx={{
                    flex: 1,
                    p: { xs: 4, md: 6 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: alpha('#ffffff', 0.95),
                    backdropFilter: 'blur(10px)',
                    position: 'relative'
                  }}
                >
                  {/* Mobile Logo */}
                  {isMobile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                      <BookIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: 'var(--font-playfair-display)',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        BookMarket
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'var(--font-playfair-display)',
                      fontWeight: 700,
                      mb: 1,
                      textAlign: 'center',
                      color: 'text.primary'
                    }}
                  >
                    Sign In
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      textAlign: 'center',
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    Enter your credentials to access your account
                  </Typography>

                  {error && (
                    <Fade in={Boolean(error)}>
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 3,
                          borderRadius: 3,
                          backgroundColor: alpha('#ef4444', 0.1),
                          border: `1px solid ${alpha('#ef4444', 0.2)}`
                        }}
                        onClose={() => setError(null)}
                      >
                        {error}
                      </Alert>
                    </Fade>
                  )}

                  {/* Google Sign In Button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
                    sx={{
                      mb: 3,
                      py: 1.5,
                      borderRadius: 3,
                      borderWidth: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: alpha('#ffffff', 0.8),
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha('#000000', 0.15)}`,
                        background: alpha('#ffffff', 0.9)
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    Continue with Google
                  </Button>

                  {/* Divider */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Divider sx={{ flex: 1, borderColor: alpha('#000000', 0.1) }} />
                    <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary', fontWeight: 500 }}>
                      OR
                    </Typography>
                    <Divider sx={{ flex: 1, borderColor: alpha('#000000', 0.1) }} />
                  </Box>

                  {/* Email/Password Form */}
                  <Box component="form" onSubmit={handleEmailSignIn} noValidate>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: alpha('#ffffff', 0.8),
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: alpha('#ffffff', 0.9),
                          },
                          '&.Mui-focused': {
                            background: alpha('#ffffff', 1),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 20px ${alpha('#667eea', 0.2)}`,
                          }
                        }
                      }}
                    />

                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={togglePasswordVisibility}
                              edge="end"
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main' }
                              }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: alpha('#ffffff', 0.8),
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: alpha('#ffffff', 0.9),
                          },
                          '&.Mui-focused': {
                            background: alpha('#ffffff', 1),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 20px ${alpha('#667eea', 0.2)}`,
                          }
                        }
                      }}
                    />

                    {/* Remember Me & Forgot Password */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            sx={{
                              color: 'text.secondary',
                              '&.Mui-checked': { color: 'primary.main' }
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Remember me
                          </Typography>
                        }
                      />
                      <Link href="/forgot-password" passHref>
                        <MuiLink
                          variant="body2"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            fontWeight: 600,
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          Forgot password?
                        </MuiLink>
                      </Link>
                    </Box>

                    {/* Sign In Button */}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading || !email || !password}
                      endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: `0 4px 20px ${alpha('#667eea', 0.4)}`,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 30px ${alpha('#667eea', 0.5)}`,
                        },
                        '&:disabled': {
                          background: alpha('#667eea', 0.4),
                          transform: 'none',
                          boxShadow: 'none'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </Box>

                  {/* Sign Up Link */}
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Don&apos;t have an account?{' '}
                      <Link href="/register" passHref>
                        <MuiLink
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            fontWeight: 600,
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          Sign up here
                        </MuiLink>
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </Paper>
          </Box>
        </Slide>
      </Container>
    </Box>
  );
}
