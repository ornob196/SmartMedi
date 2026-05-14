const request = require('supertest');
const express = require('express');

const mockVerifyIdToken = jest.fn();

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'test-jwt-token'),
}));

jest.mock('../models', () => require('./helpers/mockModels'));

const mockModels = require('./helpers/mockModels');
const authRoutes = require('../routes/auth');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
}

describe('POST /api/auth/google', () => {
  beforeEach(() => {
    mockModels.__resetMockState();
    mockModels.Patient.findOrCreate = jest.fn(async () => {
      const createdPatient = await mockModels.Patient.create({
        name: 'Pat Example',
        email: 'patient@example.com',
        googleId: 'google-sub-123',
        age: 18,
        sex: 'Other',
        phone: 'Not provided',
        profilePhoto: 'https://example.com/photo.png',
      });
      return [createdPatient, true];
    });
    mockModels.Doctor.findOrCreate = jest.fn(async () => {
      const createdDoctor = await mockModels.Doctor.create({
        name: 'Doc Example',
        email: 'doctor@example.com',
        googleId: 'google-doctor-123',
        age: 30,
        sex: 'Other',
        phone: 'Not provided',
        specialty: 'General Physician',
        profilePhoto: 'https://example.com/doc.png',
        isApproved: false,
      });
      return [createdDoctor, true];
    });
    mockVerifyIdToken.mockReset();
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-sub-123',
        email: 'patient@example.com',
        email_verified: true,
        name: 'Pat Example',
        picture: 'https://example.com/photo.png',
      }),
    });
  });

  test('patient: creates/signs in and returns JWT', async () => {
    const app = buildApp();

    const res = await request(app).post('/api/auth/google').send({
      credential: 'google-token',
      role: 'patient',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('patient');
  });

  test('rejects unverified Google email before email lookup/create', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-sub-123',
        email: 'patient@example.com',
        email_verified: false,
        name: 'Pat Example',
        picture: 'https://example.com/photo.png',
      }),
    });

    const app = buildApp();
    const res = await request(app).post('/api/auth/google').send({
      credential: 'google-token',
      role: 'patient',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(mockModels.Patient.findOrCreate).not.toHaveBeenCalled();
    expect(mockModels.Patient.create).not.toHaveBeenCalled();
  });

  test('patient: links existing same-role email account missing googleId without creating duplicate', async () => {
    const existingPatient = {
      id: 909,
      name: 'Pat Example',
      email: 'patient@example.com',
      googleId: null,
      profilePhoto: null,
      update: jest.fn(async function update(values) {
        Object.assign(this, values);
        return this;
      }),
    };
    mockModels.Patient.findOrCreate = jest.fn(async () => [existingPatient, false]);

    const app = buildApp();
    const res = await request(app).post('/api/auth/google').send({
      credential: 'google-token',
      role: 'patient',
    });

    expect(res.statusCode).toBe(200);
    expect(mockModels.Patient.findOrCreate).toHaveBeenCalledTimes(1);
    expect(existingPatient.update).toHaveBeenCalledWith({
      googleId: 'google-sub-123',
      profilePhoto: 'https://example.com/photo.png',
    });
    expect(mockModels.Patient.create).not.toHaveBeenCalled();
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.id).toBe(909);
  });

  test('patient: rejects login when existing googleId differs from token subject', async () => {
    const existingPatient = {
      id: 910,
      name: 'Pat Example',
      email: 'patient@example.com',
      googleId: 'different-google-sub',
      profilePhoto: null,
      update: jest.fn(),
    };
    mockModels.Patient.findOrCreate = jest.fn(async () => [existingPatient, false]);

    const app = buildApp();
    const res = await request(app).post('/api/auth/google').send({
      credential: 'google-token',
      role: 'patient',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.token).toBeUndefined();
    expect(existingPatient.update).not.toHaveBeenCalled();
  });

  test('doctor: pending approval returns 200 with success and pendingApproval, no JWT', async () => {
    const existingDoctor = {
      id: 303,
      name: 'Doc Example',
      email: 'doctor@example.com',
      isApproved: false,
      googleId: 'google-doctor-123',
      profilePhoto: null,
      update: jest.fn(),
    };
    mockModels.Doctor.findOrCreate = jest.fn(async () => [existingDoctor, false]);

    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-doctor-123',
        email: 'doctor@example.com',
        email_verified: true,
        name: 'Doc Example',
        picture: 'https://example.com/doc.png',
      }),
    });

    const app = buildApp();
    const res = await request(app).post('/api/auth/google').send({
      credential: 'google-token',
      role: 'doctor',
    });

    expect(res.statusCode).toBe(200);
    expect(mockModels.Doctor.create).not.toHaveBeenCalled();
    expect(res.body).toMatchObject({
      success: true,
      pendingApproval: true,
    });
    expect(res.body.pendingApproval).toBe(true);
    expect(res.body.token).toBeUndefined();
  });

  test('doctor: rejects login when existing googleId differs from token subject', async () => {
    const existingDoctor = {
      id: 304,
      name: 'Doc Example',
      email: 'doctor@example.com',
      googleId: 'different-google-sub',
      profilePhoto: null,
      isApproved: true,
      update: jest.fn(),
    };
    mockModels.Doctor.findOrCreate = jest.fn(async () => [existingDoctor, false]);
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-doctor-123',
        email: 'doctor@example.com',
        email_verified: true,
        name: 'Doc Example',
        picture: 'https://example.com/doc.png',
      }),
    });

    const app = buildApp();
    const res = await request(app).post('/api/auth/google').send({
      credential: 'google-token',
      role: 'doctor',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.token).toBeUndefined();
    expect(existingDoctor.update).not.toHaveBeenCalled();
  });

  test('invalid role rejects request', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/auth/google').send({
      credential: 'google-token',
      role: 'admin',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
