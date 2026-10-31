import mongoose from 'mongoose';

const skillProficiencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    proficiency: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER',
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    technologies: [{ type: String, trim: true }],
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    date: { type: Date },
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    cgpa: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 10.0,
    },
    attendance: {
      type: Number,
      default: 100.0,
      min: 0.0,
      max: 100.0,
    },
    skills: [skillProficiencySchema],
    certifications: [certificationSchema],
    projects: [projectSchema],
    preferredCareer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      default: null,
    },
    learningPreferences: {
      mode: {
        type: String,
        enum: ['ONLINE', 'OFFLINE', 'HYBRID'],
        default: 'ONLINE',
      },
      weeklyHours: {
        type: Number,
        default: 5,
        min: 1,
        max: 40,
      },
    },
  },
  {
    timestamps: true,
  }
);

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export default StudentProfile;
