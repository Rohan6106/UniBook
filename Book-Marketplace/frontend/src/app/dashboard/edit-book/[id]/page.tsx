"use client";

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { bookSchema, BookFormData } from '@/schemas/bookSchema';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GridLegacy as Grid } from '@mui/material';

import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
  Alert,
  Fade,
  Slide,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment,
  alpha,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Book as BookIcon,
  Category as CategoryIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  Description as DescriptionIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import apiClient from '@/lib/api';

// Type definitions
interface FullBook {
  _id: string;
  title: string;
  author: string;
  mrp: number;
  askingPrice: number;
  age: string;
  condition: string;
  category: string;
  description: string;
  location: string;
  imageUrls: string[];
}

// API functions
const fetchBookToEdit = async (id: string): Promise<FullBook> => {
  const { data } = await apiClient.get(`/books/${id}`);
  return data;
};

type UpdateBookPayload = {
  bookId: string;
  bookData: Omit<BookFormData, 'images'>;
  token: string;
};

const updateBookListing = async ({ bookId, bookData, token }: UpdateBookPayload) => {
  const { data } = await apiClient.put(
    `/books/${bookId}`,
    bookData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export default function EditBookPage() {
  const { idToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  const queryClient = useQueryClient();
  
  
  const [mounted, setMounted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch the existing book data
  const { data: bookData, isLoading: isBookLoading, isError: isBookError } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => fetchBookToEdit(bookId),
    enabled: !!bookId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    control
  } = useForm<Omit<BookFormData, 'images'>>({
    resolver: yupResolver(bookSchema.omit(['images'])),
  });

  // Watch all form values to detect changes
  const watchedValues = watch();

  useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty]);

  // When the book data loads, populate the form
  useEffect(() => {
    if (bookData) {
      const { ...formData } = bookData;
      reset(formData);
    }
  }, [bookData, reset]);

  const mutation = useMutation({
    mutationFn: (formData: Omit<BookFormData, 'images'>) => {
      if (!idToken) throw new Error('Not authenticated');
      return updateBookListing({ bookId, bookData: formData, token: idToken });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      router.push('/dashboard/my-ads');
    },
  });

  // Calculate price difference for discount display
  const priceDiff = watchedValues.mrp && watchedValues.askingPrice 
    ? Math.max(Number(watchedValues.mrp) - Number(watchedValues.askingPrice), 0)
    : 0;

  if (!mounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isBookLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading book details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (isBookError) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            background: alpha('#ef4444', 0.1),
            border: `1px solid ${alpha('#ef4444', 0.2)}`
          }}
        >
          Failed to load book data. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        py: { xs: 4, md: 6 }
      }}
    >
      <Container maxWidth="md">
        <Slide direction="up" in={mounted} timeout={800}>
          <Box>
            {/* Header with Back Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
              <Tooltip title="Back to My Ads">
                <IconButton 
                  onClick={() => router.back()}
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.9),
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 1),
                      transform: 'translateX(-2px)'
                    }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontFamily: 'var(--font-playfair-display)',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2rem', md: '3rem' }
                  }}
                >
                  Edit Your Listing
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Update your book details to attract more buyers
                </Typography>
              </Box>

              {/* Status Indicator */}
              {hasChanges && (
                <Fade in={true}>
                  <Chip
                    icon={<EditIcon />}
                    label="Unsaved Changes"
                    color="warning"
                    variant="outlined"
                    sx={{ 
                      fontWeight: 600,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.7 },
                        '100%': { opacity: 1 }
                      }
                    }}
                  />
                </Fade>
              )}
            </Box>

            {/* Main Form Card */}
            <Paper
              sx={{
                borderRadius: 6,
                background: alpha('#ffffff', 0.1),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha('#ffffff', 0.2)}`,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}
            >
              {/* Progress Bar for Form Completion */}
              <LinearProgress 
                variant="determinate" 
                value={75} // You can calculate this based on filled fields
                sx={{
                  height: 4,
                  backgroundColor: alpha('#667eea', 0.2),
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }
                }}
              />

              <Box sx={{ p: { xs: 3, md: 6 } }}>
                <Box 
                  component="form" 
                  onSubmit={handleSubmit((data) => mutation.mutate(data))} 
                  noValidate
                >
                  {/* Error Alert */}
                  {mutation.isError && (
                    <Fade in={true}>
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 4,
                          borderRadius: 3,
                          background: alpha('#ef4444', 0.1),
                          border: `1px solid ${alpha('#ef4444', 0.2)}`
                        }}
                      >
                        {(mutation.error as Error).message || 'Update failed. Please try again.'}
                      </Alert>
                    </Fade>
                  )}

                  {/* Book Information Section */}
                  <Box sx={{ mb: 5 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontFamily: 'var(--font-playfair-display)',
                        fontWeight: 600,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <BookIcon sx={{ color: 'primary.main' }} />
                      Book Information
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          {...register('title')}
                          label="Book Title"
                          fullWidth
                          required
                          error={!!errors.title}
                          helperText={errors.title?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BookIcon sx={{ color: 'text.secondary' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: alpha('#ffffff', 0.8),
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: alpha('#ffffff', 0.9),
                              },
                              '&.Mui-focused': {
                                background: alpha('#ffffff', 1),
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                              }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          {...register('author')}
                          label="Author"
                          fullWidth
                          required
                          error={!!errors.author}
                          helperText={errors.author?.message}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: alpha('#ffffff', 0.8),
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: alpha('#ffffff', 0.9),
                              },
                              '&.Mui-focused': {
                                background: alpha('#ffffff', 1),
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                              }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          {...register('category')}
                          label="Category"
                          placeholder="e.g., Fiction, Science, History"
                          fullWidth
                          required
                          error={!!errors.category}
                          helperText={errors.category?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CategoryIcon sx={{ color: 'text.secondary' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: alpha('#ffffff', 0.8),
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: alpha('#ffffff', 0.9),
                              },
                              '&.Mui-focused': {
                                background: alpha('#ffffff', 1),
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                              }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          {...register('location')}
                          label="Location"
                          placeholder="e.g., Mumbai, MH"
                          fullWidth
                          required
                          error={!!errors.location}
                          helperText={errors.location?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon sx={{ color: 'text.secondary' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: alpha('#ffffff', 0.8),
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: alpha('#ffffff', 0.9),
                              },
                              '&.Mui-focused': {
                                background: alpha('#ffffff', 1),
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 4, opacity: 0.3 }} />

                  {/* Pricing Section */}
                  <Box sx={{ mb: 5 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontFamily: 'var(--font-playfair-display)',
                        fontWeight: 600,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <AttachMoneyIcon sx={{ color: 'primary.main' }} />
                      Pricing Information
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          {...register('mrp')}
                          label="Original MRP"
                          type="number"
                          fullWidth
                          required
                          error={!!errors.mrp}
                          helperText={errors.mrp?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                ₹
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: alpha('#ffffff', 0.8),
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: alpha('#ffffff', 0.9),
                              },
                              '&.Mui-focused': {
                                background: alpha('#ffffff', 1),
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                              }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          {...register('askingPrice')}
                          label="Your Asking Price"
                          type="number"
                          fullWidth
                          required
                          error={!!errors.askingPrice}
                          helperText={errors.askingPrice?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                ₹
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: alpha('#ffffff', 0.8),
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: alpha('#ffffff', 0.9),
                              },
                              '&.Mui-focused': {
                                background: alpha('#ffffff', 1),
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                              }
                            }
                          }}
                        />
                      </Grid>

                      {/* Price Calculator */}
                      {priceDiff > 0 && (
                        <Grid item xs={12}>
                          <Fade in={true}>
                            <Card
                              sx={{
                                background: alpha('#10b981', 0.1),
                                border: `1px solid ${alpha('#10b981', 0.2)}`,
                                borderRadius: 3
                              }}
                            >
                              <CardContent sx={{ py: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <CheckCircleIcon sx={{ color: '#10b981' }} />
                                  <Box>
                                    <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 600 }}>
                                      Great Deal!
                                    </Typography>
                                    <Typography variant="body2">
                                      You&apos;re offering a <strong>{Math.round((priceDiff / Number(watchedValues.mrp)) * 100)}% discount</strong> from the original price.
                                      Buyers save ₹{priceDiff.toLocaleString('en-IN')}!
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Fade>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 4, opacity: 0.3 }} />

                  {/* Condition & Age Section */}
                  <Box sx={{ mb: 5 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontFamily: 'var(--font-playfair-display)',
                        fontWeight: 600,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <CalendarTodayIcon sx={{ color: 'primary.main' }} />
                      Book Condition & Age
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl 
                          fullWidth 
                          required 
                          error={!!errors.age}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: alpha('#ffffff', 0.8),
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: alpha('#ffffff', 0.9),
                              },
                              '&.Mui-focused': {
                                background: alpha('#ffffff', 1),
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                              }
                            }
                          }}
                        >
                          <InputLabel>Book Age</InputLabel>
                          <Controller
                            name="age"
                            control={control}
                            render={({ field }) => (
                              <Select {...field} label="Book Age">
                                <MenuItem value="0-1 years">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label="New" color="success" size="small" />
                                    0-1 years
                                  </Box>
                                </MenuItem>
                                <MenuItem value="1-3 years">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label="Recent" color="primary" size="small" />
                                    1-3 years
                                  </Box>
                                </MenuItem>
                                <MenuItem value="3-5 years">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label="Good" color="warning" size="small" />
                                    3-5 years
                                  </Box>
                                </MenuItem>
                                <MenuItem value="5+ years">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label="Vintage" color="default" size="small" />
                                    5+ years
                                  </Box>
                                </MenuItem>
                              </Select>
                            )}
                          />
                          <FormHelperText>{errors.age?.message}</FormHelperText>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl 
                          fullWidth 
                          required 
                          error={!!errors.condition}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: alpha('#ffffff', 0.8),
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: alpha('#ffffff', 0.9),
                              },
                              '&.Mui-focused': {
                                background: alpha('#ffffff', 1),
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                              }
                            }
                          }}
                        >
                          <InputLabel>Condition</InputLabel>
                          <Controller
                            name="condition"
                            control={control}
                            render={({ field }) => (
                              <Select {...field} label="Condition">
                                <MenuItem value="Like New">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                                    Like New
                                  </Box>
                                </MenuItem>
                                <MenuItem value="Good">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon sx={{ color: '#0891b2', fontSize: 18 }} />
                                    Good
                                  </Box>
                                </MenuItem>
                                <MenuItem value="Acceptable">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WarningIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                                    Acceptable
                                  </Box>
                                </MenuItem>
                              </Select>
                            )}
                          />
                          <FormHelperText>{errors.condition?.message}</FormHelperText>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 4, opacity: 0.3 }} />

                  {/* Description Section */}
                  <Box sx={{ mb: 5 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontFamily: 'var(--font-playfair-display)',
                        fontWeight: 600,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <DescriptionIcon sx={{ color: 'primary.main' }} />
                      Description
                    </Typography>
                    
                    <TextField
                      {...register('description')}
                      label="Describe your book"
                      placeholder="Tell potential buyers about the book's condition, any highlights, why you're selling it..."
                      multiline
                      rows={4}
                      fullWidth
                      required
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: alpha('#ffffff', 0.8),
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: alpha('#ffffff', 0.9),
                          },
                          '&.Mui-focused': {
                            background: alpha('#ffffff', 1),
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                          }
                        }
                      }}
                    />
                  </Box>

                  {/* Image Notice */}
                  <Alert 
                    severity="info" 
                    icon={<EditIcon />}
                    sx={{ 
                      mb: 4,
                      borderRadius: 3,
                      background: alpha('#0891b2', 0.1),
                      border: `1px solid ${alpha('#0891b2', 0.2)}`
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Note: Image editing is not supported at this time. Your original images will be preserved.
                    </Typography>
                  </Alert>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, pt: 4 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => router.back()}
                      startIcon={<CancelIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        }
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={mutation.isPending || !hasChanges}
                      startIcon={
                        mutation.isPending ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      sx={{
                        px: 6,
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
                        '&:disabled': {
                          background: alpha('#667eea', 0.4),
                          transform: 'none',
                          boxShadow: 'none'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {mutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Slide>
      </Container>
    </Box>
  );
}
