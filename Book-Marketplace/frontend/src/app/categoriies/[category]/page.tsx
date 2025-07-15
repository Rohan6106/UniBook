"use client";
//E:\pro-book-marketplace\frontend\src\app\categoriies\[category]\page.tsx
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GridLegacy as Grid } from '@mui/material';

import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  
  Button,
  CircularProgress,
  Alert,
  
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import BookCard from "@/components/BookCard";
import apiClient from '@/lib/api';

interface Book {
  _id: string;
  title: string;
  author: string;
  askingPrice: number;
  imageUrls: string[];
  category: string;
}
export default function CategoryBooksPage() {
  
  const { category } = useParams<{ category: string }>();
  const catLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : "";

  // Fetch books for this category
  const { data: books, isLoading, isError } = useQuery({
    queryKey: ["category-books", category],
    queryFn: async () => {
      const { data } = await apiClient.get("/books", {
        params: { category: category },
      });
      return data.books;
    },
  });

  return (
    <Box sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 8, md: 10 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        {/* Back to Categories */}
        <Button
          component={Link}
          href="/categoriies"
          startIcon={<ChevronLeftIcon />}
          sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
        >
          All Categories
        </Button>

        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {catLabel} Books
        </Typography>

        {/* Book Grid */}
        {isLoading && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {isError && (
          <Alert severity="error" sx={{ my: 4 }}>
            Failed to load books. Please try again.
          </Alert>
        )}
        {books && books.length === 0 && (
          <Typography variant="h6" sx={{ textAlign: "center", mt: 8 }}>
            No books found in {catLabel}.
          </Typography>
        )}
        {books && books.length > 0 && (
          <Grid container spacing={4}>
            {books.map((book: Book) => (
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
