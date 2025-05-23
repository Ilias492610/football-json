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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the MongoDB URI from environment variable or use default
        let mongoURI = process.env.MONGODB_URI || 'mongodb+srv://hamdaouiilias14:N7ymXJvMs0fzDvyA@webontwikkeling.abgrzzs.mongodb.net/?retryWrites=true&w=majority&appName=Webontwikkeling';
        // Fix for incorrectly formatted environment variables
        if (mongoURI.includes('MONGODB_URI =')) {
            mongoURI = mongoURI.replace('MONGODB_URI =', '').trim();
        }
        console.log('Connecting to MongoDB...');
        // Don't log the full URI for security reasons
        console.log('MongoDB URI configured:', mongoURI ? 'Yes' : 'No');
        const conn = yield mongoose_1.default.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        // Toon database info
        if (conn.connection.db) {
            console.log('Database naam:', conn.connection.db.databaseName);
            // Log alle collections die er zijn
            const collections = yield conn.connection.db.listCollections().toArray();
            console.log('Collections in de database:', collections.map(c => c.name));
        }
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        console.error('Please make sure MongoDB is running on your system');
        process.exit(1);
    }
});
exports.default = connectDB;
