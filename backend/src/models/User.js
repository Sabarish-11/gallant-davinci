import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['STUDENT', 'FACULTY', 'ADMIN'],
      default: 'STUDENT',
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true, // Only enforces uniqueness for non-null values
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    batch: {
      type: String,
      trim: true, // e.g., "2023-2027"
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
