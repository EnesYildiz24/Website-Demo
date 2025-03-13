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
const UserModel_1 = require("../../src/model/UserModel");
const UserService_1 = require("../../src/services/UserService");
describe('User Service Tests', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect('mongodb://127.0.0.1:27017/testdb', { autoIndex: true });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        yield mongoose_1.default.connection.close();
    }));
    it('should create a user', () => __awaiter(void 0, void 0, void 0, function* () {
        const userResource = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: 'buyer',
        };
        const user = yield (0, UserService_1.createUser)(userResource);
        expect(user).toHaveProperty('id');
        expect(user.username).toBe('testuser');
    }));
    it('should fetch all users', () => __awaiter(void 0, void 0, void 0, function* () {
        const users = yield (0, UserService_1.getAlleUser)();
        expect(Array.isArray(users)).toBe(true);
    }));
    it('should update a user', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield UserModel_1.User.create({ username: 'oldname', email: 'old@example.com', password: 'oldpass', role: 'buyer' });
        const updated = yield (0, UserService_1.updateUser)({ id: user._id.toString(), username: 'newname', email: 'new@example.com', password: 'newpass', role: 'seller' });
        expect(updated).not.toBeNull();
        expect(updated.username).toBe('newname');
    }));
    it('should delete a user', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield UserModel_1.User.create({ username: 'deleteuser', email: 'delete@example.com', password: 'deletepass', role: 'buyer' });
        const deleted = yield (0, UserService_1.deleteUser)(user._id.toString());
        expect(deleted.email).toBe('delete@example.com');
    }));
});
