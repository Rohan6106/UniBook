"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import Link from 'next/link';
import {
  Box, Container, Typography, Button,Chip, 
  CircularProgress, Alert, useTheme, alpha
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CategoryIcon from '@mui/icons-material/Category';
import ScienceIcon from '@mui/icons-material/Science';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BookCard from '@/components/BookCard';
import apiClient from '@/lib/api';
import { GridLegacy as Grid } from '@mui/material';

interface Book { _id: string; title: string; author: string; askingPrice: number; imageUrls: string[]; }

const fetchBooks = async () => {
  const { data } = await apiClient.get('/books?pageSize=8');
  return data.books as Book[];
};

const CATEGORIES = [
  { name: 'Fiction',      icon: <AutoStoriesIcon /> },
  { name: 'Non-Fiction',  icon: <HistoryEduIcon /> },
  { name: 'Science',      icon: <ScienceIcon /> },
  { name: 'All Categories', icon: <CategoryIcon /> }
];

export default function HomePage() {
  const theme = useTheme();
  const { data: books, isLoading, isError } = useQuery({ queryKey: ['home-books'], queryFn: fetchBooks });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Box sx={{ pt: { xs: 8, md: 10 } }}>
      {/* ---------------- Hero ---------------- */}
      <Box
        sx={{
          position: 'relative',
          textAlign: 'center',
          px: 2, py: { xs: 10, md: 16 },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          color: 'white',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
            Your Next Chapter Awaits
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Discover, sell & share pre-loved books with a vibrant community.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/browse"
            sx={{
              px: 4, py: 1.5, fontSize: '1.1rem',
              background: alpha('#ffffff', 0.2),
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(6px)',
              '&:hover': { background: alpha('#ffffff', 0.3), transform: 'translateY(-2px)' }
            }}>
            Start Exploring
            <ChevronRightIcon sx={{ ml: 1 }} />
          </Button>
        </Container>

        {/* subtle floating books */}
        {[...Array(6)].map((_, i) => (
          <Box key={i}
            sx={{
              position: 'absolute',
              width: 120, height: 160, opacity: 0.15,
              bgcolor: alpha('#ffffff', 0.1),
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 2,
              transform: `rotate(${i * 15}deg)`,
              top: `${10 + i * 12}%`,
              left: `${(i % 3) * 30 + 5}%`,
              animation: 'float 6s ease-in-out infinite alternate'
            }} />
        ))}
        <style jsx global>{`
          @keyframes float { from { transform: translateY(0) rotate(0deg) } to { transform: translateY(-20px) rotate(3deg) } }
        `}</style>
      </Box>

      {/* ------------- Categories ------------- */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Browse by Genre</Typography>
        <Grid container spacing={3} justifyContent="center">
          {CATEGORIES.map(cat => (
            <Grid  key={cat.name}>
              <Chip
                icon={cat.icon}
                label={cat.name}
                clickable
                component={Link}
                href={cat.name === 'All Categories' ? '/browse' : `/categoriies/${cat.name.toLowerCase()}`}
                sx={{
                  px: 2, py: 2, fontSize: '1rem', borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) }
                }} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ----------- Featured Books ----------- */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Recently Added</Typography>
          <Button component={Link} href="/browse" endIcon={<ChevronRightIcon />}>See All</Button>
        </Box>

        {isLoading && <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>}
        {isError && <Alert severity="error" sx={{ my: 4 }}>Failed to load books.</Alert>}
        {books && (
          <Grid container spacing={4}>
            {books.map(book => (
              <Grid item key={book._id} xs={12} sm={6} md={4} lg={3}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
