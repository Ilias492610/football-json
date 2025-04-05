import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { Player, Team } from '../interfaces/types';

const app = express();
const PORT = process.env.PORT || 3000;

// Debug paths
const rootDir = path.resolve(__dirname, '../../');
const viewsPath = path.join(rootDir, 'views');
console.log('Root directory:', rootDir);
console.log('Views directory path:', viewsPath);
console.log('Current directory:', __dirname);
console.log('Directory exists:', fs.existsSync(viewsPath));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', viewsPath);

// Middleware
app.use(express.static(path.join(rootDir, 'public')));
// Serve player images from the root directory
app.use(express.static(rootDir));
app.use(express.urlencoded({ extended: true }));

// Functions to load data
function loadPlayers(): Player[] {
  try {
    const data = fs.readFileSync(path.join(rootDir, 'players.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading players data:', error);
    return [];
  }
}

function loadTeams(): Team[] {
  try {
    const data = fs.readFileSync(path.join(rootDir, 'teams.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading teams data:', error);
    return [];
  }
}

// Routes
app.get('/', (req, res) => {
  res.redirect('/players');
});

// Players routes
app.get('/players', (req, res) => {
  const players = loadPlayers();
  const sortField = req.query.sortField as string || 'name';
  const sortOrder = req.query.sortOrder as string || 'asc';
  const searchQuery = req.query.search as string || '';

  // Filter players by name if search query exists
  let filteredPlayers = players;
  if (searchQuery) {
    filteredPlayers = players.filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort players based on sort field and order
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const fieldA = sortField === 'currentTeam' ? a.currentTeam.name : (a as any)[sortField];
    const fieldB = sortField === 'currentTeam' ? b.currentTeam.name : (b as any)[sortField];
    
    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  res.render('players', { 
    players: sortedPlayers, 
    sortField, 
    sortOrder, 
    searchQuery 
  });
});

// Player detail route
app.get('/players/:id', (req, res) => {
  const players = loadPlayers();
  const teams = loadTeams();
  const player = players.find(p => p.id === req.params.id);
  
  if (!player) {
    return res.status(404).render('error', { message: 'Player not found' });
  }

  // Find teammates (players from the same team)
  const teammates = players.filter(p => 
    p.id !== player.id && p.currentTeam.id === player.currentTeam.id
  );

  res.render('playerDetail', { player, teammates });
});

// Teams routes
app.get('/teams', (req, res) => {
  const teams = loadTeams();
  const sortField = req.query.sortField as string || 'name';
  const sortOrder = req.query.sortOrder as string || 'asc';
  const searchQuery = req.query.search as string || '';

  // Filter teams by name if search query exists
  let filteredTeams = teams;
  if (searchQuery) {
    filteredTeams = teams.filter(team => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort teams based on sort field and order
  const sortedTeams = [...filteredTeams].sort((a, b) => {
    const fieldA = (a as any)[sortField];
    const fieldB = (b as any)[sortField];
    
    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  res.render('teams', { 
    teams: sortedTeams, 
    sortField, 
    sortOrder, 
    searchQuery 
  });
});

// Team detail route
app.get('/teams/:id', (req, res) => {
  const teams = loadTeams();
  const players = loadPlayers();
  const team = teams.find(t => t.id === req.params.id);
  
  if (!team) {
    return res.status(404).render('error', { message: 'Team not found' });
  }

  // Find players in this team
  const teamPlayers = players.filter(p => p.currentTeam.id === team.id);

  res.render('teamDetail', { team, players: teamPlayers });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 