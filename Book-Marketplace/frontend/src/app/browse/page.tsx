"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GridLegacy as Grid } from '@mui/material';

import {
  Box,
  Container,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BookCard from "@/components/BookCard";
import { useDebounce } from 'use-debounce'; // A helpful utility for search inputs
import apiClient from '@/lib/api';
interface Book {
  _id: string;
  title: string;
  author: string;
  askingPrice: number;
  imageUrls: string[];
  category: string;
}

const CATEGORIES = [
  "All", "Fiction", "Non-Fiction", "Science", "Biography", "History", "Comics", "Children", "Other",
];

// --- THIS IS A KEY FIX ---
// The API function now correctly uses the 'keyword' parameter name.
const fetchBooks = async ({ queryKey }: { queryKey: (string | number)[] }) => {
  const [ _key,keyword, category] = queryKey;
  console.log(_key);
  // Define a more specific type for the params object
  const params: { keyword?: string; category?: string } = {};

  if (keyword) {
    params.keyword = keyword as string;
  }
  if (category && category !== "All") {
    params.category = category as string;
  }

  const { data } = await apiClient.get("/books", { params });
  return data.books as Book[];
};

export default function BrowsePage() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Debounce the search term to avoid excessive API calls while typing
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const { data: books, isLoading, isError } = useQuery({
    // The query key now drives the API call directly
    queryKey: ["browse-books", debouncedSearchTerm, activeCategory],
    queryFn: fetchBooks, // Pass the function reference
    placeholderData: (previousData) => previousData, // Keep old data visible while new data loads
  });

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <Box sx={{ pt: { xs: 10, md: 12 }, pb: 8, minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Browse Books
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Find your next favorite book by searching, filtering, or browsing categories.
        </Typography>

        {/* Search Input */}
        <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or author..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                sx: { /* ... your beautiful styling ... */ },
              }}
            />
        </Box>

        {/* Category Chips */}
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              clickable
              onClick={() => handleCategoryChange(cat)}
              sx={{
                px: 2,
                py: 2.5,
                fontWeight: 600,
                fontSize: "0.9rem",
                borderRadius: '16px',
                bgcolor: activeCategory === cat ? 'primary.main' : alpha(theme.palette.background.paper, 0.8),
                color: activeCategory === cat ? 'primary.contrastText' : 'text.primary',
                border: activeCategory === cat ? 0 : `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                transition: "all .2s",
                '&:hover': {
                    bgcolor: activeCategory === cat ? 'primary.dark' : alpha(theme.palette.action.hover, 0.5),
                }
              }}
            />
          ))}
        </Box>

        {/* Books Grid */}
        <Box>
            {isLoading && (
              <Box sx={{ textAlign: "center", py: 8 }}> <CircularProgress /> </Box>
            )}
            {isError && (
              <Alert severity="error" sx={{ my: 4 }}> Failed to load books. Please try again later. </Alert>
            )}
            {!isLoading && !isError && books?.length === 0 && (
              <Typography variant="h6" color="text.secondary" sx={{ mt: 6, textAlign: "center" }}>
                No books found. Try adjusting your search or filters.
              </Typography>
            )}
            <Grid container spacing={4}>
                {books?.map((book: Book) => (
                  <Grid item key={book._id} xs={12} sm={6} md={4} lg={3}>
                    <BookCard book={book} />
                  </Grid>
                ))}
            </Grid>
        </Box>
      </Container>
    </Box>
  );
}