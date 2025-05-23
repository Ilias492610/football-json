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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeUsers = void 0;
const User_1 = require("./models/User");
/**
 * Initialize default users (admin and regular user)
 */
const initializeUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if admin user exists
        const adminExists = yield User_1.User.findOne({ username: 'admin' });
        if (!adminExists) {
            console.log('Creating default admin user...');
            const admin = new User_1.User({
                username: 'admin',
                password: 'admin123', // Will be hashed by the pre-save hook
                role: User_1.UserRole.ADMIN
            });
            yield admin.save();
            console.log('Admin user created successfully');
        }
        else {
            console.log('Admin user already exists');
        }
        // Check if regular user exists
        const userExists = yield User_1.User.findOne({ username: 'user' });
        if (!userExists) {
            console.log('Creating default regular user...');
            const user = new User_1.User({
                username: 'user',
                password: 'user123', // Will be hashed by the pre-save hook
                role: User_1.UserRole.USER
            });
            yield user.save();
            console.log('Regular user created successfully');
        }
        else {
            console.log('Regular user already exists');
        }
        console.log('User initialization complete');
    }
    catch (error) {
        console.error('Error initializing users:', error);
    }
});
exports.initializeUsers = initializeUsers;
