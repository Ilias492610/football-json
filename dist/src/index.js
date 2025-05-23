"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
// Hardcoded spelers data omdat ik niet wist hoe ik het moest inladen
const players = [
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
function loadPlayers() {
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
function handleMenuChoice(choice) {
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
function displayPlayerDetails(player) {
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
