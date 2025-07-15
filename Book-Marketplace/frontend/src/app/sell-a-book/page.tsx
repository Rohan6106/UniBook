// E:\pro-book-marketplace\frontend\src\app\sell-a-book\page.tsx

"use client";

import { useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { GridLegacy as Grid } from '@mui/material';

import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { bookSchema, BookFormData } from '@/schemas/bookSchema';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';

// --- API Functions ---
const getUploadUrl = async (fileType: string, token: string) =>
  (await apiClient.post('/books/upload-url', { fileType }, { headers: { Authorization: `Bearer ${token}` } })).data;

const uploadToS3 = (uploadUrl: string, file: File) =>
  axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });

const createListing = async (
  data: Omit<BookFormData, 'images'> & { imageUrls: string[] },
  token: string
) =>
  (await apiClient.post('/books', data, { headers: { Authorization: `Bearer ${token}` } })).data;

// --- DropZone Component ---
function DropZone({
  onFiles,
  previews,
  remove,
  error,
}: {
  onFiles: (files: File[]) => void;
  previews: string[];
  remove: (idx: number) => void;
  error?: string;
}) {
  const theme = useTheme();
  const [drag, setDrag] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const files = Array.from(e.dataTransfer.files).slice(0, 5);
    onFiles(files);
  };

  return (
    <Paper
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      sx={{
        p: 4,
        textAlign: 'center',
        border: `2px dashed ${
          drag
            ? theme.palette.primary.main
            : alpha(theme.palette.text.primary, 0.3)
        }`,
        borderRadius: 4,
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        transition: 'all .3s',
        cursor: 'pointer',
      }}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <UploadIcon
        sx={{ fontSize: 48, mb: 1, color: theme.palette.primary.main }}
      />
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        {drag ? 'Release to upload' : 'Drag & Drop or Click to Upload (max 5)'}
      </Typography>
      <input
        id="fileInput"
        type="file"
        hidden
        accept="image/*"
        multiple
        onChange={(e) =>
          e.target.files && onFiles(Array.from(e.target.files).slice(0, 5))
        }
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {previews.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 3 }}>
          {previews.map((src, i) => (
            <Grid item xs={6} sm={4} md={3} key={src}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: 120,
                  '&:hover .overlay': { opacity: 1 },
                }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="200px"
                  style={{ objectFit: 'cover' }}
                />
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: alpha('#000', 0.5),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity .2s',
                  }}
                >
                  <IconButton
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(i);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}

// --- Main Page Component ---
export default function SellABookPage() {
  const { user, idToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: yupResolver(bookSchema),
    defaultValues: { condition: 'Good', age: '1-3 years' },
  });

  const [previews, setPreviews] = useState<string[]>([]);
  
  const onFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      clearErrors('images');
      Promise.all(
        files.map(
          (f) =>
            new Promise<string>((res) => {
              const r = new FileReader();
              r.onload = () => res(r.result as string);
              r.readAsDataURL(f);
            })
        )
      ).then(setPreviews);
    },
    [clearErrors]
  );

  const removePreview = (idx: number) =>
    setPreviews((prev) => prev.filter((_, i) => i !== idx));

  const createMutation = useMutation({
    mutationFn: async (form: BookFormData) => {
      if (!idToken) throw new Error('Please log in again.');
      if (!form.images?.length) {
        setError('images', { message: 'Please select at least one image.' });
        throw new Error('No images');
      }
      const urls: string[] = [];
      for (const file of Array.from(form.images)) {
        if(!file) continue;
        const { uploadUrl, key } = await getUploadUrl(file.type, idToken);
        await uploadToS3(uploadUrl, file);
        urls.push(
          `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`
        );
      }
      const {...data } = form;
      return createListing({ ...data, imageUrls: urls }, idToken);
    },
    onSuccess: (book) => router.push(`/books/${book._id}`),
  });

  if (!user) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h5" gutterBottom>
          Sign-in required to list a book
        </Typography>
        <Button variant="contained" component={Link} href="/login">
          Go to Login
        </Button>
      </Container>
    );
  }

  const priceDiff =
    watch('mrp') && watch('askingPrice')
      ? Math.max(Number(watch('mrp')) - Number(watch('askingPrice')), 0)
      : 0;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Fade in>
        <Paper
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(12px)',
            boxShadow: theme.shadows[8],
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Sell Your Book
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Fill in the details and share your book with thousands of readers.
          </Typography>

          {createMutation.isError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {(createMutation.error as Error).message}
            </Alert>
          )}

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit((d) => createMutation.mutate(d))}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Book Title*"
                  fullWidth
                  {...register('title')}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Author*"
                  fullWidth
                  {...register('author')}
                  error={!!errors.author}
                  helperText={errors.author?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="MRP (₹)*"
                  type="number"
                  fullWidth
                  {...register('mrp')}
                  error={!!errors.mrp}
                  helperText={errors.mrp?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Your Price (₹)*"
                  type="number"
                  fullWidth
                  {...register('askingPrice')}
                  error={!!errors.askingPrice}
                  helperText={errors.askingPrice?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Category*"
                  placeholder="e.g. Fiction, Science"
                  fullWidth
                  {...register('category')}
                  error={!!errors.category}
                  helperText={errors.category?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Location*"
                  placeholder="City, State"
                  fullWidth
                  {...register('location')}
                  error={!!errors.location}
                  helperText={errors.location?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.condition}>
                  <InputLabel>Condition*</InputLabel>
                  <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Condition*">
                        {['Like New', 'Good', 'Acceptable'].map((c) => (
                          <MenuItem key={c} value={c}>
                            {c}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText>{errors.condition?.message}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.age}>
                  <InputLabel>Book Age*</InputLabel>
                  <Controller
                    name="age"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Book Age*">
                        {[
                          '0-1 years',
                          '1-3 years',
                          '3-5 years',
                          '5+ years',
                        ].map((a) => (
                          <MenuItem key={a} value={a}>
                            {a}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText>{errors.age?.message}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description*"
                  multiline
                  rows={4}
                  fullWidth
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="images"
                  control={control}
                  render={({ field }) => (
                    <DropZone
                      onFiles={(files) => {
                        field.onChange(
                          Object.assign(files, {
                            length: files.length,
                            item: (i: number) => files[i],
                          }) as unknown as FileList
                        );
                        onFiles(files);
                      }}
                      previews={previews}
                      remove={(idx) => {
                        removePreview(idx);
                        const remaining = previews.filter((_, i) => i !== idx);
                        if (remaining.length === 0) {
                          field.onChange(null);
                        }
                      }}
                      error={errors.images?.message}
                    />
                  )}
                />
              </Grid>
              {priceDiff > 0 && (
                <Grid item xs={12}>
                  <Fade in>
                    <Alert icon={<CheckIcon />} severity="success">
                      Great deal! Buyers save ₹{priceDiff.toLocaleString('en-IN')} (
                      {Math.round((priceDiff / Number(watch('mrp'))) * 100)}% off MRP)
                    </Alert>
                  </Fade>
                </Grid>
              )}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <Button
                type="submit"
                size="large"
                variant="contained"
                disabled={createMutation.isPending}
                startIcon={
                  createMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : undefined
                }
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Listing'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
}
