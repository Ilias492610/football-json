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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const types_1 = require("./types");
const database_1 = require("./database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const session_1 = __importDefault(require("./session"));
const secureMiddleware_1 = require("./secureMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set("view engine", "ejs");
app.use(express_1.default.json());
app.use(session_1.default);
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.set("views", path_1.default.join(__dirname, "views"));
app.set("port", (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000);
app.use((req, res, next) => {
    var _a, _b, _c;
    res.locals.isAuthenticated = ((_a = req.session) === null || _a === void 0 ? void 0 : _a.isAuthenticated) || false;
    res.locals.username = ((_b = req.session) === null || _b === void 0 ? void 0 : _b.username) || '';
    res.locals.role = ((_c = req.session) === null || _c === void 0 ? void 0 : _c.role) || '';
    next();
});
// Hulpfuncties
function filterPlayersByName(players, searchQuery) {
    if (!searchQuery)
        return players;
    return players.filter(player => player.name.toLowerCase().includes(searchQuery.toLowerCase()));
}
function filterTeamsByName(teams, searchQuery) {
    if (!searchQuery)
        return teams;
    return teams.filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()));
}
function sortPlayersByField(players, sortField, sortOrder) {
    return [...players].sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];
        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
            return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
        }
        else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
            return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
        }
        return 0;
    });
}
function sortTeamsByField(teams, sortField, sortOrder) {
    return [...teams].sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];
        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
            return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
        }
        else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
            return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
        }
        return 0;
    });
}
// Authenticatieroutes
app.get("/login", secureMiddleware_1.loggedIn, (req, res) => {
    var _a, _b;
    const errorMessage = (_a = req.session) === null || _a === void 0 ? void 0 : _a.errorMessage;
    const successMessage = (_b = req.session) === null || _b === void 0 ? void 0 : _b.successMessage;
    if (req.session) {
        req.session.errorMessage = undefined;
        req.session.successMessage = undefined;
    }
    res.render("login", {
        errorMessage,
        successMessage
    });
});
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            if (req.session)
                req.session.errorMessage = "Vul zowel gebruikersnaam als wachtwoord in";
            return res.redirect("/login");
        }
        const user = yield (0, database_1.findUserByUsername)(username);
        if (!user) {
            if (req.session)
                req.session.errorMessage = "Ongeldige gebruikersnaam of wachtwoord";
            return res.redirect("/login");
        }
        const passwordMatch = yield (0, database_1.comparePassword)(password, user.password);
        if (!passwordMatch) {
            if (req.session)
                req.session.errorMessage = "Ongeldige gebruikersnaam of wachtwoord";
            return res.redirect("/login");
        }
        if (req.session) {
            req.session.isAuthenticated = true;
            req.session.userId = user._id ? user._id.toString() : '';
            req.session.username = user.username;
            req.session.role = user.role;
            // Zorg ervoor dat de sessie wordt opgeslagen voordat we redirecten
            req.session.save((err) => {
                if (err) {
                    console.error('Fout bij opslaan van sessie:', err);
                }
                res.redirect("/");
            });
        }
        else {
            // Als er geen sessie is, redirect toch maar naar de homepage
            res.redirect("/");
        }
    }
    catch (error) {
        console.error('Fout bij inloggen:', error);
        if (req.session)
            req.session.errorMessage = "Er is een fout opgetreden bij het inloggen";
        res.redirect("/login");
    }
}));
app.get("/register", secureMiddleware_1.loggedIn, (req, res) => {
    var _a, _b;
    const errorMessage = (_a = req.session) === null || _a === void 0 ? void 0 : _a.errorMessage;
    const successMessage = (_b = req.session) === null || _b === void 0 ? void 0 : _b.successMessage;
    if (req.session) {
        req.session.errorMessage = undefined;
        req.session.successMessage = undefined;
    }
    res.render("register", {
        errorMessage,
        successMessage
    });
});
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const existingUser = yield (0, database_1.findUserByUsername)(username);
        if (existingUser) {
            req.session.errorMessage = 'Gebruikersnaam bestaat al';
            return res.redirect('/register');
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield database_1.usersCollection.insertOne({
            username: username,
            password: hashedPassword,
            role: types_1.UserRole.USER
        });
        req.session.successMessage = 'Registratie succesvol! Je kunt nu inloggen.';
        res.redirect('/login');
    }
    catch (error) {
        console.error('Registratiefout:', error);
        req.session.errorMessage = 'Er is een fout opgetreden tijdens de registratie';
        res.redirect('/register');
    }
}));
app.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Uitlogfout:', err);
            }
            res.redirect('/login');
        });
    }
    else {
        // Als er geen sessie is, redirect toch naar login
        res.redirect('/login');
    }
});
app.get("/", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield (0, database_1.loadPlayers)();
        const teams = yield (0, database_1.loadTeams)();
        const topPlayers = players.slice(0, 5);
        const topTeams = teams.slice(0, 5);
        res.render("index", {
            players: topPlayers,
            teams: topTeams,
            activePage: 'home'
        });
    }
    catch (error) {
        console.error('Fout bij het laden van homepagina:', error);
        res.status(500).render('error', { message: 'Kan homepagina niet laden' });
    }
}));
app.get("/players", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let players = yield (0, database_1.loadPlayers)();
        const searchQuery = req.query.search || '';
        const sortField = req.query.sortField || 'name';
        const sortOrder = req.query.sortOrder || 'asc';
        // Gebruik de hulpfuncties voor filteren en sorteren
        players = filterPlayersByName(players, searchQuery);
        players = sortPlayersByField(players, sortField, sortOrder);
        res.render("players", {
            players,
            sortField,
            sortOrder,
            searchQuery,
            activePage: 'players'
        });
    }
    catch (error) {
        console.error('Error loading players:', error);
        res.status(500).render('error', { message: 'Failed to load players' });
    }
}));
app.get("/player/:id", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield (0, database_1.loadPlayers)();
        const player = players.find((p) => p.id === req.params.id);
        if (!player) {
            return res.status(404).render('error', { message: 'Speler niet gevonden' });
        }
        res.render("player", {
            player,
            activePage: 'players'
        });
    }
    catch (error) {
        console.error('Fout bij het laden van spelerdetails:', error);
        res.status(500).render('error', { message: 'Kan spelerdetails niet laden' });
    }
}));
app.get("/player/:id/edit", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.session.role !== types_1.UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Toegang geweigerd. Beheerdersrechten vereist.' });
        }
        const players = yield (0, database_1.loadPlayers)();
        const teams = yield (0, database_1.loadTeams)();
        const player = players.find(p => p.id === req.params.id);
        if (!player) {
            return res.status(404).render('error', { message: 'Speler niet gevonden' });
        }
        res.render("edit-player", {
            player,
            teams,
            activePage: 'players'
        });
    }
    catch (error) {
        console.error('Fout bij het laden van speler-bewerkingsformulier:', error);
        res.status(500).render('error', { message: 'Kan speler-bewerkingsformulier niet laden' });
    }
}));
app.post("/player/:id/edit", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.session.role !== types_1.UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Toegang geweigerd. Beheerdersrechten vereist.' });
        }
        const playerId = req.params.id;
        const updatedPlayer = req.body;
        yield (0, database_1.updatePlayer)(playerId, updatedPlayer);
        res.redirect(`/player/${playerId}`);
    }
    catch (error) {
        console.error('Fout bij het bijwerken van speler:', error);
        res.status(500).render('error', { message: 'Kan speler niet bijwerken' });
    }
}));
// Teams routes
app.get("/teams", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let teams = yield (0, database_1.loadTeams)();
        const searchQuery = req.query.search || '';
        const sortField = req.query.sortField || 'name';
        const sortOrder = req.query.sortOrder || 'asc';
        // Gebruik de hulpfuncties voor filteren en sorteren
        teams = filterTeamsByName(teams, searchQuery);
        teams = sortTeamsByField(teams, sortField, sortOrder);
        res.render("teams", {
            teams,
            sortField,
            sortOrder,
            searchQuery,
            activePage: 'teams'
        });
    }
    catch (error) {
        console.error('Fout bij het laden van teams:', error);
        res.status(500).render('error', { message: 'Kan teams niet laden' });
    }
}));
app.get("/team/:id", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield (0, database_1.loadTeams)();
        const players = yield (0, database_1.loadPlayers)();
        const team = teams.find((t) => t.id === req.params.id);
        if (!team) {
            return res.status(404).render('error', { message: 'Team niet gevonden' });
        }
        const teamPlayers = players.filter((p) => p.currentTeam.id === (team === null || team === void 0 ? void 0 : team.id));
        res.render("team", {
            team,
            players: teamPlayers,
            activePage: 'teams'
        });
    }
    catch (error) {
        console.error('Fout bij het laden van teamdetails:', error);
        res.status(500).render('error', { message: 'Kan teamdetails niet laden' });
    }
}));
app.get("/team/:id/edit", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.session.role !== types_1.UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Toegang geweigerd. Beheerdersrechten vereist.' });
        }
        const teams = yield (0, database_1.loadTeams)();
        const team = teams.find(t => t.id === req.params.id);
        if (!team) {
            return res.status(404).render('error', { message: 'Team niet gevonden' });
        }
        res.render("edit-team", {
            team,
            activePage: 'teams'
        });
    }
    catch (error) {
        console.error('Fout bij het laden van team-bewerkingsformulier:', error);
        res.status(500).render('error', { message: 'Kan team-bewerkingsformulier niet laden' });
    }
}));
app.post("/team/:id/edit", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.session.role !== types_1.UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Toegang geweigerd. Beheerdersrechten vereist.' });
        }
        const teamId = req.params.id;
        const updatedTeam = req.body;
        yield (0, database_1.updateTeam)(teamId, updatedTeam);
        res.redirect(`/team/${teamId}`);
    }
    catch (error) {
        console.error('Fout bij het bijwerken van team:', error);
        res.status(500).render('error', { message: 'Kan team niet bijwerken' });
    }
}));
app.use((req, res) => {
    res.status(404).render('error', { message: 'Pagina niet gevonden' });
});
app.listen(app.get("port"), () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Server gestart op http://localhost:" + app.get("port"));
    try {
        // Maak verbinding met de database
        yield Promise.resolve().then(() => __importStar(require("./database"))).then(db => db.connect());
        // Initialiseer standaardgebruikers (beheerder en gewone gebruiker)
        yield (0, database_1.initializeUsers)();
    }
    catch (error) {
        console.error("Kan geen verbinding maken met de database:", error);
    }
}));
exports.default = app;
