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
const AdminModel_1 = require("../../src/model/AdminModel");
const AdminService_1 = require("../../src/services/AdminService");
describe('Admin Service Tests', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect('mongodb://127.0.0.1:27017/testdb', { autoIndex: true });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        yield mongoose_1.default.connection.close();
    }));
    it('should create an admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const adminResource = {
            username: 'testadmin',
            email: 'admin@example.com',
            password: 'adminpass',
            role: 'admin',
            permissions: ['CAN_MANAGE_USERS', 'CAN_VIEW_REPORTS'],
        };
        const admin = yield (0, AdminService_1.createAdmin)(adminResource);
        expect(admin).toHaveProperty('id');
        expect(admin.username).toBe('testadmin');
        expect(admin.email).toBe('admin@example.com');
        expect(admin.role).toBe('admin');
        expect(admin.permissions).toEqual(expect.arrayContaining(['CAN_MANAGE_USERS', 'CAN_VIEW_REPORTS']));
    }));
    it('should fetch all admins', () => __awaiter(void 0, void 0, void 0, function* () {
        const admins = yield (0, AdminService_1.getAllAdmins)();
        expect(Array.isArray(admins)).toBe(true);
    }));
    it('should update an admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const admin = yield AdminModel_1.Admin.create({
            username: 'oldadmin',
            email: 'oldadmin@example.com',
            password: 'oldpass',
            role: 'admin',
            permissions: ['OLD_PERMISSION'],
        });
        const updatedAdmin = yield (0, AdminService_1.updateAdmin)({
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
    }));
    it('should delete an admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const admin = yield AdminModel_1.Admin.create({
            username: 'deleteadmin',
            email: 'deleteadmin@example.com',
            password: 'deletepass',
            role: 'admin',
            permissions: ['DELETE_PERMISSION'],
        });
        const deletedAdmin = yield (0, AdminService_1.deleteAdmin)(admin._id.toString());
        expect(deletedAdmin.id).toBe(admin._id.toString());
        expect(deletedAdmin.username).toBe('deleteadmin');
        expect(deletedAdmin.email).toBe('deleteadmin@example.com');
        expect(deletedAdmin.role).toBe('admin');
        expect(deletedAdmin.permissions).toEqual(['DELETE_PERMISSION']);
    }));
});
