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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const database_1 = __importDefault(require("./config/database"));
const dataService_1 = require("./services/dataService");
const User_1 = require("./models/User");
const User_2 = require("./models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const initUsers_1 = require("./initUsers");
const app = (0, express_1.default)();
const port = 3000;
// Connect to MongoDB and initialize default users
(0, database_1.default)().then(() => {
    // Initialize default users (admin and regular user)
    (0, initUsers_1.initializeUsers)();
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});
// Define root directory
const rootDir = path_1.default.resolve(__dirname, '../..');
const viewsPath = path_1.default.join(rootDir, 'views');
// Debug logs
console.log('Root directory:', rootDir);
console.log('Views directory path:', viewsPath);
console.log('Current directory:', __dirname);
console.log('Views directory exists:', fs_1.default.existsSync(viewsPath));
// Middleware for static files
// This will serve files from the public directory (e.g., /css/style.css -> public/css/style.css)
app.use(express_1.default.static(path_1.default.join(rootDir, 'public')));
// This ensures that paths like /images/teams/filename.png will be correctly resolved
// to public/images/teams/filename.png
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Session configuration
app.use((0, express_session_1.default)({
    secret: 'football-json-secret-key',
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb+srv://hamdaouiilias14:N7ymXJvMs0fzDvyA@webontwikkeling.abgrzzs.mongodb.net/?retryWrites=true&w=majority&appName=Webontwikkeling' }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: process.env.NODE_ENV === 'production'
    }
}));
// Make session data available to all templates
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.username = req.session.username || '';
    res.locals.role = req.session.role || '';
    next();
});
// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
        next();
    }
    else {
        res.redirect('/login');
    }
};
// Admin role middleware
const isAdmin = (req, res, next) => {
    if (req.session.isAuthenticated && req.session.role === User_1.UserRole.ADMIN) {
        next();
    }
    else {
        res.status(403).render('error', { message: 'Access denied. Admin privileges required.' });
    }
};
// Set view engine
app.set('view engine', 'ejs');
app.set('views', viewsPath);
// Routes
// Home route - redirect to players or login based on authentication status
app.get('/', (req, res) => {
    if (req.session.isAuthenticated) {
        res.redirect('/players');
    }
    else {
        res.redirect('/login');
    }
});
// Login routes
app.get('/login', (req, res) => {
    if (req.session.isAuthenticated) {
        return res.redirect('/players');
    }
    res.render('login');
});
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Find user by username
        const user = yield User_2.User.findOne({ username });
        if (!user) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        // Compare passwords
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        // Set session data
        req.session.userId = user._id.toString();
        req.session.username = user.username;
        req.session.role = user.role;
        req.session.isAuthenticated = true;
        res.redirect('/players');
    }
    catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'An error occurred during login' });
    }
}));
// Register routes
app.get('/register', (req, res) => {
    if (req.session.isAuthenticated) {
        return res.redirect('/players');
    }
    res.render('register');
});
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Check if username already exists
        const existingUser = yield User_2.User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'Username already exists' });
        }
        // Create new user with USER role
        const user = new User_2.User({
            username,
            password, // Will be hashed by the pre-save hook
            role: User_1.UserRole.USER
        });
        yield user.save();
        res.redirect('/login');
    }
    catch (error) {
        console.error('Registration error:', error);
        res.render('register', { error: 'An error occurred during registration' });
    }
}));
// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});
// Protected routes - require authentication
app.get('/players', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield (0, dataService_1.loadPlayers)();
        const sortField = req.query.sortField || 'name';
        const sortOrder = req.query.sortOrder || 'asc';
        const searchQuery = req.query.search || '';
        // Apply filtering if needed
        let filteredPlayers = [...players];
        if (searchQuery) {
            filteredPlayers = players.filter(player => player.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        // Apply sorting
        filteredPlayers.sort((a, b) => {
            var _a, _b;
            let valA, valB;
            // Handle nested properties like currentTeam.name
            if (sortField === 'currentTeam') {
                valA = ((_a = a.currentTeam) === null || _a === void 0 ? void 0 : _a.name) || '';
                valB = ((_b = b.currentTeam) === null || _b === void 0 ? void 0 : _b.name) || '';
            }
            else if (sortField === 'age') {
                // For numeric fields, convert to number
                valA = Number(a[sortField]);
                valB = Number(b[sortField]);
            }
            else {
                valA = a[sortField];
                valB = b[sortField];
            }
            // Handle string comparison
            if (typeof valA === 'string' && typeof valB === 'string') {
                if (sortOrder === 'asc') {
                    return valA.localeCompare(valB);
                }
                else {
                    return valB.localeCompare(valA);
                }
            }
            // Handle numeric comparison
            const numA = Number(valA);
            const numB = Number(valB);
            if (sortOrder === 'asc') {
                return numA - numB;
            }
            else {
                return numB - numA;
            }
        });
        res.render('players', {
            players: filteredPlayers,
            sortField,
            sortOrder,
            searchQuery
        });
    }
    catch (error) {
        console.error('Error loading players:', error);
        res.status(500).send('Error loading players');
    }
}));
app.get('/teams', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield (0, dataService_1.loadTeams)();
        const sortField = req.query.sortField || 'name';
        const sortOrder = req.query.sortOrder || 'asc';
        const searchQuery = req.query.search || '';
        // Apply filtering if needed
        let filteredTeams = [...teams];
        if (searchQuery) {
            filteredTeams = teams.filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        // Apply sorting
        filteredTeams.sort((a, b) => {
            let valA, valB;
            // For founded year, ensure numeric comparison
            if (sortField === 'foundedYear') {
                valA = Number(a[sortField]);
                valB = Number(b[sortField]);
            }
            else {
                valA = a[sortField];
                valB = b[sortField];
            }
            // Handle string comparison
            if (typeof valA === 'string' && typeof valB === 'string') {
                if (sortOrder === 'asc') {
                    return valA.localeCompare(valB);
                }
                else {
                    return valB.localeCompare(valA);
                }
            }
            // Handle numeric comparison
            const numA = Number(valA);
            const numB = Number(valB);
            if (sortOrder === 'asc') {
                return numA - numB;
            }
            else {
                return numB - numA;
            }
        });
        res.render('teams', {
            teams: filteredTeams,
            sortField,
            sortOrder,
            searchQuery
        });
    }
    catch (error) {
        console.error('Error loading teams:', error);
        res.status(500).send('Error loading teams');
    }
}));
app.get('/player/:id', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield (0, dataService_1.loadPlayers)();
        const teams = yield (0, dataService_1.loadTeams)();
        const player = players.find(p => p.id === req.params.id);
        const team = teams.find(t => t.id === (player === null || player === void 0 ? void 0 : player.currentTeam.id));
        if (!player) {
            return res.status(404).send('Player not found');
        }
        res.render('player', {
            player,
            team
        });
    }
    catch (error) {
        console.error('Error loading player details:', error);
        res.status(500).send('Error loading player details');
    }
}));
// Admin-only routes for editing players
app.get('/player/:id/edit', isAuthenticated, isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield (0, dataService_1.loadPlayers)();
        const teams = yield (0, dataService_1.loadTeams)();
        const player = players.find(p => p.id === req.params.id);
        if (!player) {
            return res.status(404).send('Player not found');
        }
        res.render('edit-player', {
            player,
            teams
        });
    }
    catch (error) {
        console.error('Error loading player edit form:', error);
        res.status(500).send('Error loading player edit form');
    }
}));
app.post('/player/:id/update', isAuthenticated, isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, position, nationality, age, description, teamId } = req.body;
        const playerId = req.params.id;
        // Get the team details for the selected team
        const teams = yield (0, dataService_1.loadTeams)();
        const selectedTeam = teams.find(t => t.id === teamId);
        if (!selectedTeam) {
            return res.status(404).send('Selected team not found');
        }
        // Update player data
        const updatedPlayer = {
            name,
            position,
            nationality,
            age: parseInt(age),
            description,
            currentTeam: {
                id: selectedTeam.id,
                name: selectedTeam.name,
                league: selectedTeam.league,
                teamLogoUrl: selectedTeam.imageUrl,
                foundedYear: selectedTeam.foundedYear,
                stadium: selectedTeam.stadium
            }
        };
        yield (0, dataService_1.updatePlayer)(playerId, updatedPlayer);
        res.redirect(`/player/${playerId}`);
    }
    catch (error) {
        console.error('Error updating player:', error);
        res.status(500).send('Error updating player');
    }
}));
app.get('/team/:id', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield (0, dataService_1.loadTeams)();
        const players = yield (0, dataService_1.loadPlayers)();
        const team = teams.find(t => t.id === req.params.id);
        const teamPlayers = players.filter(p => p.currentTeam.id === (team === null || team === void 0 ? void 0 : team.id));
        if (!team) {
            return res.status(404).send('Team not found');
        }
        res.render('team', {
            team: team,
            players: teamPlayers
        });
    }
    catch (error) {
        console.error('Error loading team details:', error);
        res.status(500).send('Error loading team details');
    }
}));
// Admin-only routes for editing teams
app.get('/team/:id/edit', isAuthenticated, isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield (0, dataService_1.loadTeams)();
        const team = teams.find(t => t.id === req.params.id);
        if (!team) {
            return res.status(404).send('Team not found');
        }
        res.render('edit-team', {
            team
        });
    }
    catch (error) {
        console.error('Error loading team edit form:', error);
        res.status(500).send('Error loading team edit form');
    }
}));
app.post('/team/:id/update', isAuthenticated, isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, country, league, foundedYear, stadium, manager } = req.body;
        const teamId = req.params.id;
        // Update team data
        const updatedTeam = {
            name,
            country,
            league,
            foundedYear: parseInt(foundedYear),
            stadium,
            manager
        };
        yield (0, dataService_1.updateTeam)(teamId, updatedTeam);
        res.redirect(`/team/${teamId}`);
    }
    catch (error) {
        console.error('Error updating team:', error);
        res.status(500).send('Error updating team');
    }
}));
// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
