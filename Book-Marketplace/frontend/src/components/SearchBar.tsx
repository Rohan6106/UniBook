"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDebounce } from 'use-debounce';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [text, setText] = useState(initialQuery);
  const [debouncedText] = useDebounce(text, 500); // Debounce input by 500ms

  useEffect(() => {
    // This effect triggers when the user stops typing
    if (debouncedText) {
      router.push(`/search?q=${encodeURIComponent(debouncedText)}`);
    } else if (initialQuery && !debouncedText) {
      // If the user clears the search bar, go back to a clean search page
      router.push('/search');
    }
  }, [debouncedText, router, initialQuery]);

  return (
    <TextField
      fullWidth
      value={text}
      onChange={e => setText(e.target.value)}
      placeholder="Search for books, authors, or genres..."
      variant="outlined"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'text.secondary' }} />
          </InputAdornment>
        ),
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 1
        }
      }}
    />
  );
}