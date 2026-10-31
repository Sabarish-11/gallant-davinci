import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';

describe('Campus Companion Backend API Tests', () => {
  let token = '';

  // Setup connection before tests
  beforeAll(async () => {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus-companion';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connStr);
    }
  });

  // Close connection after tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1. Health Check Test
  describe('GET /api/health', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('database', 'connected');
    });
  });

  // 2. Auth Login Failure Test
  describe('POST /api/auth/login Failure Case', () => {
    it('should return 401 for incorrect credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'siddharth@academic.edu',
          password: 'WrongPassword123'
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });
  });

  // 3. Auth Login Success Test (Seeded account)
  describe('POST /api/auth/login Success Case', () => {
    it('should login Siddharth successfully and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'siddharth@academic.edu',
          password: 'Password123'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.email).toEqual('siddharth@academic.edu');
      expect(res.body.data.role).toEqual('STUDENT');
      
      // Save token for subsequent tests
      token = res.body.data.token;
    });
  });

  // 4. Protected Route Test
  describe('GET /api/auth/me', () => {
    it('should get current user profile details using valid JWT', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toEqual('siddharth@academic.edu');
      expect(res.body.data).toHaveProperty('profile');
      expect(res.body.data.profile.cgpa).toBeGreaterThanOrEqual(9.0);
    });
  });

  // 5. Student Dashboard Test
  describe('GET /api/dashboard/student', () => {
    it('should load Siddharth Roy\'s dashboard data with low risk level', async () => {
      const res = await request(app)
        .get('/api/dashboard/student')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('stats');
      expect(res.body.data.stats).toHaveProperty('riskLevel', 'LOW RISK');
      expect(res.body.data.stats.cgpa).toBeGreaterThanOrEqual(9.0);
      expect(res.body.data.stats.attendance).toBeGreaterThanOrEqual(90);
    });
  });
});
