import readline from 'readline';
import fetch from 'node-fetch'; // Ensure node-fetch is installed (npm install node-fetch@3)
import { Player, Team, CurrentTeam } from './types';

// --- Configuration: Replace with your actual GitHub Raw URLs ---
const PLAYERS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/public/players/players.json';
const TEAMS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/public/teams/teams.json';
// ----------------------------------------------------------------

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function fetchData<T>(url: string): Promise<T[]> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data from ${url}: ${response.statusText}`);
        }
        const data = await response.json() as T[];
        return data;
    } catch (error) {
        console.error(`Failed to fetch or parse data from ${url}:`, error);
        return []; // Return empty array on error to prevent crash
    }
}

function displayAllPlayers(players: Player[]): void {
    if (!players || players.length === 0) {
        console.log('No player data available or failed to load.');
        return;
    }
    console.log('\n--- All Players ---');
    players.forEach(player => {
        console.log(`- ${player.name} (${player.id})`);
    });
    console.log('------------------');
}

async function displayPlayerDetails(playerId: string, players: Player[], teams: Team[]): Promise<void> {
    const player = players.find(p => p.id.toLowerCase() === playerId.toLowerCase());

    if (player) {
        console.log(`\n--- Details for ${player.name} (${player.id}) ---`);
        console.log(`  Description: ${player.description}`);
        console.log(`  Age: ${player.age}`);
        console.log(`  Active: ${player.isActive}`);
        console.log(`  Birthdate: ${player.birthDate}`);
        console.log(`  Image: ${player.imageUrl}`);
        console.log(`  Position: ${player.position}`);
        console.log(`  Abilities/Skills: ${player.skills.join(', ')}`);
        console.log(`  Nationality: ${player.nationality}`);

        // Find the full team details from the teams array if currentTeam.id exists
        const teamDetails = teams.find(t => t.id === player.currentTeam.id);

        if (teamDetails) {
            console.log(`  Team: ${teamDetails.name} (${teamDetails.id})`);
            console.log(`    League: ${teamDetails.league}`);
            console.log(`    Founded: ${teamDetails.foundedYear}`);
            console.log(`    Stadium: ${teamDetails.stadium}`);
            console.log(`    Manager: ${teamDetails.manager}`);
            console.log(`    Country: ${teamDetails.country}`);
            console.log(`    Logo: ${teamDetails.imageUrl}`);
        } else if (player.currentTeam) { // Fallback to data in player object if full team details not found
            console.log(`  Team: ${player.currentTeam.name} (${player.currentTeam.id})`);
            console.log(`    League: ${player.currentTeam.league}`);
            console.log(`    Founded: ${player.currentTeam.foundedYear}`);
            console.log(`    Stadium: ${player.currentTeam.stadium}`);
            // teamLogoUrl is in player.currentTeam, other details like manager, country are in the main teams.json
        }
         else {
            console.log('  Team: Data not available');
        }
        console.log('--------------------------');
    } else {
        console.log(`Player with ID "${playerId}" not found.`);
    }
}

async function mainMenu(): Promise<void> {
    console.log('\nWelcome to the JSON data viewer!');
    console.log('Fetching data, please wait...');

    const players = await fetchData<Player>(PLAYERS_JSON_URL);
    const teams = await fetchData<Team>(TEAMS_JSON_URL);

    if (players.length === 0) {
        console.log('Could not load player data. Please check the PLAYERS_JSON_URL and your internet connection.');
        // rl.close(); // Optionally close if critical data fails to load
        // return;
    }
    // We can proceed even if teams data is missing, details will be limited.

    function showMenu() {
        console.log('\nMenu:');
        console.log('1. View all players');
        console.log('2. Filter player by ID');
        console.log('3. Exit');
        rl.question('Please enter your choice: ', async (choice) => {
            switch (choice.trim()) {
                case '1':
                    displayAllPlayers(players);
                    showMenu();
                    break;
                case '2':
                    rl.question('Please enter the Player ID you want to filter by: ', async (id) => {
                        await displayPlayerDetails(id.trim(), players, teams);
                        showMenu();
                    });
                    break;
                case '3':
                    console.log('Exiting application.');
                    rl.close();
                    break;
                default:
                    console.log('Invalid choice. Please try again.');
                    showMenu();
                    break;
            }
        });
    }
    showMenu();
}

mainMenu();
