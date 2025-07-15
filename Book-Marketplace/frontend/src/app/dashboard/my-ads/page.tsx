"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';
import { Button, Box, Typography, Card, CardContent, CardActions, CardMedia, CircularProgress, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
interface Book {
  _id: string;
  title: string;
  askingPrice: number;
  imageUrls: string[];
}
import { GridLegacy as Grid } from '@mui/material';

const fetchMyBooks = async (token: string): Promise<Book[]> => {
  const { data } = await apiClient.get('/books/mybooks', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const deleteBook = async ({ bookId, token }: { bookId: string; token:string; }) => {
    await apiClient.delete(`/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export default function MyAdsScreen() {
  const { idToken } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: myBooks, isLoading, isError } = useQuery<Book[], Error>({
    queryKey: ['myBooks'],
    queryFn: () => fetchMyBooks(idToken!),
    enabled: !!idToken,
  });

  const deleteMutation = useMutation({
      mutationFn: deleteBook,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['myBooks'] });
      },
      onError: (error: Error) => {
          alert(`Failed to delete: ${error.message}`)
      }
  });

  const handleDelete = (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
        deleteMutation.mutate({ bookId, token: idToken! });
    }
  }

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Could not load your ads.</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>My Ads</Typography>
      
      {/* --- THIS IS THE FIX --- */}
      {myBooks && myBooks.length > 0 ? (
        // Parentheses wrap the entire Grid component
        <Grid container spacing={3}>
          {myBooks.map(book => (
            <Grid item xs={12} key={book._id}>
              <Card sx={{ display: 'flex' }}>
                <CardMedia
                  component="img"
                  sx={{ width: 120, height: 160, objectFit: 'cover' }}
                  image={book.imageUrls[0]}
                  alt={book.title}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <CardContent>
                    <Typography component="div" variant="h6" noWrap>{book.title}</Typography>
                    <Typography variant="subtitle1" color="primary" component="div">
                      ₹{book.askingPrice}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => router.push(`/dashboard/edit-book/${book._id}`)}>Edit</Button>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => handleDelete(book._id)} 
                      disabled={deleteMutation.isPending && deleteMutation.variables?.bookId === book._id}
                    >
                        {deleteMutation.isPending && deleteMutation.variables?.bookId === book._id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </CardActions>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography sx={{mt: 3}}>You have not listed any books yet.</Typography>
      )}
      {/* --- END OF FIX --- */}
    </Box>
  );
}