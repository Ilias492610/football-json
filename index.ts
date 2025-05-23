import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { Player, Team, User, UserRole } from "./types";
import { loadPlayers, loadTeams, updatePlayer, updateTeam, findUserByUsername, comparePassword, initializeUsers, usersCollection } from "./database";
import bcrypt from 'bcrypt';
import session from "./session";
import { secureMiddleware, loggedIn } from "./secureMiddleware";

dotenv.config();

const app: Express = express();
const favicon = require("serve-favicon");

app.set("view engine", "ejs");
app.use(express.json());
app.use(session);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

// Make session data available to all templates
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.username = req.session.username || '';
    res.locals.role = req.session.role || '';
    next();
});

app.set("port", process.env.PORT ?? 3000);

// Authentication routes
app.get("/login", loggedIn, (req, res) => {
    // Get flash message if any and clear it from session
    const errorMessage = req.session.errorMessage;
    const successMessage = req.session.successMessage;
    req.session.errorMessage = undefined;
    req.session.successMessage = undefined;
    
    res.render("login", { errorMessage, successMessage });
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user in database
        const user = await findUserByUsername(req.body.username);
        if (!user) {
            req.session.errorMessage = 'Invalid username or password';
            return res.redirect('/login');
        }

        const isMatch = await comparePassword(req.body.password, user.password);
        if (!isMatch) {
            req.session.errorMessage = 'Invalid username or password';
            return res.redirect('/login');
        }
        
        // Set session data
        req.session.userId = user._id ? user._id.toString() : '';
        req.session.username = user.username;
        req.session.role = user.role;
        req.session.isAuthenticated = true;
        
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.session.errorMessage = 'An error occurred during login';
        res.redirect('/login');
    }
});

app.get("/register", loggedIn, (req, res) => {
    // Get flash message if any and clear it from session
    const errorMessage = req.session.errorMessage;
    const successMessage = req.session.successMessage;
    req.session.errorMessage = undefined;
    req.session.successMessage = undefined;
    
    res.render("register", { errorMessage, successMessage });
});

app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if username already exists
        const existingUser = await findUserByUsername(req.body.username);
        if (existingUser) {
            req.session.errorMessage = 'Username already exists';
            return res.redirect('/register');
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await usersCollection.insertOne({
            username: req.body.username,
            password: hashedPassword,
            role: UserRole.USER
        });
        
        req.session.successMessage = 'Registration successful. Please log in.';
        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.session.errorMessage = 'An error occurred during registration';
        res.redirect('/register');
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// Home route
app.get("/", secureMiddleware, async (req, res) => {
    try {
        // Load both players and teams for the homepage
        const players = await loadPlayers();
        const teams = await loadTeams();
        
        // Get top 5 players and teams
        const topPlayers = players.slice(0, 5);
        const topTeams = teams.slice(0, 5);
        
        res.render("index", { 
            players: topPlayers, 
            teams: topTeams,
            activePage: 'home'
        });
    } catch (error) {
        console.error('Error loading homepage data:', error);
        res.status(500).render('error', { message: 'Failed to load homepage data' });
    }
});

// Players routes
app.get("/players", secureMiddleware, async (req: Request, res: Response) => {
    try {
        const players = await loadPlayers();
        const sortField = req.query.sortField as string || 'name';
        const sortOrder = req.query.sortOrder as string || 'asc';
        
        // Sort players based on the provided sort field and order
        players.sort((a: Player, b: Player) => {
            const fieldA = a[sortField as keyof Player];
            const fieldB = b[sortField as keyof Player];
            
            if (typeof fieldA === 'string' && typeof fieldB === 'string') {
                return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
                return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
            }
            return 0;
        });
        
        res.render("players", { 
            players,
            sortField,
            sortOrder,
            searchQuery: req.query.search || '',
            activePage: 'players'
        });
    } catch (error) {
        console.error('Error loading players:', error);
        res.status(500).render('error', { message: 'Failed to load players' });
    }
});

app.get("/player/:id", secureMiddleware, async (req: Request, res: Response) => {
    try {
        const players = await loadPlayers();
        const player = players.find((p: Player) => p.id === req.params.id);
        
        if (!player) {
            return res.status(404).render('error', { message: 'Player not found' });
        }
        
        res.render("player", { 
            player,
            activePage: 'players'
        });
    } catch (error) {
        console.error('Error loading player details:', error);
        res.status(500).render('error', { message: 'Failed to load player details' });
    }
});

app.get("/player/:id/edit", secureMiddleware, async (req: Request, res: Response) => {
    try {
        // Check if user is admin
        if (req.session.role !== UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Access denied. Admin privileges required.' });
        }
        
        const players = await loadPlayers();
        const teams = await loadTeams();
        const player = players.find(p => p.id === req.params.id);
        
        if (!player) {
            return res.status(404).render('error', { message: 'Player not found' });
        }
        
        res.render("edit-player", { 
            player,
            teams,
            activePage: 'players'
        });
    } catch (error) {
        console.error('Error loading player edit form:', error);
        res.status(500).render('error', { message: 'Failed to load player edit form' });
    }
});

app.post("/player/:id/edit", secureMiddleware, async (req: Request<{ id: string }>, res: Response) => {
    try {
        // Check if user is admin
        if (req.session.role !== UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Access denied. Admin privileges required.' });
        }
        
        const playerId = req.params.id;
        const updatedPlayer = req.body;
        
        // Update player in database
        await updatePlayer(playerId, updatedPlayer);
        
        res.redirect(`/player/${playerId}`);
    } catch (error) {
        console.error('Error updating player:', error);
        res.status(500).render('error', { message: 'Failed to update player' });
    }
});

// Teams routes
app.get("/teams", secureMiddleware, async (req: Request, res: Response) => {
    try {
        const teams = await loadTeams();
        const sortField = req.query.sortField as string || 'name';
        const sortOrder = req.query.sortOrder as string || 'asc';
        
        // Sort teams based on the provided sort field and order
        teams.sort((a: Team, b: Team) => {
            const fieldA = a[sortField as keyof Team];
            const fieldB = b[sortField as keyof Team];
            
            if (typeof fieldA === 'string' && typeof fieldB === 'string') {
                return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
                return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
            }
            return 0;
        });
        
        res.render("teams", { 
            teams,
            sortField,
            sortOrder,
            searchQuery: req.query.search || '',
            activePage: 'teams'
        });
    } catch (error) {
        console.error('Error loading teams:', error);
        res.status(500).render('error', { message: 'Failed to load teams' });
    }
});

app.get("/team/:id", secureMiddleware, async (req: Request, res: Response) => {
    try {
        const teams = await loadTeams();
        const players = await loadPlayers();
        const team = teams.find((t: Team) => t.id === req.params.id);
        
        if (!team) {
            return res.status(404).render('error', { message: 'Team not found' });
        }
        
        // Find players that belong to this team
        const teamPlayers = players.filter((p: Player) => p.currentTeam.id === team?.id);
        
        res.render("team", { 
            team,
            players: teamPlayers,
            activePage: 'teams'
        });
    } catch (error) {
        console.error('Error loading team details:', error);
        res.status(500).render('error', { message: 'Failed to load team details' });
    }
});

app.get("/team/:id/edit", secureMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.session.role !== UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Access denied. Admin privileges required.' });
        }
        
        const teams = await loadTeams();
        const team = teams.find(t => t.id === req.params.id);
        
        if (!team) {
            return res.status(404).render('error', { message: 'Team not found' });
        }
        
        res.render("edit-team", { 
            team,
            activePage: 'teams'
        });
    } catch (error) {
        console.error('Error loading team edit form:', error);
        res.status(500).render('error', { message: 'Failed to load team edit form' });
    }
});

app.post("/team/:id/edit", secureMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.session.role !== UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Access denied. Admin privileges required.' });
        }
        
        const teamId = req.params.id;
        const updatedTeam = req.body;
        
        // Update team in database
        await updateTeam(teamId, updatedTeam);
        
        res.redirect(`/team/${teamId}`);
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).render('error', { message: 'Failed to update team' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { message: 'Page not found' });
});

app.listen(app.get("port"), async () => {
    console.log("Server started on http://localhost:" + app.get("port"));
    try {
        // Connect to the database
        await import("./database").then(db => db.connect());
        
        // Initialize default users (admin and regular user)
        await initializeUsers();
    } catch (error) {
        console.error("Error starting server:", error);
    }
});

export default app;
