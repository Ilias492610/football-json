import readline from 'readline';
import fetch from 'node-fetch';
import { Player, Team, CurrentTeam } from './types';

const PLAYERS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/players.json';
const TEAMS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/teams.json';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function fetchData<T>(url: string): Promise<T[]> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Fout bij het ophalen van data van ${url}: ${response.statusText}`);
        }
        
        const data = await response.json() as T[];
        return data;
    } catch (error) {
        console.error(`Fout bij het ophalen of verwerken van data van ${url}:`, error);
        return [];
    }
}

function displayAllPlayers(players: Player[]): void {
    if (!players || players.length === 0) {
        console.log('Geen spelersdata beschikbaar of laden mislukt.');
        return;
    }
    
    console.log('\n--- Alle Spelers ---');
    players.forEach(player => {
        console.log(`- ${player.name} (${player.id})`);
    });
    console.log('------------------');
}

async function displayPlayerDetails(playerId: string, players: Player[], teams: Team[]): Promise<void> {
    const player = players.find(p => p.id.toLowerCase() === playerId.toLowerCase());

    if (player) {
        console.log(`\n--- Details voor ${player.name} (${player.id}) ---`);
        console.log(`  Beschrijving: ${player.description}`);
        console.log(`  Leeftijd: ${player.age}`);
        console.log(`  Actief: ${player.isActive ? 'Ja' : 'Nee'}`);
        console.log(`  Geboortedatum: ${player.birthDate}`);
        console.log(`  Afbeelding: ${player.imageUrl}`);
        console.log(`  Positie: ${player.position}`);
        console.log(`  Vaardigheden: ${player.skills.join(', ')}`);
        console.log(`  Nationaliteit: ${player.nationality}`);

        const teamDetails = teams.find(t => t.id === player.currentTeam.id);

        if (teamDetails) {
            console.log(`  Team: ${teamDetails.name} (${teamDetails.id})`);
            console.log(`    Competitie: ${teamDetails.league}`);
            console.log(`    Opgericht: ${teamDetails.foundedYear}`);
            console.log(`    Stadion: ${teamDetails.stadium}`);
            console.log(`    Manager: ${teamDetails.manager}`);
            console.log(`    Land: ${teamDetails.country}`);
            console.log(`    Logo: ${teamDetails.imageUrl}`);
        } else if (player.currentTeam) { 
            console.log(`  Team: ${player.currentTeam.name} (${player.currentTeam.id})`);
            console.log(`    Competitie: ${player.currentTeam.league}`);
            console.log(`    Opgericht: ${player.currentTeam.foundedYear}`);
            console.log(`    Stadion: ${player.currentTeam.stadium}`);
        } else {
            console.log('  Team: Gegevens niet beschikbaar');
        }
        console.log('--------------------------');
    } else {
        console.log(`Speler met ID "${playerId}" niet gevonden.`);
    }
}

async function mainMenu(): Promise<void> {
    console.log('\nWelkom bij de voetbal JSON-gegevensviewer!');
    console.log('Gegevens ophalen, even geduld...');

    const players = await fetchData<Player>(PLAYERS_JSON_URL);
    const teams = await fetchData<Team>(TEAMS_JSON_URL);

    if (players.length === 0) {
        console.log('Kon spelersgegevens niet laden. Controleer de PLAYERS_JSON_URL en je internetverbinding.');
    }

    function showMenu() {
        console.log('\nMenu:');
        console.log('1. Alle spelers bekijken');
        console.log('2. Speler zoeken op ID');
        console.log('3. Afsluiten');
        
        rl.question('Voer je keuze in: ', async (choice) => {
            switch (choice.trim()) {
                case '1':
                    displayAllPlayers(players);
                    showMenu();
                    break;
                case '2':
                    rl.question('Voer het ID in van de speler die je wilt zoeken: ', async (id) => {
                        await displayPlayerDetails(id.trim(), players, teams);
                        showMenu();
                    });
                    break;
                case '3':
                    console.log('Applicatie wordt afgesloten.');
                    rl.close();
                    break;
                default:
                    console.log('Ongeldige keuze. Probeer het opnieuw.');
                    showMenu();
                    break;
            }
        });
    }

    showMenu();
}

mainMenu();
