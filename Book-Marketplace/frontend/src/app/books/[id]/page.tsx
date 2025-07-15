"use client";

import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  Container,  
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Button, 
  Paper, 
  Divider, 
  Avatar, 
  Chip,
  useTheme, 
  alpha,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link as MuiLink,
  Card,
  CardContent,
  Badge,
  Stack
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { 
  FmdGoodOutlined as LocationIcon,
  MenuBook as BookIcon,
  EventNote as CalendarIcon,
  Category as CategoryIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  NavigateNext as NavigateNextIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Verified as VerifiedIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
interface User { 
  _id: string; 
  name: string; 
  createdAt?: string; 
  firebaseUid: string; 
}

interface FullBook { 
  _id: string; 
  title: string; 
  author: string; 
  mrp: number; 
  askingPrice: number; 
  description: string; 
  location: string; 
  imageUrls: string[]; 
  user: User; 
  createdAt: string; 
  condition: string; 
  age: string; 
  category: string; 
}

const fetchBookById = async (id: string): Promise<FullBook> => {
  const { data } = await apiClient.get(`/books/${id}`);
  return data;
};

export default function BookDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, idToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: book, isLoading, isError} = useQuery<FullBook, Error>({
    queryKey: ['book', id],
    queryFn: () => fetchBookById(id),
    enabled: !!id,
  });

  const handleStartChat = useMutation({
    mutationFn: async () => {
      if (!idToken) throw new Error('You must be logged in.');
      if (!book) throw new Error('Book data is not available.');
      const { data } = await apiClient.post(
        '/chats', 
        { bookId: book._id }, 
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      return data;
    },
    onSuccess: (data) => router.push(`/dashboard/chat/${data._id}`),
    onError: (error: unknown) => { // <-- FIX: Type as unknown
        let errorMessage = 'An unexpected error occurred.';
        if (axios.isAxiosError(error)) { // Use type guard
            errorMessage = error.response?.data?.message || error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        alert(`Could not start chat: ${errorMessage}`);
    },
  });

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!book?.imageUrls.length) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? book.imageUrls.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === book.imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: book?.title,
        text: `Check out this book: ${book?.title} by ${book?.author}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Add toast notification here
    }
  };

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
        }}
      >
        <CircularProgress sx={{ color: 'white' }} size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Could not load book details. Please try again later.
        </Alert>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Book not found.
        </Alert>
      </Container>
    );
  }

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: '100vh',
          pt: { xs: 2, md: 4 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth="xl">
          {/* Breadcrumbs & Navigation */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => router.back()} 
              sx={{ 
                backgroundColor: alpha('#ffffff', 0.9),
                backdropFilter: 'blur(10px)',
                '&:hover': { transform: 'translateX(-2px)' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ flex: 1 }}
            >
              <Link href="/" passHref>
                <MuiLink color="inherit" underline="hover">Home</MuiLink>
              </Link>
              <Link href="/browse" passHref>
                <MuiLink color="inherit" underline="hover">Browse</MuiLink>
              </Link>
              <Link href={`/category/${book.category}`} passHref>
                <MuiLink color="inherit" underline="hover">{book.category}</MuiLink>
              </Link>
              <Typography color="text.primary" sx={{ fontWeight: 600 }}>
                {book.title}
              </Typography>
            </Breadcrumbs>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Share">
                <IconButton 
                  onClick={handleShare}
                  sx={{ 
                    backgroundColor: alpha('#ffffff', 0.9),
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={isFavorited ? "Remove from favorites" : "Add to favorites"}>
                <IconButton 
                  onClick={handleFavoriteToggle}
                  sx={{ 
                    backgroundColor: alpha('#ffffff', 0.9),
                    backdropFilter: 'blur(10px)',
                    color: isFavorited ? '#ef4444' : 'inherit'
                  }}
                >
                  {isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid item xs={12} lg={8}>
              {/* Image Gallery - Fixed Display Issues */}
              <Paper 
                elevation={0}
                sx={{ 
                  position: 'relative', 
                  borderRadius: 6,
                  overflow: 'hidden',
                  mb: 4,
                  background: alpha('#ffffff', 0.1),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha('#ffffff', 0.2)}`,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Box 
                  sx={{ 
                    position: 'relative', 
                    width: '100%',
                    height: { xs: 300, sm: 400, md: 500 },
                    cursor: 'zoom-in'
                  }}
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <Image 
                    src={book.imageUrls[currentImageIndex] || '/images/placeholder-book.jpg'} 
                    alt={book.title}
                    fill
                    style={{ 
                      objectFit: 'contain', // Changed from 'cover' to 'contain' to prevent zooming
                      objectPosition: 'center'
                    }}
                    sizes="(max-width: 960px) 100vw, 60vw"
                    priority
                  />
                  
                  {/* Image Navigation Overlay */}
                  {book.imageUrls.length > 1 && (
                    <>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageNavigation('prev');
                        }}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: alpha('#000000', 0.5),
                          color: 'white',
                          '&:hover': { backgroundColor: alpha('#000000', 0.7) }
                        }}
                      >
                        <ChevronLeftIcon />
                      </IconButton>
                      
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageNavigation('next');
                        }}
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: alpha('#000000', 0.5),
                          color: 'white',
                          '&:hover': { backgroundColor: alpha('#000000', 0.7) }
                        }}
                      >
                        <ChevronRightIcon />
                      </IconButton>
                    </>
                  )}
                  
                  {/* Zoom Icon */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: alpha('#000000', 0.5),
                      color: 'white',
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ZoomInIcon fontSize="small" />
                  </Box>
                  
                  {/* Image Counter */}
                  {book.imageUrls.length > 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        backgroundColor: alpha('#000000', 0.7),
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 3,
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {currentImageIndex + 1} / {book.imageUrls.length}
                    </Box>
                  )}
                </Box>
                
                {/* Thumbnail Navigation */}
                {book.imageUrls.length > 1 && (
                  <Box 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      gap: 1, 
                      overflowX: 'auto',
                      backgroundColor: alpha('#ffffff', 0.05)
                    }}
                  >
                    {book.imageUrls.map((url, index) => (
                      <Box
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        sx={{
                          position: 'relative',
                          width: 80,
                          height: 60,
                          flexShrink: 0,
                          borderRadius: 2,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: currentImageIndex === index 
                            ? `3px solid ${theme.palette.primary.main}` 
                            : '3px solid transparent',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Image 
                          src={url} 
                          alt={`${book.title} ${index + 1}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="80px"
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
              
              {/* Book Details - Glassmorphism Card */}
              <Paper 
                sx={{ 
                  p: 4, 
                  borderRadius: 6,
                  background: alpha('#ffffff', 0.1),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha('#ffffff', 0.2)}`,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontFamily: 'var(--font-playfair-display)',
                    fontWeight: 700,
                    mb: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Book Details
                </Typography>
                
                <Divider sx={{ mb: 3, opacity: 0.3 }} />
                
                <Grid container spacing={3}>
                  {[
                    { icon: <BookIcon />, label: 'Condition', value: book.condition },
                    { icon: <CalendarIcon />, label: 'Book Age', value: book.age },
                    { icon: <CategoryIcon />, label: 'Category', value: book.category },
                    { icon: <LocationIcon />, label: 'Location', value: book.location }
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 3,
                          background: alpha('#ffffff', 0.1),
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha('#ffffff', 0.1)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            color: 'primary.main', 
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: alpha(theme.palette.primary.main, 0.1)
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Box>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {item.label}
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ fontWeight: 600, color: 'text.primary' }}
                          >
                            {item.value}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                <Divider sx={{ my: 4, opacity: 0.3 }} />
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontFamily: 'var(--font-playfair-display)',
                    fontWeight: 600,
                    mb: 3,
                    color: 'text.primary'
                  }}
                >
                  Description
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.8,
                    color: 'text.primary',
                    whiteSpace: 'pre-wrap',
                    fontSize: '1.1rem'
                  }}
                >
                  {book.description}
                </Typography>
              </Paper>
            </Grid>
            
            {/* Sticky Sidebar */}
            <Grid  xs={12} lg={4}>
              <Box 
                sx={{ 
                  position: 'sticky', 
                  top: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3
                }}
              >
                {/* Price Card - Glassmorphism */}
                <Card 
                  sx={{ 
                    background: alpha('#ffffff', 0.1),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    borderRadius: 6,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    overflow: 'visible'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontFamily: 'var(--font-playfair-display)',
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 1
                        }}
                      >
                        ₹{book.askingPrice.toLocaleString('en-IN')}
                      </Typography>
                      
                      {book.mrp && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              textDecoration: 'line-through',
                              color: 'text.secondary',
                              opacity: 0.7
                            }}
                          >
                            MRP: ₹{book.mrp.toLocaleString('en-IN')}
                          </Typography>
                          <Chip 
                            label={`${Math.round((1 - book.askingPrice / book.mrp) * 100)}% OFF`}
                            color="success"
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </Box>
                      )}
                    </Box>
                    
                    <Divider sx={{ mb: 3, opacity: 0.3 }} />
                    
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontFamily: 'var(--font-playfair-display)',
                        fontWeight: 600,
                        mb: 1,
                        textAlign: 'center'
                      }}
                    >
                      {book.title}
                    </Typography>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'text.secondary',
                        textAlign: 'center',
                        mb: 2
                      }}
                    >
                      by {book.author}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                      <Chip 
                        label={book.condition}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Seller Information - Simplified Profile Card (No Ratings/Stats) */}
                <Card 
                  sx={{ 
                    background: alpha('#ffffff', 0.1),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    borderRadius: 6,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        mb: 3,
                        color: 'text.primary'
                      }}
                    >
                      Seller Information
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <VerifiedIcon 
                            sx={{ 
                              color: '#10b981',
                              fontSize: 20,
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              p: 0.2
                            }} 
                          />
                        }
                      >
                        <Avatar 
                          sx={{ 
                            width: 64, 
                            height: 64,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        >
                          {book.user.name.charAt(0)}
                        </Avatar>
                      </Badge>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ fontWeight: 700, mb: 0.5 }}
                        >
                          {book.user.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LocationIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {book.location}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Member since {new Date(book.user.createdAt || book.createdAt).getFullYear()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Action Buttons */}
                    <Stack spacing={2}>
                      {user && book.user.firebaseUid !== user.uid && (
                        <Button 
                          fullWidth 
                          variant="contained" 
                          size="large"
                          onClick={() => handleStartChat.mutate()} 
                          disabled={handleStartChat.isPending}
                          startIcon={handleStartChat.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                          sx={{
                            py: 1.5,
                            borderRadius: 3,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 30px rgba(102, 126, 234, 0.5)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          {handleStartChat.isPending ? 'Connecting...' : 'Chat with Seller'}
                        </Button>
                      )}
                      
                      {user && book.user.firebaseUid === user.uid && (
                        <Button 
                          fullWidth 
                          variant="outlined" 
                          disabled
                          sx={{ py: 1.5, borderRadius: 3, fontSize: '1.1rem' }}
                        >
                          This is Your Listing
                        </Button>
                      )}
                      
                      {!user && (
                        <Button 
                          fullWidth 
                          variant="contained" 
                          size="large"
                          onClick={() => router.push('/login')}
                          sx={{
                            py: 1.5,
                            borderRadius: 3,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            textTransform: 'none'
                          }}
                        >
                          Sign In to Contact Seller
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Image Modal - Full Screen Gallery */}
      {isImageModalOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setIsImageModalOpen(false)}
        >
          <IconButton
            onClick={() => setIsImageModalOpen(false)}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              color: 'white',
              backgroundColor: alpha('#000000', 0.5),
              '&:hover': { backgroundColor: alpha('#000000', 0.7) }
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: 'auto',
              height: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={book.imageUrls[currentImageIndex]}
              alt={book.title}
              width={800}
              height={600}
              style={{ 
                objectFit: 'contain',
                maxWidth: '90vw',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto'
              }}
              sizes="90vw"
            />
            
            {book.imageUrls.length > 1 && (
              <>
                <IconButton
                  onClick={() => handleImageNavigation('prev')}
                  sx={{
                    position: 'absolute',
                    left: -60,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    backgroundColor: alpha('#000000', 0.5),
                    '&:hover': { backgroundColor: alpha('#000000', 0.7) }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                
                <IconButton
                  onClick={() => handleImageNavigation('next')}
                  sx={{
                    position: 'absolute',
                    right: -60,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    backgroundColor: alpha('#000000', 0.5),
                    '&:hover': { backgroundColor: alpha('#000000', 0.7) }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
