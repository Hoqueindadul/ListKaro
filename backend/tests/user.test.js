import { describe, it, expect, vi } from 'vitest';
import { signup } from '../controlers/user.controlers.js';
import { User } from '../models/user.model.js';
import { PendingUser } from '../models/pendingUser.model.js';
import bcryptjs from 'bcryptjs';

vi.mock('../models/user.model.js');
vi.mock('../models/pendingUser.model.js');
vi.mock('bcryptjs');
vi.mock('../nodemailer/email.js', () => ({
  sendVarificationEmail: vi.fn(),
  sendWelcomeEmail: vi.fn()
}));

describe('User Controllers - signup', () => {
  it('should return error if missing fields', async () => {
    const req = { body: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Please fill all the fields'
    }));
  });

  it('should return 400 if user already exists', async () => {
    const req = { 
      body: { name: 'John', email: 'john@example.com', phone: '1234567890', password: 'password123' } 
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    User.findOne.mockResolvedValueOnce({ email: 'john@example.com' }); // Mock existing user

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User already exists with your entered email"
    });
  });

  it('should successfully create pending user', async () => {
    const req = { 
      body: { name: 'Jane', email: 'jane@example.com', phone: '0987654321', password: 'password123' } 
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    User.findOne.mockResolvedValueOnce(null); // No existing user
    PendingUser.deleteMany.mockResolvedValueOnce({});
    bcryptjs.hash.mockResolvedValueOnce('hashed_password');
    
    // We mock the save method on PendingUser instance prototype
    PendingUser.prototype.save = vi.fn().mockResolvedValueOnce({});

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      email: 'jane@example.com'
    }));
  });
});
