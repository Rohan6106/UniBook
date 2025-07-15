// E:\pro-book-marketplace\frontend\src\app\contact/page.tsx

"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BookIcon from "@mui/icons-material/AutoStories";

export default function ContactPage() {
  const theme = useTheme();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    // Here you would send the form to your backend/email service
    setSubmitted(true);
  };

  return (
    <Box sx={{ pt: { xs: 10, md: 12 }, pb: 8, bgcolor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.85),
            boxShadow: theme.shadows[4],
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
            <BookIcon sx={{ fontSize: 36, color: "primary.main", mr: 1 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Contact Us
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Have a question, suggestion, or need help? Reach out and we&apos;ll get back to you soon.
          </Typography>
          {submitted ? (
            <Alert severity="success" sx={{ my: 4 }}>
              Thank you for contacting us! We&apos;ll respond as soon as possible.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Your Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Your Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Message"
                name="message"
                value={form.message}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Send Message
              </Button>
            </Box>
          )}
          <Box sx={{ mt: 4, textAlign: "left" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Or contact us directly:
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <EmailIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="body2">ishant1234deoghare@gmail.com</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PhoneIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="body2">+91 9067754263</Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
