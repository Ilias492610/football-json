import * as readline from 'readline';
import { Player } from './interfaces/types';

// Hardcoded spelers data omdat ik niet wist hoe ik het moest inladen

const players: Player[] = [
  {
    id: "PLAYER-001",
    name: "Lionel Messi",
    description: "Argentine footballer considered one of the greatest players of all time.",
    age: 36,
    isActive: true,
    birthDate: "1987-06-24",
    imageUrl: "/messi.webp",
    position: "Forward",
    skills: ["Dribbling", "Passing", "Finishing"],
    nationality: "Argentina",
    currentTeam: {
      id: "TEAM-001",
      name: "Inter Miami CF",
      league: "Major League Soccer",
      teamLogoUrl: "https://example.com/images/teams/inter-miami-logo.jpg",
      foundedYear: 2018,
      stadium: "DRV PNK Stadium"
    }
  },
  {
    id: "PLAYER-002",
    name: "Cristiano Ronaldo",
    description: "Portuguese forward known for his goalscoring and athleticism.",
    age: 38,
    isActive: true,
    birthDate: "1985-02-05",
    imageUrl: "/ronaldo.webp",
    position: "Forward",
    skills: ["Finishing", "Heading", "Speed"],
    nationality: "Portugal",
    currentTeam: {
      id: "TEAM-003",
      name: "Al-Nassr FC",
      league: "Saudi Pro League",
      teamLogoUrl: "https://example.com/images/teams/al-nassr-logo.jpg",
      foundedYear: 1955,
      stadium: "Al-Awwal Park"
    }
  }
];

// Maak readline interface voor user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Functie om alle spelers te laden
function loadPlayers(): Player[] {
  // Normaal zou ik hier een bestand inlezen maar ik gebruik nu gewoon de array hierboven
  return players;
}

// Hoofdmenu functie
function showMainMenu() {
  console.clear();
  console.log('Welcome to the Football Data Viewer!\n');
  console.log('1. View all players');
  console.log('2. Filter by ID');
  console.log('3. Exit\n');
  
  rl.question('Please enter your choice: ', handleMenuChoice);
}

// Verwerk de menu keuze van de gebruiker
function handleMenuChoice(choice: string) {
  switch (choice) {
    case '1':
      viewAllPlayers();
      break;
    case '2':
      askForPlayerId();
      break;
    case '3':
      console.log('Thank you for using the Football Data Viewer!');
      rl.close();
      break;
    default:
      console.log('Invalid choice. Please try again.');
      waitForEnter();
  }
}

// Toon alle spelers
function viewAllPlayers() {
  console.clear();
  console.log('All Players:\n');
  
  const players = loadPlayers();
  players.forEach((player) => {
    console.log(`- ${player.name} (${player.id})`);
  });
  
  waitForEnter();
}

// Vraag de gebruiker om een speler ID
function askForPlayerId() {
  rl.question('Please enter the ID you want to filter by: ', (id) => {
    const players = loadPlayers();
    const player = players.find((p) => p.id === id);
    
    if (!player) {
      console.log('\nNo player found with that ID.');
      waitForEnter();
      return;
    }
    
    displayPlayerDetails(player);
  });
}

// Toon speler details
function displayPlayerDetails(player: Player) {
  console.clear();
  console.log(`- ${player.name} (${player.id})`);
  console.log(`  - Description: ${player.description}`);
  console.log(`  - Age: ${player.age}`);
  console.log(`  - Active: ${player.isActive}`);
  console.log(`  - Birthdate: ${player.birthDate}`);
  console.log(`  - Image: ${player.imageUrl}`);
  console.log(`  - Position: ${player.position}`);
  console.log(`  - Skills: ${player.skills.join(', ')}`);
  console.log(`  - Nationality: ${player.nationality}`);
  console.log(`  - Current Team:`);
  console.log(`    - Name: ${player.currentTeam.name}`);
  console.log(`    - League: ${player.currentTeam.league}`);
  
  waitForEnter();
}

// Wacht tot de gebruiker op Enter drukt om door te gaan
function waitForEnter() {
  rl.question('\nPress Enter to continue...', showMainMenu);
}

// Start de app
console.log('Loading football data...');
showMainMenu();