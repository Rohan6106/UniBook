// E:\pro-book-marketplace\frontend\src\app\register\page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Slide,

  Link as MuiLink,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import {
  Google as GoogleIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  BookmarkBorder as BookIcon,
 
  Person as PersonIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon
} from "@mui/icons-material";
import Link from "next/link";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setMounted(true);
  }, []);

  if (user && mounted) {
    router.push("/");
    return null;
  }

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: unknown) {
      setError("Failed to sign up with Google. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("You must agree to the terms and privacy policy.");
      return;
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName });
      router.push("/");
    } catch (err: unknown) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
      }}
    >
      <Container maxWidth="lg" sx={{ display: "flex", flex: 1 }}>
        {/* Left Side - Welcome Section (Hidden on mobile) */}
        {!isMobile && (
          <Slide direction="right" in>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                pr: 6
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BookIcon sx={{ fontSize: 40, color: "primary.main", mr: 1 }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >
                  BookMarket
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#fff" }}>
                Join Our Book Community
              </Typography>
              <Typography variant="subtitle1" sx={{ color: alpha("#fff", 0.9), mb: 4 }}>
                Create your account to buy, sell, and discover amazing books with fellow readers.
              </Typography>
              <Box sx={{ mb: 2 }}>
                {[
                  { icon: <PersonIcon color="primary" />, text: "Personalized recommendations" },
                  { icon: <SecurityIcon color="primary" />, text: "Secure & trusted platform" },
                  { icon: <SpeedIcon color="primary" />, text: "Fast, easy, and free" }
                ].map((feature, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    {feature.icon}
                    <Typography sx={{ ml: 1, color: "#fff" }}>{feature.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Slide>
        )}

        {/* Right Side - Register Form */}
        <Fade in>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Paper
              sx={{
                width: "100%",
                maxWidth: 420,
                mx: "auto",
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                background: alpha("#fff", 0.9),
                boxShadow: 8,
                textAlign: "center"
              }}
            >
              {/* Mobile Logo */}
              {isMobile && (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                  <BookIcon sx={{ fontSize: 32, color: "primary.main", mr: 1 }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    BookMarket
                  </Typography>
                </Box>
              )}

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Create Account
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                Sign up to start your book journey
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Google Sign Up Button */}
              <Button
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignUp}
                disabled={loading}
                sx={{
                  mb: 3,
                  py: 1.5,
                  borderRadius: 3,
                  borderWidth: 2,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  background: alpha("#ffffff", 0.8),
                  backdropFilter: "blur(10px)",
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 25px ${alpha("#000000", 0.15)}`,
                    background: alpha("#ffffff", 0.9)
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                Continue with Google
              </Button>

              <Divider sx={{ my: 3 }}>OR</Divider>

              {/* Email/Password Form */}
              <Box component="form" onSubmit={handleRegister} noValidate>
                <TextField
                  label="Your Name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      background: alpha("#ffffff", 0.8),
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": { background: alpha("#ffffff", 0.9) },
                      "&.Mui-focused": {
                        background: alpha("#ffffff", 1),
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 20px ${alpha("#667eea", 0.2)}`
                      }
                    }
                  }}
                />
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      background: alpha("#ffffff", 0.8),
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": { background: alpha("#ffffff", 0.9) },
                      "&.Mui-focused": {
                        background: alpha("#ffffff", 1),
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 20px ${alpha("#667eea", 0.2)}`
                      }
                    }
                  }}
                />
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      background: alpha("#ffffff", 0.8),
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": { background: alpha("#ffffff", 0.9) },
                      "&.Mui-focused": {
                        background: alpha("#ffffff", 1),
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 20px ${alpha("#667eea", 0.2)}`
                      }
                    }
                  }}
                />
                <TextField
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      background: alpha("#ffffff", 0.8),
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": { background: alpha("#ffffff", 0.9) },
                      "&.Mui-focused": {
                        background: alpha("#ffffff", 1),
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 20px ${alpha("#667eea", 0.2)}`
                      }
                    }
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agree}
                      onChange={e => setAgree(e.target.checked)}
                      sx={{
                        color: "text.secondary",
                        "&.Mui-checked": { color: "primary.main" }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      I agree to the{" "}
                      <MuiLink href="/terms" target="_blank" underline="hover">
                        Terms
                      </MuiLink>{" "}
                      and{" "}
                      <MuiLink href="/privacy" target="_blank" underline="hover">
                        Privacy Policy
                      </MuiLink>
                    </Typography>
                  }
                  sx={{ mb: 2, alignItems: "flex-start" }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: `0 4px 20px ${alpha("#667eea", 0.4)}`,
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 30px ${alpha("#667eea", 0.5)}`
                    },
                    "&:disabled": {
                      background: alpha("#667eea", 0.4),
                      transform: "none",
                      boxShadow: "none"
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <MuiLink component={Link} href="/login" underline="hover" sx={{ fontWeight: 600 }}>
                  Sign in here
                </MuiLink>
              </Typography>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
