import mongoose from 'mongoose';

const learningResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER',
    },
    duration: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['COURSE', 'BOOK', 'VIDEO', 'DOCUMENTATION'],
      default: 'COURSE',
    },
  },
  {
    timestamps: true,
  }
);

const LearningResource = mongoose.model('LearningResource', learningResourceSchema);
export default LearningResource;
