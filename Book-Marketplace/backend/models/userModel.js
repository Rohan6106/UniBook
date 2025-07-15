//E:\pro-book-marketplace\backend\models\userModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true, // The Firebase UID is the unique key
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    // You can add more profile fields here later
    // e.g., location, profilePictureUrl, etc.
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const User = mongoose.model('User', userSchema);

export default User;