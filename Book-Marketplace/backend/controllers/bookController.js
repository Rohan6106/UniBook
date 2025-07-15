//E:\pro-book-marketplace\backend\controllers\bookController.js
import asyncHandler from 'express-async-handler';
import AWS from 'aws-sdk';
import { randomBytes } from 'crypto';
import Book from '../models/bookModel.js';
import Chat from '../models/chatModel.js'; // <-- 1. Import the Chat model
import Message from '../models/messageModel.js'; // <-- 1. Import the Message model
// Configure the AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "eu-west-1",
  signatureVersion: 'v4',
});

// @desc    Get a pre-signed URL for file upload
// @route   POST /api/books/upload-url
// @access  Private
export const getPresignedUploadUrl = asyncHandler(async (req, res) => {
  const { fileType } = req.body;
  if (!fileType) {
    res.status(400);
    throw new Error('fileType is required');
  }

  // Generate a unique file name to prevent overwrites
  const uniqueId = randomBytes(16).toString('hex');
  const fileExtension = fileType.split('/')[1];
  const key = `${uniqueId}.${fileExtension}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: 300, // URL expires in 60 seconds
    ContentType: fileType,
  };

  const uploadUrl = s3.getSignedUrl('putObject', params);
  
  res.json({
    uploadUrl,
    key, // Send the key back to the client to store
  });
});

// @desc    Create a new book listing
// @route   POST /api/books
// @access  Private
export const createBook = asyncHandler(async (req, res) => {
  // Destructure all expected fields from the request body
  const {
    title,
    author,
    mrp,
    askingPrice,
    age,
    condition,
    category,
    description,
    location,
    imageUrls,
  } = req.body;

  // Basic validation
  if (!title || !author || !askingPrice || !imageUrls || imageUrls.length === 0) {
    res.status(400);
    throw new Error('Please fill all required fields and upload at least one image.');
  }

  const book = new Book({
    user: req.user._id, // From our 'protect' middleware
    title,
    author,
    mrp,
    askingPrice,
    age,
    condition,
    category,
    description,
    location,
    imageUrls,
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});



// @desc    Get a single book by ID
// @route   GET /api/books/:id
export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate(
    'user',
    'name email createdAt firebaseUid' // <-- THE FIX: Add firebaseUid here
  );
  if (book) {
    res.json(book);
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

// @desc    Get books listed by the logged-in user
// @route   GET /api/books/mybooks
// @access  Private
export const getMyBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(books);
});

// @desc    Update a book listing
// @route   PUT /api/books/:id
// @access  Private
export const updateBook = asyncHandler(async (req, res) => {
  const { title, author, mrp, askingPrice, age, condition, category, description, location } = req.body;

  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Check if the user owns the book
  if (book.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized to update this listing');
  }

  // Update fields
  book.title = title || book.title;
  book.author = author || book.author;
  book.mrp = mrp || book.mrp;
  book.askingPrice = askingPrice || book.askingPrice;
  book.age = age || book.age;
  book.condition = condition || book.condition;
  book.category = category || book.category;
  book.description = description || book.description;
  book.location = location || book.location;

  const updatedBook = await book.save();
  res.json(updatedBook);
});

export const deleteBook = asyncHandler(async (req, res) => {
  const bookId = req.params.id;
  const book = await Book.findById(bookId);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Check ownership
  if (book.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized to delete this listing');
  }

  // --- THIS IS THE FIX ---
  // Step 1: Find all chats related to this book
  const relatedChats = await Chat.find({ book: bookId });
  const relatedChatIds = relatedChats.map(chat => chat._id);

  // Step 2: Delete all messages within those chats
  if (relatedChatIds.length > 0) {
    await Message.deleteMany({ chat: { $in: relatedChatIds } });
    console.log(`Deleted messages for chats: ${relatedChatIds.join(', ')}`);
  }

  // Step 3: Delete the chats themselves
  await Chat.deleteMany({ book: bookId });
  console.log(`Deleted ${relatedChatIds.length} chats related to book ${bookId}`);
  
  // Step 4: Finally, delete the book
  await book.deleteOne();
  
  // --- END OF FIX ---

  res.json({ message: 'Book listing and all associated chats removed successfully' });
});

// @desc    Search for books using a text index
// @route   GET /api/books/search
// @access  Public
export const searchBooks = asyncHandler(async (req, res) => {
  const keyword = req.query.q ? req.query.q.toString() : '';

  if (!keyword) {
    res.json({ books: [] }); // Return empty array if no keyword
    return;
  }

  // Use the $text operator to perform a full-text search
  // Also, add a score to sort by relevance
  const books = await Book.find(
    { $text: { $search: keyword } },
    { score: { $meta: "textScore" } } // Project a textScore field
  ).sort({ score: { $meta: "textScore" } }); // Sort by the relevance score

  res.json({ books });
});

export const getBooks = asyncHandler(async (req, res) => {
  const pageSize = 8; // Number of books per page
  const page = Number(req.query.pageNumber) || 1;

  // Build the query object
  const query = {};

  // 1. Text Search (for title and author)
  if (req.query.keyword) {
    query.$text = { $search: req.query.keyword };
  }
  
  // 2. Category Filter
  if (req.query.category) {
    // Use a case-insensitive regular expression for the category search
    query.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
  }

  // 3. Condition Filter
  if (req.query.condition) {
    query.condition = req.query.condition;
  }

  // 4. Price Range Filter
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : Infinity;
  if (req.query.minPrice || req.query.maxPrice) {
      query.askingPrice = { $gte: minPrice, $lte: maxPrice };
  }

  // Count the total number of documents that match the query
  const count = await Book.countDocuments(query);

  // Find the books that match the query, with pagination
  const books = await Book.find(query)
    .sort({ createdAt: -1 }) // Sort by latest first
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    books,
    page,
    pages: Math.ceil(count / pageSize), // Total number of pages
  });
});