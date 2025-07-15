"use client";

import Link from 'next/link';
import { Box, Container, Typography, Link as MuiLink, IconButton, Divider } from '@mui/material';
import { Instagram, LinkedIn, GitHub } from '@mui/icons-material';
import BookIcon from '@mui/icons-material/MenuBook';
import { GridLegacy as Grid } from '@mui/material';

// A helper component for consistent link styling
const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <MuiLink
        component={Link}
        href={href}
        variant="body2"
        color="text.secondary"
        underline="hover"
        sx={{ 
            display: 'block', 
            mb: 1,
            transition: 'color 0.2s ease-in-out',
            '&:hover': { color: 'primary.main' }
        }}
    >
        {children}
    </MuiLink>
);

export default function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper', 
        color: 'text.secondary',
        py: { xs: 5, md: 8 }, 
        borderTop: 1, 
        borderColor: 'divider' 
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          {/* Column 1: Brand & Newsletter */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BookIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '2rem' }} />
                <Typography variant="h5" component="div" sx={{ fontFamily: 'var(--font-playfair-display)', fontWeight: 'bold' }}>
                    BookMarket
                </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, maxWidth: '350px' }}>
              The community marketplace for students and avid readers. Join us to give your books a new chapter.
            </Typography>
            
            
          </Grid>

          {/* Spacer Column */}
          <Grid item xs={false} md={1} />

          {/* Column 2, 3, 4: Link Columns */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={5}>
              <Grid item xs={6} sm={4}>
                <Typography variant="overline" fontWeight="bold" color="text.primary">Marketplace</Typography>
                <FooterLink href="/browse">Browse Books</FooterLink>
                <FooterLink href="/categoriies">Categories</FooterLink>
                <FooterLink href="/sell-a-book">Sell Your Book</FooterLink>
              </Grid>

              <Grid item xs={6} sm={4}>
                <Typography variant="overline" fontWeight="bold" color="text.primary">Company</Typography>
                <FooterLink href="/about">About Us</FooterLink>
                <FooterLink href="/contact">Contact</FooterLink>
                
              </Grid>

              
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary" alignItems={"center"}>
            © {new Date().getFullYear()} BookMarket. All rights reserved.
          </Typography>
          <Box>
            
            <IconButton href="https://www.instagram.com/ishant_deoghare/" aria-label="Instagram" sx={{ color: 'text.secondary' }}><Instagram /></IconButton>
            <IconButton href="https://www.linkedin.com/in/ishant-deoghare-47321325b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" aria-label="LinkedIn" sx={{ color: 'text.secondary' }}><LinkedIn /></IconButton>
            <IconButton href="https://github.com/IshantDeoghare" aria-label="Instagram" sx={{ color: 'text.secondary' }}><GitHub/></IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}