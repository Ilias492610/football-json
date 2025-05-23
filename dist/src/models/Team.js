"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Team = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const teamSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    league: { type: String, required: true },
    foundedYear: { type: Number, required: true },
    stadium: { type: String, required: true },
    manager: { type: String, required: true },
    country: { type: String, required: true },
    image: { type: String, default: '/public/images/default-team.jpg' },
    imageUrl: { type: String }
});
exports.Team = mongoose_1.default.model('Team', teamSchema);
