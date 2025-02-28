import * as fs from 'fs';
import * as readline from 'readline';
import { Player } from '../interfaces/types';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to load player data from JSON file
function loadPlayers(): Player[] {
  try {
    const data = fs.readFileSync('./players.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading players data:', error);
    return [];
  }
}

// Main menu function
function showMainMenu() {
  console.clear();
  console.log('Welcome to the Football Data Viewer!\n');
  console.log('1. View all players');
  console.log('2. Filter by ID');
  console.log('3. Exit\n');
  
  rl.question('Please enter your choice: ', handleMenuChoice);
}

// Handle user's menu choice
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

// Display all players
function viewAllPlayers() {
  console.clear();
  console.log('All Players:\n');
  
  const players = loadPlayers();
  players.forEach(player => {
    console.log(`- ${player.name} (${player.id})`);
  });
  
  waitForEnter();
}

// Ask user for player ID
function askForPlayerId() {
  rl.question('Please enter the ID you want to filter by: ', (id) => {
    const players = loadPlayers();
    const player = players.find(p => p.id === id);
    
    if (!player) {
      console.log('\nNo player found with that ID.');
      waitForEnter();
      return;
    }
    
    displayPlayerDetails(player);
  });
}

// Display player details
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

// Wait for user to press Enter before continuing
function waitForEnter() {
  rl.question('\nPress Enter to continue...', showMainMenu);
}

// Start the app
console.log('Loading football data...');
showMainMenu();