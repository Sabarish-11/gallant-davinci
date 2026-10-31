import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Connect using path relative
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import AcademicRecord from '../models/AcademicRecord.js';
import Skill from '../models/Skill.js';
import Career from '../models/Career.js';
import LearningResource from '../models/LearningResource.js';
import SystemConfig from '../models/SystemConfig.js';
import AuditLog from '../models/AuditLog.js';

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus-companion';
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB for seeding...');

    // 1. Clean Database
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await AcademicRecord.deleteMany({});
    await Skill.deleteMany({});
    await Career.deleteMany({});
    await LearningResource.deleteMany({});
    await SystemConfig.deleteMany({});
    await AuditLog.deleteMany({});

    // 2. Seed System Configuration
    console.log('Seeding System Configurations...');
    await SystemConfig.insertMany([
      { key: 'attendanceThreshold', value: 75 },
      {
        key: 'gpaThresholds',
        value: { critical: 5.0, high: 6.0, moderate: 7.0 }
      },
      {
        key: 'weights',
        value: { marks: 0.30, attendance: 0.20, assignment: 0.15, cgpa: 0.20, credits: 0.15 }
      }
    ]);

    // 3. Seed Skills
    console.log('Seeding Skills...');
    const skillsList = [
      { name: 'Python', category: 'Programming', description: 'General purpose high-level programming language' },
      { name: 'Java', category: 'Programming', description: 'Object-oriented programming language' },
      { name: 'C++', category: 'Programming', description: 'Mid-level programming language with systems features' },
      { name: 'JavaScript', category: 'Programming', description: 'Interpreted web scripting language' },
      { name: 'HTML/CSS', category: 'Frontend Development', description: 'Web page markup and styling' },
      { name: 'React', category: 'Frontend Development', description: 'Component-based web view framework' },
      { name: 'Node.js', category: 'Backend Development', description: 'JavaScript runtime environment' },
      { name: 'Express', category: 'Backend Development', description: 'Web framework for Node.js' },
      { name: 'MongoDB', category: 'Database', description: 'NoSQL document database' },
      { name: 'SQL', category: 'Database', description: 'Structured query language for relational databases' },
      { name: 'Docker', category: 'DevOps', description: 'Containerization and packaging system' },
      { name: 'AWS', category: 'Cloud', description: 'Amazon Web Services cloud platform' },
      { name: 'System Design', category: 'Software Engineering', description: 'Architecture of large scale computer systems' },
      { name: 'DSA', category: 'Computer Science', description: 'Data Structures and Algorithms' },
      { name: 'Statistics', category: 'Data Science', description: 'Mathematical statistics and probability' },
      { name: 'Machine Learning', category: 'Data Science', description: 'Algorithms that learn from data' },
      { name: 'Pandas', category: 'Data Science', description: 'Data manipulation and analysis library' },
      { name: 'NumPy', category: 'Data Science', description: 'Scientific computing library' },
      { name: 'Communication', category: 'Soft Skills', description: 'Spoken and written professional exchange' },
      { name: 'Problem Solving', category: 'Soft Skills', description: 'Logical thinking and coding assessments' },
    ];

    const createdSkills = await Skill.insertMany(skillsList);
    const skillMap = {};
    createdSkills.forEach((s) => {
      skillMap[s.name] = s._id;
    });

    // 4. Seed Career Profiles
    console.log('Seeding Career Profiles...');
    const careersList = [
      {
        name: 'Software Engineer',
        description: 'Design, develop, and maintain software applications using clean architecture and core algorithms.',
        requiredSkills: [
          { skillId: skillMap['DSA'], importance: 'HIGH', proficiency: 'ADVANCED' },
          { skillId: skillMap['Java'], importance: 'HIGH', proficiency: 'INTERMEDIATE' },
          { skillId: skillMap['SQL'], importance: 'MEDIUM', proficiency: 'INTERMEDIATE' },
          { skillId: skillMap['Git'] || createdSkills[0]._id, importance: 'MEDIUM', proficiency: 'INTERMEDIATE' },
          { skillId: skillMap['Problem Solving'], importance: 'HIGH', proficiency: 'ADVANCED' },
          { skillId: skillMap['Communication'], importance: 'LOW', proficiency: 'INTERMEDIATE' },
        ]
      },
      {
        name: 'Frontend Developer',
        description: 'Build responsive, accessible, and high-performance interactive user interfaces for modern web apps.',
        requiredSkills: [
          { skillId: skillMap['HTML/CSS'], importance: 'HIGH', proficiency: 'ADVANCED' },
          { skillId: skillMap['JavaScript'], importance: 'HIGH', proficiency: 'ADVANCED' },
          { skillId: skillMap['React'], importance: 'HIGH', proficiency: 'ADVANCED' },
          { skillId: skillMap['Communication'], importance: 'MEDIUM', proficiency: 'INTERMEDIATE' },
        ]
      },
      {
        name: 'Backend Developer',
        description: 'Create server logic, API endpoints, microservices, databases, authentication, and hosting environments.',
        requiredSkills: [
          { skillId: skillMap['Node.js'], importance: 'HIGH', proficiency: 'ADVANCED' },
          { skillId: skillMap['Express'], importance: 'HIGH', proficiency: 'ADVANCED' },
          { skillId: skillMap['MongoDB'], importance: 'HIGH', proficiency: 'INTERMEDIATE' },
          { skillId: skillMap['SQL'], importance: 'HIGH', proficiency: 'INTERMEDIATE' },
          { skillId: skillMap['System Design'], importance: 'HIGH', proficiency: 'INTERMEDIATE' },
          { skillId: skillMap['Docker'], importance: 'MEDIUM', proficiency: 'BEGINNER' },
          { skillId: skillMap['AWS'], importance: 'LOW', proficiency: 'BEGINNER' },
          { skillId: skillMap['Communication'], importance: 'LOW', proficiency: 'INTERMEDIATE' },
        ]
      },
      {
        name: 'Data Scientist',
        description: 'Extract insights from big data using statistical analyses, visualizations, and machine learning models.',
        requiredSkills: [
          { skillId: skillMap['Python'], importance: 'HIGH', proficiency: 'ADVANCED' },
          { skillId: skillMap['SQL'], importance: 'HIGH', proficiency: 'INTERMEDIATE' },
          { skillId: skillMap['Statistics'], importance: 'HIGH', proficiency: 'ADVANCED' },
          { skillId: skillMap['Machine Learning'], importance: 'HIGH', proficiency: 'ADVANCED' },
          { skillId: skillMap['Pandas'], importance: 'MEDIUM', proficiency: 'ADVANCED' },
          { skillId: skillMap['NumPy'], importance: 'MEDIUM', proficiency: 'ADVANCED' },
          { skillId: skillMap['Communication'], importance: 'MEDIUM', proficiency: 'INTERMEDIATE' },
        ]
      }
    ];

    const createdCareers = await Career.insertMany(careersList);
    const careerMap = {};
    createdCareers.forEach((c) => {
      careerMap[c.name] = c._id;
    });

    // 5. Seed Learning Resources
    console.log('Seeding Learning Resources...');
    const resourcesList = [
      { title: 'LeetCode 75 Study Plan', provider: 'LeetCode', url: 'https://leetcode.com/studyplan/leetcode-75/', skillId: skillMap['DSA'], difficulty: 'INTERMEDIATE', duration: '3 weeks', type: 'COURSE' },
      { title: 'Algorithms Specialization', provider: 'Stanford via Coursera', url: 'https://www.coursera.org/specializations/algorithms', skillId: skillMap['DSA'], difficulty: 'ADVANCED', duration: '4 months', type: 'COURSE' },
      { title: 'Modern React with Redux', provider: 'Udemy', url: 'https://www.udemy.com/course/react-redux/', skillId: skillMap['React'], difficulty: 'BEGINNER', duration: '40 hours', type: 'COURSE' },
      { title: 'Official React Documentation', provider: 'React Core Team', url: 'https://react.dev', skillId: skillMap['React'], difficulty: 'BEGINNER', duration: 'Self-paced', type: 'DOCUMENTATION' },
      { title: 'The Complete Node.js Developer Course', provider: 'Udemy', url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/', skillId: skillMap['Node.js'], difficulty: 'BEGINNER', duration: '35 hours', type: 'COURSE' },
      { title: 'Docker and Kubernetes Complete Guide', provider: 'Stephen Grider', url: 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/', skillId: skillMap['Docker'], difficulty: 'BEGINNER', duration: '22 hours', type: 'COURSE' },
      { title: 'SQL for Data Analysis', provider: 'Udacity', url: 'https://www.udacity.com/course/sql-for-data-analysis--ud198', skillId: skillMap['SQL'], difficulty: 'BEGINNER', duration: '4 weeks', type: 'COURSE' },
      { title: 'Machine Learning A-Z', provider: 'SuperDataScience', url: 'https://www.udemy.com/course/machinelearning/', skillId: skillMap['Machine Learning'], difficulty: 'INTERMEDIATE', duration: '44 hours', type: 'COURSE' },
      { title: 'Python for Data Science Handbook', provider: 'Jake VanderPlas (O\'Reilly)', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/', skillId: skillMap['Python'], difficulty: 'INTERMEDIATE', duration: 'Self-paced', type: 'BOOK' },
    ];

    await LearningResource.insertMany(resourcesList);

    // 6. Seed Users
    console.log('Seeding Users & Student Profiles...');
    const salt = await bcrypt.genSalt(10);
    const commonPasswordHash = await bcrypt.hash('Password123', salt);

    // Admin
    const adminUser = await User.create({
      name: 'Dr. Evelyn Vance',
      email: 'admin@academic.edu',
      passwordHash: commonPasswordHash,
      role: 'ADMIN',
      department: 'Academic Affairs',
      status: 'ACTIVE'
    });

    // Faculty
    const facultyUser = await User.create({
      name: 'Prof. Marcus Thorne',
      email: 'faculty@academic.edu',
      passwordHash: commonPasswordHash,
      role: 'FACULTY',
      department: 'Computer Science',
      status: 'ACTIVE'
    });

    // Students with different states
    const siddharthUser = await User.create({
      name: 'Siddharth Roy',
      email: 'siddharth@academic.edu',
      passwordHash: commonPasswordHash,
      role: 'STUDENT',
      studentId: 'CS2023001',
      department: 'Computer Science',
      batch: '2023-2027',
      semester: 4,
      status: 'ACTIVE'
    });

    const ananyaUser = await User.create({
      name: 'Ananya Sen',
      email: 'ananya@academic.edu',
      passwordHash: commonPasswordHash,
      role: 'STUDENT',
      studentId: 'CS2023002',
      department: 'Computer Science',
      batch: '2023-2027',
      semester: 4,
      status: 'ACTIVE'
    });

    const vikramUser = await User.create({
      name: 'Vikram Malhotra',
      email: 'vikram@academic.edu',
      passwordHash: commonPasswordHash,
      role: 'STUDENT',
      studentId: 'CS2023003',
      department: 'Computer Science',
      batch: '2023-2027',
      semester: 4,
      status: 'ACTIVE'
    });

    const rohanUser = await User.create({
      name: 'Rohan Das',
      email: 'rohan@academic.edu',
      passwordHash: commonPasswordHash,
      role: 'STUDENT',
      studentId: 'CS2023004',
      department: 'Computer Science',
      batch: '2023-2027',
      semester: 4,
      status: 'ACTIVE'
    });

    // Profiles
    const siddharthProfile = await StudentProfile.create({
      userId: siddharthUser._id,
      cgpa: 9.15,
      attendance: 92.5,
      preferredCareer: careerMap['Software Engineer'],
      skills: [
        { name: 'Java', proficiency: 'INTERMEDIATE' },
        { name: 'C++', proficiency: 'BEGINNER' },
        { name: 'SQL', proficiency: 'INTERMEDIATE' },
        { name: 'Problem Solving', proficiency: 'ADVANCED' },
      ],
      certifications: [
        { name: 'Oracle Certified Java Professional', issuer: 'Oracle', date: new Date('2025-05-12') }
      ],
      projects: [
        { title: 'Distributed Chat Server', description: 'Socket programming project in Java implementing custom encryption.', technologies: ['Java', 'Sockets'] }
      ],
      learningPreferences: { mode: 'HYBRID', weeklyHours: 12 }
    });

    const ananyaProfile = await StudentProfile.create({
      userId: ananyaUser._id,
      cgpa: 7.42,
      attendance: 81.0,
      preferredCareer: careerMap['Frontend Developer'],
      skills: [
        { name: 'HTML/CSS', proficiency: 'INTERMEDIATE' },
        { name: 'JavaScript', proficiency: 'BEGINNER' },
      ],
      certifications: [],
      projects: [
        { title: 'Personal Portfolio', description: 'Responsive static landing page with visual animations.', technologies: ['HTML', 'CSS', 'JavaScript'] }
      ],
      learningPreferences: { mode: 'ONLINE', weeklyHours: 6 }
    });

    const vikramProfile = await StudentProfile.create({
      userId: vikramUser._id,
      cgpa: 5.85,
      attendance: 68.2,
      preferredCareer: careerMap['Backend Developer'],
      skills: [
        { name: 'Node.js', proficiency: 'BEGINNER' },
      ],
      certifications: [],
      projects: [],
      learningPreferences: { mode: 'OFFLINE', weeklyHours: 4 }
    });

    const rohanProfile = await StudentProfile.create({
      userId: rohanUser._id,
      cgpa: 4.10,
      attendance: 52.0,
      preferredCareer: careerMap['Data Scientist'],
      skills: [
        { name: 'Python', proficiency: 'BEGINNER' },
      ],
      certifications: [],
      projects: [],
      learningPreferences: { mode: 'ONLINE', weeklyHours: 2 }
    });

    // 7. Seed Academic Records (Semesters 1-4)
    console.log('Seeding Academic Records...');
    const academicRecords = [];

    // Siddharth - Strong student (GPA ~9.2)
    const siddharthMarks = [
      // Semester 1
      { semester: 1, code: 'CS101', name: 'Introduction to Programming', credits: 4, internal: 92, assignment: 95, exam: 88, attendance: 96, grade: 'S', pass: true },
      { semester: 1, code: 'MA101', name: 'Mathematics I (Calculus)', credits: 4, internal: 85, assignment: 90, exam: 82, attendance: 90, grade: 'A', pass: true },
      // Semester 2
      { semester: 2, code: 'CS102', name: 'Object Oriented Programming', credits: 4, internal: 95, assignment: 92, exam: 90, attendance: 94, grade: 'S', pass: true },
      { semester: 2, code: 'CS103', name: 'Digital Electronics', credits: 3, internal: 88, assignment: 85, exam: 84, attendance: 92, grade: 'A', pass: true },
      // Semester 3
      { semester: 3, code: 'CS201', name: 'Data Structures and Algorithms', credits: 4, internal: 90, assignment: 92, exam: 94, attendance: 95, grade: 'S', pass: true },
      { semester: 3, code: 'CS202', name: 'Discrete Mathematics', credits: 4, internal: 82, assignment: 88, exam: 80, attendance: 88, grade: 'A', pass: true },
      // Semester 4 (Active record)
      { semester: 4, code: 'CS203', name: 'Database Management Systems', credits: 4, internal: 91, assignment: 94, exam: 92, attendance: 93, grade: 'S', pass: true },
      { semester: 4, code: 'CS204', name: 'Operating Systems', credits: 4, internal: 86, assignment: 89, exam: 88, attendance: 91, grade: 'A', pass: true }
    ];

    siddharthMarks.forEach(m => {
      academicRecords.push({
        studentId: siddharthUser._id,
        semester: m.semester,
        subjectCode: m.code,
        subjectName: m.name,
        credits: m.credits,
        internalMarks: m.internal,
        assignmentMarks: m.assignment,
        examMarks: m.exam,
        attendance: m.attendance,
        grade: m.grade,
        passStatus: m.pass
      });
    });

    // Ananya - Moderate student (GPA ~7.4)
    const ananyaMarks = [
      // Semester 1
      { semester: 1, code: 'CS101', name: 'Introduction to Programming', credits: 4, internal: 78, assignment: 80, exam: 72, attendance: 84, grade: 'B', pass: true },
      { semester: 1, code: 'MA101', name: 'Mathematics I (Calculus)', credits: 4, internal: 68, assignment: 70, exam: 62, attendance: 80, grade: 'C', pass: true },
      // Semester 2
      { semester: 2, code: 'CS102', name: 'Object Oriented Programming', credits: 4, internal: 80, assignment: 82, exam: 76, attendance: 85, grade: 'A', pass: true },
      { semester: 2, code: 'CS103', name: 'Digital Electronics', credits: 3, internal: 70, assignment: 72, exam: 65, attendance: 78, grade: 'B', pass: true },
      // Semester 3
      { semester: 3, code: 'CS201', name: 'Data Structures and Algorithms', credits: 4, internal: 72, assignment: 75, exam: 68, attendance: 81, grade: 'B', pass: true },
      { semester: 3, code: 'CS202', name: 'Discrete Mathematics', credits: 4, internal: 64, assignment: 72, exam: 58, attendance: 76, grade: 'C', pass: true },
      // Semester 4
      { semester: 4, code: 'CS203', name: 'Database Management Systems', credits: 4, internal: 78, assignment: 80, exam: 74, attendance: 82, grade: 'B', pass: true },
      { semester: 4, code: 'CS204', name: 'Operating Systems', credits: 4, internal: 70, assignment: 68, exam: 69, attendance: 80, grade: 'B', pass: true }
    ];

    ananyaMarks.forEach(m => {
      academicRecords.push({
        studentId: ananyaUser._id,
        semester: m.semester,
        subjectCode: m.code,
        subjectName: m.name,
        credits: m.credits,
        internalMarks: m.internal,
        assignmentMarks: m.assignment,
        examMarks: m.exam,
        attendance: m.attendance,
        grade: m.grade,
        passStatus: m.pass
      });
    });

    // Vikram - High Risk student (GPA ~5.8, low attendance)
    const vikramMarks = [
      // Semester 1
      { semester: 1, code: 'CS101', name: 'Introduction to Programming', credits: 4, internal: 62, assignment: 65, exam: 54, attendance: 72, grade: 'D', pass: true },
      { semester: 1, code: 'MA101', name: 'Mathematics I (Calculus)', credits: 4, internal: 58, assignment: 60, exam: 52, attendance: 70, grade: 'D', pass: true },
      // Semester 2
      { semester: 2, code: 'CS102', name: 'Object Oriented Programming', credits: 4, internal: 65, assignment: 68, exam: 58, attendance: 74, grade: 'C', pass: true },
      { semester: 2, code: 'CS103', name: 'Digital Electronics', credits: 3, internal: 60, assignment: 55, exam: 50, attendance: 65, grade: 'D', pass: true },
      // Semester 3
      { semester: 3, code: 'CS201', name: 'Data Structures and Algorithms', credits: 4, internal: 55, assignment: 60, exam: 48, attendance: 66, grade: 'E', pass: true },
      { semester: 3, code: 'CS202', name: 'Discrete Mathematics', credits: 4, internal: 50, assignment: 55, exam: 35, attendance: 62, grade: 'F', pass: false }, // Backlog!
      // Semester 4
      { semester: 4, code: 'CS203', name: 'Database Management Systems', credits: 4, internal: 60, assignment: 62, exam: 54, attendance: 68, grade: 'D', pass: true },
      { semester: 4, code: 'CS204', name: 'Operating Systems', credits: 4, internal: 58, assignment: 60, exam: 51, attendance: 65, grade: 'D', pass: true }
    ];

    vikramMarks.forEach(m => {
      academicRecords.push({
        studentId: vikramUser._id,
        semester: m.semester,
        subjectCode: m.code,
        subjectName: m.name,
        credits: m.credits,
        internalMarks: m.internal,
        assignmentMarks: m.assignment,
        examMarks: m.exam,
        attendance: m.attendance,
        grade: m.grade,
        passStatus: m.pass
      });
    });

    // Rohan - Critical Risk student (GPA ~4.1, very low attendance)
    const rohanMarks = [
      // Semester 1
      { semester: 1, code: 'CS101', name: 'Introduction to Programming', credits: 4, internal: 50, assignment: 52, exam: 45, attendance: 60, grade: 'E', pass: true },
      { semester: 1, code: 'MA101', name: 'Mathematics I (Calculus)', credits: 4, internal: 42, assignment: 48, exam: 32, attendance: 52, grade: 'F', pass: false }, // Backlog!
      // Semester 2
      { semester: 2, code: 'CS102', name: 'Object Oriented Programming', credits: 4, internal: 52, assignment: 55, exam: 48, attendance: 58, grade: 'E', pass: true },
      { semester: 2, code: 'CS103', name: 'Digital Electronics', credits: 3, internal: 48, assignment: 45, exam: 30, attendance: 50, grade: 'F', pass: false }, // Backlog!
      // Semester 3
      { semester: 3, code: 'CS201', name: 'Data Structures and Algorithms', credits: 4, internal: 48, assignment: 50, exam: 32, attendance: 55, grade: 'F', pass: false }, // Backlog!
      { semester: 3, code: 'CS202', name: 'Discrete Mathematics', credits: 4, internal: 40, assignment: 45, exam: 34, attendance: 48, grade: 'F', pass: false }, // Backlog!
      // Semester 4
      { semester: 4, code: 'CS203', name: 'Database Management Systems', credits: 4, internal: 45, assignment: 48, exam: 30, attendance: 50, grade: 'F', pass: false }, // Backlog!
      { semester: 4, code: 'CS204', name: 'Operating Systems', credits: 4, internal: 48, assignment: 50, exam: 46, attendance: 53, grade: 'E', pass: true }
    ];

    rohanMarks.forEach(m => {
      academicRecords.push({
        studentId: rohanUser._id,
        semester: m.semester,
        subjectCode: m.code,
        subjectName: m.name,
        credits: m.credits,
        internalMarks: m.internal,
        assignmentMarks: m.assignment,
        examMarks: m.exam,
        attendance: m.attendance,
        grade: m.grade,
        passStatus: m.pass
      });
    });

    console.log(`Inserting ${academicRecords.length} academic records...`);
    await AcademicRecord.insertMany(academicRecords);

    console.log('Database seeded successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with error:', error);
    process.exit(1);
  }
};

seedData();
