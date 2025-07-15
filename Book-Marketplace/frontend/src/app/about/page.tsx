// src/app/about/page.tsx

"use client";

import { Box, Container, Typography, Paper,  useTheme, alpha } from "@mui/material";
import BookIcon from "@mui/icons-material/AutoStories";


export default function AboutPage() {
  const theme = useTheme();

  return (
    <Box sx={{ pt: { xs: 10, md: 12 }, pb: 8, bgcolor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth="md">
        <Paper
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.8),
            boxShadow: theme.shadows[4],
            mb: 6,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <BookIcon sx={{ fontSize: 40, color: "primary.main", mr: 1 }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              About BookMarket
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Welcome to BookMarket — your trusted platform for buying and selling pre-loved books.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <b>BookMarket</b> was created by <b>Ishant Deoghare</b>, a fourth year student studying at PICT. Our mission is to make book trading seamless, secure, and enjoyable for everyone.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            The platform is designed with a focus on:
          </Typography>
          <ul>
            <li>
              <b>Modern, intuitive UI/UX</b> for effortless browsing, listing, and chatting.
            </li>
            <li>
              <b>Robust search and filtering</b> to help you find the perfect book.
            </li>
            <li>
              <b>Real-time messaging</b> for smooth buyer-seller communication.
            </li>
            <li>
              <b>Secure, scalable backend</b> built with best-in-class technologies.
            </li>
          </ul>
        
           
         
        </Paper>
      </Container>
    </Box>
  );
}
