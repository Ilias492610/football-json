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
const readline_1 = __importDefault(require("readline"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const PLAYERS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/players.json';
const TEAMS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/teams.json';
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
function fetchData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield (0, node_fetch_1.default)(url);
            if (!response.ok) {
                throw new Error(`Fout bij het ophalen van data van ${url}: ${response.statusText}`);
            }
            const data = yield response.json();
            return data;
        }
        catch (error) {
            console.error(`Fout bij het ophalen of verwerken van data van ${url}:`, error);
            return [];
        }
    });
}
function displayAllPlayers(players) {
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
function displayPlayerDetails(playerId, players, teams) {
    return __awaiter(this, void 0, void 0, function* () {
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
            }
            else if (player.currentTeam) {
                console.log(`  Team: ${player.currentTeam.name} (${player.currentTeam.id})`);
                console.log(`    Competitie: ${player.currentTeam.league}`);
                console.log(`    Opgericht: ${player.currentTeam.foundedYear}`);
                console.log(`    Stadion: ${player.currentTeam.stadium}`);
            }
            else {
                console.log('  Team: Gegevens niet beschikbaar');
            }
            console.log('--------------------------');
        }
        else {
            console.log(`Speler met ID "${playerId}" niet gevonden.`);
        }
    });
}
function mainMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('\nWelkom bij de voetbal JSON-gegevensviewer!');
        console.log('Gegevens ophalen, even geduld...');
        const players = yield fetchData(PLAYERS_JSON_URL);
        const teams = yield fetchData(TEAMS_JSON_URL);
        if (players.length === 0) {
            console.log('Kon spelersgegevens niet laden. Controleer de PLAYERS_JSON_URL en je internetverbinding.');
        }
        function showMenu() {
            console.log('\nMenu:');
            console.log('1. Alle spelers bekijken');
            console.log('2. Speler zoeken op ID');
            console.log('3. Afsluiten');
            rl.question('Voer je keuze in: ', (choice) => __awaiter(this, void 0, void 0, function* () {
                switch (choice.trim()) {
                    case '1':
                        displayAllPlayers(players);
                        showMenu();
                        break;
                    case '2':
                        rl.question('Voer het ID in van de speler die je wilt zoeken: ', (id) => __awaiter(this, void 0, void 0, function* () {
                            yield displayPlayerDetails(id.trim(), players, teams);
                            showMenu();
                        }));
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
            }));
        }
        showMenu();
    });
}
mainMenu();
