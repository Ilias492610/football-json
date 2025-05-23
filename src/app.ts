import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import session from 'express-session';
import connectDB from './config/database';
import { loadPlayers, loadTeams, updatePlayer, updateTeam } from './services/dataService';
import { Player } from './interfaces/types';
import { Team } from './interfaces/types';
import { UserRole } from './models/User';
import { User } from './models/User';
import bcrypt from 'bcrypt';
import MongoStore from 'connect-mongo';
import { initializeUsers } from './initUsers';

// Extend Express Request type to include session properties
declare module 'express-session' {
    interface SessionData {
        userId: string;
        username: string;
        role: UserRole;
        isAuthenticated: boolean;
    }
}

const app = express();
const port = 3000;

// Connect to MongoDB and initialize default users
connectDB().then(() => {
    // Initialize default users (admin and regular user)
    initializeUsers();
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});

// Define root directory
const rootDir = path.resolve(__dirname, '../..');
const viewsPath = path.join(rootDir, 'views');

// Debug logs
console.log('Root directory:', rootDir);
console.log('Views directory path:', viewsPath);
console.log('Current directory:', __dirname);
console.log('Views directory exists:', fs.existsSync(viewsPath));

// Middleware for static files
// This will serve files from the public directory (e.g., /css/style.css -> public/css/style.css)
app.use(express.static(path.join(rootDir, 'public')));

// This ensures that paths like /images/teams/filename.png will be correctly resolved
// to public/images/teams/filename.png
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'football-json-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb+srv://hamdaouiilias14:N7ymXJvMs0fzDvyA@webontwikkeling.abgrzzs.mongodb.net/?retryWrites=true&w=majority&appName=Webontwikkeling' }),
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
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Admin role middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.isAuthenticated && req.session.role === UserRole.ADMIN) {
        next();
    } else {
        res.status(403).render('error', { message: 'Access denied. Admin privileges required.' });
    }
};

// Set view engine
app.set('view engine', 'ejs');
app.set('views', viewsPath);

// Routes
// Home route - redirect to players or login based on authentication status
app.get('/', isAuthenticated, async (req, res) => {
    try {
        // Load both players and teams for the homepage
        const players = await loadPlayers();
        const teams = await loadTeams();
        
        // Get top 5 players and teams
        const topPlayers = players.slice(0, 5);
        const topTeams = teams.slice(0, 5);
        
        res.render('index', { 
            players: topPlayers, 
            teams: topTeams,
            isAuthenticated: req.session.isAuthenticated,
            username: req.session.username,
            role: req.session.role,
            activePage: 'home'
        });
    } catch (error) {
        console.error('Error loading homepage data:', error);
        res.status(500).render('error', { message: 'Failed to load homepage data' });
    }
});

// Login routes
app.get('/login', (req, res) => {
    if (req.session.isAuthenticated) {
        return res.redirect('/players');
    }
    res.render('login');
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        
        // Set session data
        req.session.userId = user._id.toString();
        req.session.username = user.username;
        req.session.role = user.role;
        req.session.isAuthenticated = true;
        
        res.redirect('/players');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'An error occurred during login' });
    }
});

// Register routes
app.get('/register', (req, res) => {
    if (req.session.isAuthenticated) {
        return res.redirect('/players');
    }
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'Username already exists' });
        }
        
        // Create new user with USER role
        const user = new User({
            username,
            password, // Will be hashed by the pre-save hook
            role: UserRole.USER
        });
        
        await user.save();
        
        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { error: 'An error occurred during registration' });
    }
});

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
app.get('/players', isAuthenticated, async (req, res) => {
    try {
        const players = await loadPlayers();
        const sortField = req.query.sortField as string || 'name';
        const sortOrder = req.query.sortOrder as string || 'asc';
        const searchQuery = req.query.search as string || '';
        
        // Apply filtering if needed
        let filteredPlayers = [...players];
        if (searchQuery) {
            filteredPlayers = players.filter(player => 
                player.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Apply sorting
        filteredPlayers.sort((a, b) => {
            let valA, valB;
            
            // Handle nested properties like currentTeam.name
            if (sortField === 'currentTeam') {
                valA = a.currentTeam?.name || '';
                valB = b.currentTeam?.name || '';
            } else if (sortField === 'age') {
                // For numeric fields, convert to number
                valA = Number(a[sortField as keyof typeof a]);
                valB = Number(b[sortField as keyof typeof b]);
            } else {
                valA = a[sortField as keyof typeof a];
                valB = b[sortField as keyof typeof b];
            }
            
            // Handle string comparison
            if (typeof valA === 'string' && typeof valB === 'string') {
                if (sortOrder === 'asc') {
                    return valA.localeCompare(valB);
                } else {
                    return valB.localeCompare(valA);
                }
            }
            
            // Handle numeric comparison
            const numA = Number(valA);
            const numB = Number(valB);
            if (sortOrder === 'asc') {
                return numA - numB;
            } else {
                return numB - numA;
            }
        });
        
        res.render('players', { 
            players: filteredPlayers, 
            sortField, 
            sortOrder, 
            searchQuery
        });
    } catch (error) {
        console.error('Error loading players:', error);
        res.status(500).send('Error loading players');
    }
});

app.get('/teams', isAuthenticated, async (req, res) => {
    try {
        const teams = await loadTeams();
        const sortField = req.query.sortField as string || 'name';
        const sortOrder = req.query.sortOrder as string || 'asc';
        const searchQuery = req.query.search as string || '';
        
        // Apply filtering if needed
        let filteredTeams = [...teams];
        if (searchQuery) {
            filteredTeams = teams.filter(team => 
                team.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Apply sorting
        filteredTeams.sort((a, b) => {
            let valA, valB;
            
            // For founded year, ensure numeric comparison
            if (sortField === 'foundedYear') {
                valA = Number(a[sortField as keyof typeof a]);
                valB = Number(b[sortField as keyof typeof b]);
            } else {
                valA = a[sortField as keyof typeof a];
                valB = b[sortField as keyof typeof b];
            }
            
            // Handle string comparison
            if (typeof valA === 'string' && typeof valB === 'string') {
                if (sortOrder === 'asc') {
                    return valA.localeCompare(valB);
                } else {
                    return valB.localeCompare(valA);
                }
            }
            
            // Handle numeric comparison
            const numA = Number(valA);
            const numB = Number(valB);
            if (sortOrder === 'asc') {
                return numA - numB;
            } else {
                return numB - numA;
            }
        });
        
        res.render('teams', { 
            teams: filteredTeams, 
            sortField, 
            sortOrder, 
            searchQuery
        });
    } catch (error) {
        console.error('Error loading teams:', error);
        res.status(500).send('Error loading teams');
    }
});

app.get('/player/:id', isAuthenticated, async (req, res) => {
    try {
        const players = await loadPlayers();
        const teams = await loadTeams();
        const player = players.find(p => p.id === req.params.id);
        const team = teams.find(t => t.id === player?.currentTeam.id);
        
        if (!player) {
            return res.status(404).send('Player not found');
        }
        
        res.render('player', { 
            player, 
            team
        });
    } catch (error) {
        console.error('Error loading player details:', error);
        res.status(500).send('Error loading player details');
    }
});

// Admin-only routes for editing players
app.get('/player/:id/edit', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const players = await loadPlayers();
        const teams = await loadTeams();
        const player = players.find(p => p.id === req.params.id);
        
        if (!player) {
            return res.status(404).send('Player not found');
        }
        
        res.render('edit-player', { 
            player, 
            teams
        });
    } catch (error) {
        console.error('Error loading player edit form:', error);
        res.status(500).send('Error loading player edit form');
    }
});

app.post('/player/:id/update', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, position, nationality, age, description, teamId } = req.body;
        const playerId = req.params.id;
        
        // Get the team details for the selected team
        const teams = await loadTeams();
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
                teamLogoUrl: selectedTeam.imageUrl as string,
                foundedYear: selectedTeam.foundedYear,
                stadium: selectedTeam.stadium
            }
        };
        
        await updatePlayer(playerId, updatedPlayer);
        
        res.redirect(`/player/${playerId}`);
    } catch (error) {
        console.error('Error updating player:', error);
        res.status(500).send('Error updating player');
    }
});

app.get('/team/:id', isAuthenticated, async (req, res) => {
    try {
        const teams = await loadTeams();
        const players = await loadPlayers();
        const team = teams.find(t => t.id === req.params.id);
        const teamPlayers = players.filter(p => p.currentTeam.id === team?.id);
        
        if (!team) {
            return res.status(404).send('Team not found');
        }
        
        res.render('team', { 
            team: team, 
            players: teamPlayers
        });
    } catch (error) {
        console.error('Error loading team details:', error);
        res.status(500).send('Error loading team details');
    }
});

// Admin-only routes for editing teams
app.get('/team/:id/edit', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const teams = await loadTeams();
        const team = teams.find(t => t.id === req.params.id);
        
        if (!team) {
            return res.status(404).send('Team not found');
        }
        
        res.render('edit-team', { 
            team
        });
    } catch (error) {
        console.error('Error loading team edit form:', error);
        res.status(500).send('Error loading team edit form');
    }
});

app.post('/team/:id/update', isAuthenticated, isAdmin, async (req, res) => {
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
        
        await updateTeam(teamId, updatedTeam);
        
        res.redirect(`/team/${teamId}`);
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).send('Error updating team');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 