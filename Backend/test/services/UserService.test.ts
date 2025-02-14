import mongoose from 'mongoose';
import { User } from '../../src/model/UserModel';
import { createUser, getAlleUser, updateUser, deleteUser } from '../../src/services/UserService';

describe('User Service Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', { autoIndex: true });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a user', async () => {
    const userResource = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'buyer',
    };

    const user = await createUser(userResource);
    expect(user).toHaveProperty('id');
    expect(user.username).toBe('testuser');
  });

  it('should fetch all users', async () => {
    const users = await getAlleUser();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should update a user', async () => {
    const user = await User.create({ username: 'oldname', email: 'old@example.com', password: 'oldpass', role: 'buyer' });
    const updated = await updateUser({ id: user._id.toString(), username: 'newname', email: 'new@example.com', password: 'newpass', role: 'seller' });
    expect(updated.username).toBe('newname');
  });

  it('should delete a user', async () => {
    const user = await User.create({ username: 'deleteuser', email: 'delete@example.com', password: 'deletepass', role: 'buyer' });
    const deleted = await deleteUser(user._id.toString());
    expect(deleted.email).toBe('delete@example.com');
  });
});
