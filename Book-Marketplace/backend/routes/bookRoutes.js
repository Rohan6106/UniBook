//E:\pro-book-marketplace\backend\routes\bookRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createBook,
  getPresignedUploadUrl,
  getBooks,
  getBookById,
  getMyBooks,    // <-- Import new function
  updateBook,    // <-- Import new function
  deleteBook,    // <-- Import new function
  searchBooks
} from '../controllers/bookController.js';

const router = express.Router();

// --- Public Routes ---
router.route('/').get(getBooks);

// --- Protected Routes ---
router.route('/').post(protect, createBook);
router.route('/mybooks').get(protect, getMyBooks); // <-- Add route to get user's books
router.route('/upload-url').post(protect, getPresignedUploadUrl);
router.route('/search').get(searchBooks);
// --- Routes for a specific book ID ---
router
  .route('/:id')
  .get(getBookById)
  .put(protect, updateBook)    // <-- Add route to update a book
  .delete(protect, deleteBook); // <-- Add route to delete a book

export default router;