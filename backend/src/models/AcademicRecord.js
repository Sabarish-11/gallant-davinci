import mongoose from 'mongoose';

const academicRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    internalMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    assignmentMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    examMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    attendance: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 100,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ['S', 'A', 'B', 'C', 'D', 'E', 'F'],
    },
    passStatus: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compounded index to prevent duplicate entries for same student, semester and subject code
academicRecordSchema.index({ studentId: 1, semester: 1, subjectCode: 1 }, { unique: true });

const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema);
export default AcademicRecord;
