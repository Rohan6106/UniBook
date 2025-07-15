//E:\pro-book-marketplace\backend\models\bookModel.js
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // A reference to the seller
    },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    mrp: { type: Number, required: true }, // Maximum Retail Price
    askingPrice: { type: Number, required: true },
    age: {
      type: String,
      enum: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
      required: true,
    },
    condition: {
      type: String,
      enum: ['Like New', 'Good', 'Acceptable'],
      required: true,
    },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    imageUrls: { type: [String], required: true }, // Array of S3 URLs
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Create a text index for full-text search on title and author
bookSchema.index({ title: 'text', author: 'text' });

const Book = mongoose.model('Book', bookSchema);

export default Book;