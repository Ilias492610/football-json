"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const playerSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    age: { type: Number, required: true },
    isActive: { type: Boolean, required: true },
    birthDate: { type: String, required: true },
    imageUrl: { type: String, required: true },
    position: { type: String, required: true },
    skills: { type: [String], required: true },
    nationality: { type: String, required: true },
    currentTeam: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        league: { type: String, required: true },
        teamLogoUrl: { type: String, required: true },
        foundedYear: { type: Number, required: true },
        stadium: { type: String, required: true }
    }
});
exports.Player = mongoose_1.default.model('Player', playerSchema);
