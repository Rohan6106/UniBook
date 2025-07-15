"use client";

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { GridLegacy as Grid } from '@mui/material';

import {
  Box, Container, Typography, CircularProgress, Alert
} from '@mui/material';
import BookCard from '@/components/BookCard';
 // We'll create a reusable SearchBar
import apiClient from '@/lib/api';
interface Book {
  _id: string;
  title: string;
  author: string;
  askingPrice: number;
  imageUrls: string[];
  category: string;
}

// API function now uses the correct route and query parameter 'q'
const fetchSearchResults = async (query: string): Promise<Book[]> => {
  if (!query) return []; // Don't make an API call if the query is empty
  const { data } = await apiClient.get(`/books/search`, {
    params: { q: query }
  });
  return data.books as Book[];
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: books, isLoading, isError, error } = useQuery({
    queryKey: ['search-books', query], // The query is driven by the URL parameter
    queryFn: () => fetchSearchResults(query),
    enabled: !!query, // The query will only run if there is a query parameter in the URL
  });

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: 8 }}>
      {/* SearchBar is now its own component, placed at the top */}
      <Box sx={{ mb: 5 }}>
       
      </Box>

      {/* Results Header */}
      {query && (
         <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Results for &quot;{query}&quot;
        </Typography>
      )}
      {!query && (
         <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Search for Books
        </Typography>
      )}

      {/* Render States */}
      {isLoading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ my: 4 }}>
          Failed to load search results: {(error as Error).message}
        </Alert>
      )}

      {!isLoading && !isError && books && books.length === 0 && query && (
        <Alert severity="info" sx={{ my: 4 }}>
          No books found for &quot;{query}&quot;. Please try a different search term.
        </Alert>
      )}

      {/* Results Grid */}
      <Grid container spacing={4}>
        {books?.map(book => (
          <Grid item key={book._id} xs={12} sm={6} md={4} lg={3}>
            <BookCard book={book} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}