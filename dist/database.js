"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.close = exports.connect = exports.initializeUsers = exports.comparePassword = exports.findUserByUsername = exports.updateTeam = exports.updatePlayer = exports.getTeamById = exports.getPlayerById = exports.loadTeams = exports.loadPlayers = exports.usersCollection = exports.teamsCollection = exports.playersCollection = exports.URI = void 0;
const mongodb_1 = require("mongodb");
const types_1 = require("./types");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PLAYERS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/players.json';
const TEAMS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/teams.json';
exports.URI = process.env.MONGODB_URI || 'mongodb+srv://hamdaouiilias14:N7ymXJvMs0fzDvyA@webontwikkeling.abgrzzs.mongodb.net/?retryWrites=true&w=majority&appName=Webontwikkeling';
const CLIENT = new mongodb_1.MongoClient(exports.URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
});
exports.playersCollection = CLIENT.db("football-app").collection("players");
exports.teamsCollection = CLIENT.db("football-app").collection("teams");
exports.usersCollection = CLIENT.db("football-app").collection("users");
function fetchDataFromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fetchModule = yield Promise.resolve().then(() => __importStar(require('node-fetch')));
            const fetch = fetchModule.default;
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Fout bij het ophalen van data van ${url}: ${response.statusText} (status: ${response.status})`);
            }
            const data = yield response.json();
            if (!Array.isArray(data)) {
                console.warn(`Data opgehaald van ${url} is geen array. Ontvangen type:`, typeof data);
                if (typeof data === 'object' && data !== null) {
                    const keys = Object.keys(data);
                    if (keys.length === 1 && Array.isArray(data[keys[0]])) {
                        console.log(`Array gevonden onder sleutel '${keys[0]}' in data van ${url}`);
                        return data[keys[0]];
                    }
                }
                return [];
            }
            return data;
        }
        catch (error) {
            console.error(`Fout bij het ophalen of verwerken van data van ${url}:`, error);
            return [];
        }
    });
}
const loadPlayers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield exports.playersCollection.countDocuments();
        if (count === 0) {
            console.log('Geen spelers in MongoDB. Ophalen van URL:', PLAYERS_JSON_URL);
            const players = yield fetchDataFromUrl(PLAYERS_JSON_URL);
            if (players.length > 0) {
                yield exports.playersCollection.insertMany(players);
                console.log(`${players.length} spelers opgehaald van URL en opgeslagen in MongoDB`);
                return players;
            }
            else {
                console.log('Geen spelers opgehaald van URL of URL is incorrect/leeg.');
                return [];
            }
        }
        const playersFromDB = yield exports.playersCollection.find().toArray();
        console.log(`${playersFromDB.length} spelers gevonden in MongoDB`);
        return playersFromDB;
    }
    catch (error) {
        console.error('Fout bij het laden van spelers:', error);
        return [];
    }
});
exports.loadPlayers = loadPlayers;
const loadTeams = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield exports.teamsCollection.countDocuments();
        if (count === 0) {
            console.log('Geen teams in MongoDB. Ophalen van URL:', TEAMS_JSON_URL);
            const teams = yield fetchDataFromUrl(TEAMS_JSON_URL);
            if (teams.length > 0) {
                yield exports.teamsCollection.insertMany(teams);
                console.log(`${teams.length} teams opgehaald van URL en opgeslagen in MongoDB`);
                return teams;
            }
            else {
                console.log('Geen teams opgehaald van URL of URL is incorrect/leeg.');
                return [];
            }
        }
        const teamsFromDB = yield exports.teamsCollection.find().toArray();
        console.log(`${teamsFromDB.length} teams gevonden in MongoDB`);
        return teamsFromDB;
    }
    catch (error) {
        console.error('Fout bij het laden van teams:', error);
        return [];
    }
});
exports.loadTeams = loadTeams;
const getPlayerById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const player = yield exports.playersCollection.findOne({ id });
        return player;
    }
    catch (error) {
        console.error('Error getting player by ID:', error);
        return null;
    }
});
exports.getPlayerById = getPlayerById;
const getTeamById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield exports.teamsCollection.findOne({ id });
        return team;
    }
    catch (error) {
        console.error('Error getting team by ID:', error);
        return null;
    }
});
exports.getTeamById = getTeamById;
const updatePlayer = (id, playerData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield exports.playersCollection.findOneAndUpdate({ id }, { $set: playerData }, { returnDocument: 'after' });
        return (result === null || result === void 0 ? void 0 : result.value) || null;
    }
    catch (error) {
        console.error('Error updating player:', error);
        return null;
    }
});
exports.updatePlayer = updatePlayer;
const updateTeam = (id, teamData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield exports.teamsCollection.findOneAndUpdate({ id }, { $set: teamData }, { returnDocument: 'after' });
        return (result === null || result === void 0 ? void 0 : result.value) || null;
    }
    catch (error) {
        console.error('Error updating team:', error);
        return null;
    }
});
exports.updateTeam = updateTeam;
const findUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield exports.usersCollection.findOne({ username });
        return user;
    }
    catch (error) {
        console.error('Error finding user by username:', error);
        return null;
    }
});
exports.findUserByUsername = findUserByUsername;
const comparePassword = (candidatePassword, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield bcrypt_1.default.compare(candidatePassword, hashedPassword);
    }
    catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
});
exports.comparePassword = comparePassword;
const initializeUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminExists = yield exports.usersCollection.findOne({ username: 'admin' });
        if (!adminExists) {
            const adminPassword = yield bcrypt_1.default.hash('admin123', 10);
            yield exports.usersCollection.insertOne({
                username: 'admin',
                password: adminPassword,
                role: types_1.UserRole.ADMIN
            });
            console.log('Admin-gebruiker aangemaakt');
        }
        else {
            console.log('Admin-gebruiker bestaat al');
        }
        const userExists = yield exports.usersCollection.findOne({ username: 'user' });
        if (!userExists) {
            const userPassword = yield bcrypt_1.default.hash('user123', 10);
            yield exports.usersCollection.insertOne({
                username: 'user',
                password: userPassword,
                role: types_1.UserRole.USER
            });
            console.log('Gewone gebruiker aangemaakt');
        }
        else {
            console.log('Gewone gebruiker bestaat al');
        }
        console.log('User initialization complete');
    }
    catch (error) {
        console.error('Error initializing users:', error);
    }
});
exports.initializeUsers = initializeUsers;
const connect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield CLIENT.connect();
        console.log('Connected to the database.');
        yield (0, exports.initializeUsers)();
    }
    catch (error) {
        console.error('Error connecting to the database:', error);
        console.log('Attempting to continue without exiting...');
    }
});
exports.connect = connect;
const close = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield CLIENT.close();
        console.log('Closing database connection.');
    }
    catch (error) {
        console.error('Error closing database connection:', error);
    }
});
exports.close = close;
