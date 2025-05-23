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
exports.updateTeam = exports.updatePlayer = exports.loadTeams = exports.loadPlayers = void 0;
const Player_1 = require("../models/Player");
const Team_1 = require("../models/Team");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const loadPlayers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if we have data in MongoDB
        const count = yield Player_1.Player.countDocuments();
        if (count === 0) {
            try {
                // If no data, use local JSON files instead of fetching from GitHub
                const rootDir = path_1.default.resolve(__dirname, '../../../');
                const playersFilePath = path_1.default.join(rootDir, 'players.json');
                console.log('Loading players from local file:', playersFilePath);
                console.log('File exists:', fs_1.default.existsSync(playersFilePath));
                const playersData = fs_1.default.readFileSync(playersFilePath, 'utf8');
                const players = JSON.parse(playersData);
                console.log(`Found ${players.length} players in JSON file`);
                // Save to MongoDB
                yield Player_1.Player.insertMany(players);
                console.log('Players saved to MongoDB');
                return players;
            }
            catch (fileError) {
                console.error('Error reading local players file:', fileError);
                return [];
            }
        }
        // If data exists, return from MongoDB
        const players = yield Player_1.Player.find().lean();
        console.log(`Found ${players.length} players in MongoDB`);
        return players;
    }
    catch (error) {
        console.error('Error loading players:', error);
        return [];
    }
});
exports.loadPlayers = loadPlayers;
const loadTeams = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if we have data in MongoDB
        const count = yield Team_1.Team.countDocuments();
        if (count === 0) {
            try {
                // If no data, use local JSON files instead of fetching from GitHub
                const rootDir = path_1.default.resolve(__dirname, '../../../');
                const teamsFilePath = path_1.default.join(rootDir, 'teams.json');
                console.log('Loading teams from local file:', teamsFilePath);
                console.log('File exists:', fs_1.default.existsSync(teamsFilePath));
                const teamsData = fs_1.default.readFileSync(teamsFilePath, 'utf8');
                const teams = JSON.parse(teamsData);
                console.log(`Found ${teams.length} teams in JSON file`);
                // Save to MongoDB
                yield Team_1.Team.insertMany(teams);
                console.log('Teams saved to MongoDB');
                return teams;
            }
            catch (fileError) {
                console.error('Error reading local teams file:', fileError);
                return [];
            }
        }
        // If data exists, return from MongoDB
        const teams = yield Team_1.Team.find().lean();
        console.log(`Found ${teams.length} teams in MongoDB`);
        return teams;
    }
    catch (error) {
        console.error('Error loading teams:', error);
        return [];
    }
});
exports.loadTeams = loadTeams;
const updatePlayer = (id, playerData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Player_1.Player.findOneAndUpdate({ id }, { $set: playerData }, { new: true }).lean();
        return result;
    }
    catch (error) {
        console.error('Error updating player:', error);
        return null;
    }
});
exports.updatePlayer = updatePlayer;
const updateTeam = (id, teamData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Team_1.Team.findOneAndUpdate({ id }, { $set: teamData }, { new: true }).lean();
        return result;
    }
    catch (error) {
        console.error('Error updating team:', error);
        return null;
    }
});
exports.updateTeam = updateTeam;
