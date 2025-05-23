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

app.set("view engine", "ejs");
app.use(express.json());
app.use(session);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session?.isAuthenticated || false;
    res.locals.username = req.session?.username || '';
    res.locals.role = req.session?.role || '';
    next();
});

// Hulpfuncties
function filterPlayersByName(players: Player[], searchQuery: string): Player[] {
    if (!searchQuery) return players;
    return players.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
}

function filterTeamsByName(teams: Team[], searchQuery: string): Team[] {
    if (!searchQuery) return teams;
    return teams.filter(team => 
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
}

function sortPlayersByField(players: Player[], sortField: string, sortOrder: string): Player[] {
    return [...players].sort((a, b) => {
        const fieldA = a[sortField as keyof Player];
        const fieldB = b[sortField as keyof Player];
        
        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
            return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
        } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
            return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
        }
        return 0;
    });
}

function sortTeamsByField(teams: Team[], sortField: string, sortOrder: string): Team[] {
    return [...teams].sort((a, b) => {
        const fieldA = a[sortField as keyof Team];
        const fieldB = b[sortField as keyof Team];
        
        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
            return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
        } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
            return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
        }
        return 0;
    });
}

// Authenticatieroutes
app.get("/login", loggedIn, (req, res) => {
    const errorMessage = req.session?.errorMessage;
    const successMessage = req.session?.successMessage;
    
    if (req.session) {
        req.session.errorMessage = undefined;
        req.session.successMessage = undefined;
    }
    
    res.render("login", { 
        errorMessage, 
        successMessage
    });
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            if (req.session) req.session.errorMessage = "Vul zowel gebruikersnaam als wachtwoord in";
            return res.redirect("/login");
        }
        
        const user = await findUserByUsername(username);
        
        if (!user) {
            if (req.session) req.session.errorMessage = "Ongeldige gebruikersnaam of wachtwoord";
            return res.redirect("/login");
        }
        
        const passwordMatch = await comparePassword(password, user.password);
        
        if (!passwordMatch) {
            if (req.session) req.session.errorMessage = "Ongeldige gebruikersnaam of wachtwoord";
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
        } else {
            // Als er geen sessie is, redirect toch maar naar de homepage
            res.redirect("/");
        }
    } catch (error) {
        console.error('Fout bij inloggen:', error);
        if (req.session) req.session.errorMessage = "Er is een fout opgetreden bij het inloggen";
        res.redirect("/login");
    }
});

app.get("/register", loggedIn, (req, res) => {
    const errorMessage = req.session?.errorMessage;
    const successMessage = req.session?.successMessage;
    
    if (req.session) {
        req.session.errorMessage = undefined;
        req.session.successMessage = undefined;
    }
    
    res.render("register", {
        errorMessage,
        successMessage
    });
});

app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            req.session.errorMessage = 'Gebruikersnaam bestaat al';
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await usersCollection.insertOne({
            username: username,
            password: hashedPassword,
            role: UserRole.USER
        });
        
        req.session.successMessage = 'Registratie succesvol! Je kunt nu inloggen.';
        res.redirect('/login');
    } catch (error) {
        console.error('Registratiefout:', error);
        req.session.errorMessage = 'Er is een fout opgetreden tijdens de registratie';
        res.redirect('/register');
    }
});

app.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Uitlogfout:', err);
            }
            res.redirect('/login');
        });
    } else {
        // Als er geen sessie is, redirect toch naar login
        res.redirect('/login');
    }
});

app.get("/", secureMiddleware, async (req, res) => {
    try {
        const players = await loadPlayers();
        const teams = await loadTeams();
        
        const topPlayers = players.slice(0, 5);
        const topTeams = teams.slice(0, 5);
        
        res.render("index", { 
            players: topPlayers,
            teams: topTeams,
            activePage: 'home'
        });
    } catch (error) {
        console.error('Fout bij het laden van homepagina:', error);
        res.status(500).render('error', { message: 'Kan homepagina niet laden' });
    }
});

app.get("/players", secureMiddleware, async (req: Request, res: Response) => {
    try {
        let players = await loadPlayers();
        const searchQuery = req.query.search as string || '';
        const sortField = req.query.sortField as string || 'name';
        const sortOrder = req.query.sortOrder as string || 'asc';
        
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
            return res.status(404).render('error', { message: 'Speler niet gevonden' });
        }
        
        res.render("player", { 
            player,
            activePage: 'players'
        });
    } catch (error) {
        console.error('Fout bij het laden van spelerdetails:', error);
        res.status(500).render('error', { message: 'Kan spelerdetails niet laden' });
    }
});

app.get("/player/:id/edit", secureMiddleware, async (req: Request, res: Response) => {
    try {
        if (req.session.role !== UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Toegang geweigerd. Beheerdersrechten vereist.' });
        }
        
        const players = await loadPlayers();
        const teams = await loadTeams();
        const player = players.find(p => p.id === req.params.id);
        
        if (!player) {
            return res.status(404).render('error', { message: 'Speler niet gevonden' });
        }
        
        res.render("edit-player", { 
            player,
            teams,
            activePage: 'players'
        });
    } catch (error) {
        console.error('Fout bij het laden van speler-bewerkingsformulier:', error);
        res.status(500).render('error', { message: 'Kan speler-bewerkingsformulier niet laden' });
    }
});

app.post("/player/:id/edit", secureMiddleware, async (req: Request<{ id: string }>, res: Response) => {
    try {
        if (req.session.role !== UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Toegang geweigerd. Beheerdersrechten vereist.' });
        }
        
        const playerId = req.params.id;
        const updatedPlayer = req.body;
        
        await updatePlayer(playerId, updatedPlayer);
        
        res.redirect(`/player/${playerId}`);
    } catch (error) {
        console.error('Fout bij het bijwerken van speler:', error);
        res.status(500).render('error', { message: 'Kan speler niet bijwerken' });
    }
});

// Teams routes
app.get("/teams", secureMiddleware, async (req: Request, res: Response) => {
    try {
        let teams = await loadTeams();
        const searchQuery = req.query.search as string || '';
        const sortField = req.query.sortField as string || 'name';
        const sortOrder = req.query.sortOrder as string || 'asc';
        
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
    } catch (error) {
        console.error('Fout bij het laden van teams:', error);
        res.status(500).render('error', { message: 'Kan teams niet laden' });
    }
});

app.get("/team/:id", secureMiddleware, async (req: Request, res: Response) => {
    try {
        const teams = await loadTeams();
        const players = await loadPlayers();
        const team = teams.find((t: Team) => t.id === req.params.id);
        
        if (!team) {
            return res.status(404).render('error', { message: 'Team niet gevonden' });
        }
        
        const teamPlayers = players.filter((p: Player) => p.currentTeam.id === team?.id);
        
        res.render("team", { 
            team,
            players: teamPlayers,
            activePage: 'teams'
        });
    } catch (error) {
        console.error('Fout bij het laden van teamdetails:', error);
        res.status(500).render('error', { message: 'Kan teamdetails niet laden' });
    }
});

app.get("/team/:id/edit", secureMiddleware, async (req, res) => {
    try {
        if (req.session.role !== UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Toegang geweigerd. Beheerdersrechten vereist.' });
        }
        
        const teams = await loadTeams();
        const team = teams.find(t => t.id === req.params.id);
        
        if (!team) {
            return res.status(404).render('error', { message: 'Team niet gevonden' });
        }
        
        res.render("edit-team", { 
            team,
            activePage: 'teams'
        });
    } catch (error) {
        console.error('Fout bij het laden van team-bewerkingsformulier:', error);
        res.status(500).render('error', { message: 'Kan team-bewerkingsformulier niet laden' });
    }
});

app.post("/team/:id/edit", secureMiddleware, async (req, res) => {
    try {
        if (req.session.role !== UserRole.ADMIN) {
            return res.status(403).render('error', { message: 'Toegang geweigerd. Beheerdersrechten vereist.' });
        }
        
        const teamId = req.params.id;
        const updatedTeam = req.body;
        
        await updateTeam(teamId, updatedTeam);
        res.redirect(`/team/${teamId}`);
    } catch (error) {
        console.error('Fout bij het bijwerken van team:', error);
        res.status(500).render('error', { message: 'Kan team niet bijwerken' });
    }
});


app.use((req, res) => {
    res.status(404).render('error', { message: 'Pagina niet gevonden' });
});


app.listen(app.get("port"), async () => {
    console.log("Server gestart op http://localhost:" + app.get("port"));
    try {
        // Maak verbinding met de database
        await import("./database").then(db => db.connect());
        
        // Initialiseer standaardgebruikers (beheerder en gewone gebruiker)
        await initializeUsers();
    } catch (error) {
        console.error("Kan geen verbinding maken met de database:", error);
    }
});

export default app;
