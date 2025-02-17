import mongoose from 'mongoose';
import { Admin } from '../../src/model/AdminModel';
import {
  createAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
} from '../../src/services/AdminService';

describe('Admin Service Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', { autoIndex: true });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create an admin', async () => {
    const adminResource = {
      username: 'testadmin',
      email: 'admin@example.com',
      password: 'adminpass',
      role: 'admin' as "admin",  
      permissions: ['CAN_MANAGE_USERS', 'CAN_VIEW_REPORTS'],
    };

    const admin = await createAdmin(adminResource);
    expect(admin).toHaveProperty('id');
    expect(admin.username).toBe('testadmin');
    expect(admin.email).toBe('admin@example.com');
    expect(admin.role).toBe('admin');
    expect(admin.permissions).toEqual(expect.arrayContaining(['CAN_MANAGE_USERS', 'CAN_VIEW_REPORTS']));
  });

  it('should fetch all admins', async () => {
    const admins = await getAllAdmins();
    expect(Array.isArray(admins)).toBe(true);
  });

  it('should update an admin', async () => {
    const admin = await Admin.create({
      username: 'oldadmin',
      email: 'oldadmin@example.com',
      password: 'oldpass',
      role: 'admin', 
      permissions: ['OLD_PERMISSION'],
    });

    const updatedAdmin = await updateAdmin({
      id: admin._id.toString(),
      username: 'newadmin',
      email: 'newadmin@example.com',
      password: 'newpass', 
      role: 'admin', 
      permissions: ['NEW_PERMISSION'],
    });

    expect(updatedAdmin.username).toBe('newadmin');
    expect(updatedAdmin.email).toBe('newadmin@example.com');
    expect(updatedAdmin.role).toBe('admin');
    expect(updatedAdmin.permissions).toEqual(['NEW_PERMISSION']);
  });

  it('should delete an admin', async () => {
    const admin = await Admin.create({
      username: 'deleteadmin',
      email: 'deleteadmin@example.com',
      password: 'deletepass',
      role: 'admin',
      permissions: ['DELETE_PERMISSION'],
    });

    const deletedAdmin = await deleteAdmin(admin._id.toString());
    expect(deletedAdmin.id).toBe(admin._id.toString());
    expect(deletedAdmin.username).toBe('deleteadmin');
    expect(deletedAdmin.email).toBe('deleteadmin@example.com');
    expect(deletedAdmin.role).toBe('admin');
    expect(deletedAdmin.permissions).toEqual(['DELETE_PERMISSION']);
  });
});
