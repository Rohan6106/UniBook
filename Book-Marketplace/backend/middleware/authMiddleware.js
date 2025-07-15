//E:\pro-book-marketplace\backend\middleware\authMiddleware.js
import asyncHandler from 'express-async-handler';
import admin from '../config/firebase.js';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Get token from header
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token with Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(token);

      // 3. Find or create a user in our own MongoDB
      // This pattern is called "upsert" (update or insert)
      const user = await User.findOneAndUpdate(
        { firebaseUid: decodedToken.uid },
        {
          name: decodedToken.name || decodedToken.email.split('@')[0], // Use name, or derive from email
          email: decodedToken.email,
        },
        {
          new: true, // Return the new or updated document
          upsert: true, // Create a new document if one doesn't exist
        }
      );
      
      // 4. Attach our MongoDB user object to the request
      req.user = user;
      req.firebaseUid = decodedToken.uid; 

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Error in auth middleware:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

export { protect };