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
const Team_1 = require("./models/Team");
const Player_1 = require("./models/Player");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("./config/database"));
function resetDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield (0, database_1.default)();
            console.log('Connected to MongoDB');
            // Clear existing data
            console.log('Clearing existing data...');
            yield Team_1.Team.deleteMany({});
            yield Player_1.Player.deleteMany({});
            console.log('Existing data cleared');
            // Load data from JSON files
            const rootDir = path_1.default.resolve(__dirname, '../../');
            const teamsFilePath = path_1.default.join(rootDir, 'teams.json');
            const playersFilePath = path_1.default.join(rootDir, 'players.json');
            console.log('Loading data from JSON files...');
            const teamsData = fs_1.default.readFileSync(teamsFilePath, 'utf8');
            const playersData = fs_1.default.readFileSync(playersFilePath, 'utf8');
            const teams = JSON.parse(teamsData);
            const players = JSON.parse(playersData);
            // Insert data into MongoDB
            console.log('Inserting data into MongoDB...');
            yield Team_1.Team.insertMany(teams);
            yield Player_1.Player.insertMany(players);
            console.log(`Inserted ${teams.length} teams and ${players.length} players into MongoDB`);
            console.log('Database reset complete!');
            // Verify data
            const verifyTeams = yield Team_1.Team.find().lean();
            console.log('\nVerifying team data:');
            verifyTeams.forEach(team => {
                console.log(`Team: ${team.name}, imageUrl: ${team.imageUrl}`);
            });
            process.exit(0);
        }
        catch (error) {
            console.error('Error resetting database:', error);
            process.exit(1);
        }
    });
}
resetDatabase();
