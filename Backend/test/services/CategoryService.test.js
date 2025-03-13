"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CategoryService_1 = require("../../src/services/CategoryService");
describe('Category Service Tests', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect('mongodb://127.0.0.1:27017/testdb', { autoIndex: true });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        yield mongoose_1.default.connection.close();
    }));
    it('should create a category', () => __awaiter(void 0, void 0, void 0, function* () {
        const categoryResource = {
            name: 'Test Category',
            description: 'A test category'
        };
        const category = yield (0, CategoryService_1.createCategory)(categoryResource);
        expect(category).toHaveProperty('id');
        expect(category.name).toBe('Test Category');
        expect(category.description).toBe('A test category');
    }));
    it('should not allow duplicate category names', () => __awaiter(void 0, void 0, void 0, function* () {
        const categoryResource = {
            name: 'Unique Category',
            description: 'First instance'
        };
        yield (0, CategoryService_1.createCategory)(categoryResource);
        yield expect((0, CategoryService_1.createCategory)(categoryResource)).rejects.toThrow('Name must be unique');
    }));
    it('should fetch all categories', () => __awaiter(void 0, void 0, void 0, function* () {
        const categories = yield (0, CategoryService_1.getAlleCategory)();
        expect(Array.isArray(categories)).toBe(true);
    }));
    it('should update a category', () => __awaiter(void 0, void 0, void 0, function* () {
        const newCategory = yield (0, CategoryService_1.createCategory)({
            name: 'Old Category',
            description: 'Old Description'
        });
        const updatedCategory = yield (0, CategoryService_1.updateCategory)({
            id: newCategory.id,
            name: 'Updated Category',
            description: 'Updated Description'
        });
        expect(updatedCategory).toHaveProperty('id');
        expect(updatedCategory.name).toBe('Updated Category');
        expect(updatedCategory.description).toBe('Updated Description');
    }));
    it('should delete a category', () => __awaiter(void 0, void 0, void 0, function* () {
        const newCategory = yield (0, CategoryService_1.createCategory)({
            name: 'Category to Delete',
            description: 'Will be deleted'
        });
        const deletedCategory = yield (0, CategoryService_1.deleteCategory)(newCategory.id);
        expect(deletedCategory).toHaveProperty('id');
        expect(deletedCategory.name).toBe('Category to Delete');
    }));
});
