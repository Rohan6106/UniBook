"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon,
  
} from "@mui/icons-material";

interface Book {
  _id: string;
  title: string;
  author: string;
  askingPrice: number;
  category?: string; // Changed from genre to match other files
  imageUrls: string[];
}

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const theme = useTheme();
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent link navigation when clicking favorite
    setIsFavorited((prev) => !prev);
  };

  return (
    <Fade in>
      <Link href={`/books/${book._id}`} passHref style={{ textDecoration: 'none', height: '100%' }}>
        <Card
          sx={{
            height: '100%', // <-- 1. CRITICAL: Make card fill the grid item's height
            display: 'flex', // <-- 2. Use Flexbox
            flexDirection: 'column', // <-- 3. Stack items vertically
            borderRadius: 4,
            overflow: "hidden",
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: theme.shadows[8],
            },
          }}
          elevation={0}
        >
          {/* Book Cover */}
          <Box sx={{ position: "relative" }}>
            <CardMedia
              component="img"
              image={book.imageUrls?.[0] || "/images/placeholder-book.jpg"}
              alt={book.title}
              sx={{
                height: 220, // A fixed height for the image area
                objectFit: "cover",
              }}
            />
            <Tooltip title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}>
              <IconButton onClick={handleFavorite} sx={{ /* ... as before ... */ }}>
                {isFavorited ? <FavoriteIcon sx={{ color: "error.main" }} /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            {book.category && (
              <Chip label={book.category} size="small" sx={{ position: "absolute", left: 12, top: 12, /* ... */ }}/>
            )}
          </Box>

          {/* Book Details */}
          <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1 }}> {/* <-- 4. Allow content to grow */}
            <Box sx={{ minHeight: 64 }}> {/* <-- 5. Set a minimum height for the text block */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {book.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                by {book.author}
              </Typography>
            </Box>
          </CardContent>

          {/* Actions - This will be pushed to the bottom */}
          <CardActions sx={{ px: 2, pb: 2, pt: 1, justifyContent: "space-between", alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
              ₹{book.askingPrice.toLocaleString("en-IN")}
            </Typography>
            <Button
              size="small"
              variant="contained"
              endIcon={<VisibilityIcon />}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              View
            </Button>
          </CardActions>
        </Card>
      </Link>
    </Fade>
  );
}