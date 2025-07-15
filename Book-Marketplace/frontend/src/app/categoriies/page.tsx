"use client";
//E:\pro-book-marketplace\frontend\src\app\categoriies\page.tsx
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
  useTheme,
  alpha,
} from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ScienceIcon from "@mui/icons-material/Science";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import PublicIcon from "@mui/icons-material/Public";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BookIcon from "@mui/icons-material/Book";
import { GridLegacy as Grid } from '@mui/material';

const CATEGORIES = [
  { name: "Fiction", icon: <AutoStoriesIcon /> },
  { name: "Science", icon: <ScienceIcon /> },
  { name: "History", icon: <HistoryEduIcon /> },
  { name: "Non-Fiction", icon: <MenuBookIcon /> },
  { name: "Comics", icon: <BookIcon /> },
  { name: "Children", icon: <ChildCareIcon /> },
  { name: "Romance", icon: <FavoriteIcon /> },
  { name: "Self-help", icon: <PsychologyIcon /> },
  { name: "Biography", icon: <PublicIcon /> },
  { name: "All Categories", icon: <EmojiObjectsIcon /> },
];

export default function CategoriesPage() {
  const theme = useTheme();

  return (
    <Box sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 8, md: 10 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Book Categories
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
          Browse books by your favorite genre or explore something new!
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {CATEGORIES.map((cat) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={cat.name}>
              <Link
                href={
                  cat.name === "All Categories"
                    ? "/browse"
                    : `/categoriies/${encodeURIComponent(cat.name.toLowerCase())}`
                }
                style={{ textDecoration: "none" }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    background: alpha(theme.palette.background.paper, 0.7),
                    backdropFilter: "blur(12px)",
                    boxShadow: theme.shadows[4],
                    transition: "transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1)",
                    "&:hover": {
                      transform: "translateY(-6px) scale(1.03)",
                      boxShadow: theme.shadows[12],
                      background: alpha(theme.palette.primary.main, 0.12),
                    },
                  }}
                >
                  <CardActionArea sx={{ p: 3, textAlign: "center" }}>
                    <Avatar
                      sx={{
                        mx: "auto",
                        width: 56,
                        height: 56,
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                        mb: 2,
                        fontSize: 32,
                      }}
                    >
                      {cat.icon}
                    </Avatar>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: 1,
                          color: "text.primary",
                          mb: 1,
                        }}
                      >
                        {cat.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cat.name === "All Categories"
                          ? "See all available books"
                          : `Explore ${cat.name} books`}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
