import mongoose from 'mongoose';
import { Category } from '../../src/model/CategoryModel';
import { 
  createCategory, 
  getAlleCategory, 
  updateCategory, 
  deleteCategory 
} from '../../src/services/CategoryService';

describe('Category Service Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', { autoIndex: true });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a category', async () => {
    const categoryResource = {
      name: 'Test Category',
      description: 'A test category'
    };

    const category = await createCategory(categoryResource);
    expect(category).toHaveProperty('id');
    expect(category.name).toBe('Test Category');
    expect(category.description).toBe('A test category');
  });

  it('should not allow duplicate category names', async () => {
    const categoryResource = {
      name: 'Unique Category',
      description: 'First instance'
    };
    await createCategory(categoryResource);

    await expect(createCategory(categoryResource)).rejects.toThrow('Name must be unique');
  });

  it('should fetch all categories', async () => {
    const categories = await getAlleCategory();
    expect(Array.isArray(categories)).toBe(true);
  });

  it('should update a category', async () => {
    const newCategory = await createCategory({
      name: 'Old Category',
      description: 'Old Description'
    });

    const updatedCategory = await updateCategory({
      id: newCategory.id,
      name: 'Updated Category',
      description: 'Updated Description'
    });

    expect(updatedCategory).toHaveProperty('id');
    expect(updatedCategory.name).toBe('Updated Category');
    expect(updatedCategory.description).toBe('Updated Description');
  });

  it('should delete a category', async () => {
    const newCategory = await createCategory({
      name: 'Category to Delete',
      description: 'Will be deleted'
    });

    const deletedCategory = await deleteCategory(newCategory.id!);
    expect(deletedCategory).toHaveProperty('id');
    expect(deletedCategory.name).toBe('Category to Delete');
  });
});
