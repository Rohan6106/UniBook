"use client";

import { useState } from 'react';
// --- THIS IS THE FIX ---
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
// --- END OF FIX ---
import SearchIcon from '@mui/icons-material/Search';

interface SearchBoxProps {
  onSearch: (keyword: string) => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [keyword, setKeyword] = useState('');

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <Box component="form" onSubmit={submitHandler} sx={{ width: '100%', mb: 4 }}>
      <TextField
        fullWidth
        variant="outlined"
        label="Search by Title or Author..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton type="submit" edge="end">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}