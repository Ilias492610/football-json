import { connect } from 'mongoose';
import { Team } from './models/Team';
import { Player } from './models/Player';
import fs from 'fs';
import path from 'path';
import { Player as PlayerType, Team as TeamType } from './interfaces/types';
import connectDB from './config/database';

async function resetDatabase() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Team.deleteMany({});
    await Player.deleteMany({});
    console.log('Existing data cleared');

    // Load data from JSON files
    const rootDir = path.resolve(__dirname, '../../');
    const teamsFilePath = path.join(rootDir, 'teams.json');
    const playersFilePath = path.join(rootDir, 'players.json');

    console.log('Loading data from JSON files...');
    const teamsData = fs.readFileSync(teamsFilePath, 'utf8');
    const playersData = fs.readFileSync(playersFilePath, 'utf8');

    const teams: TeamType[] = JSON.parse(teamsData);
    const players: PlayerType[] = JSON.parse(playersData);

    // Insert data into MongoDB
    console.log('Inserting data into MongoDB...');
    await Team.insertMany(teams);
    await Player.insertMany(players);

    console.log(`Inserted ${teams.length} teams and ${players.length} players into MongoDB`);
    console.log('Database reset complete!');

    // Verify data
    const verifyTeams = await Team.find().lean();
    console.log('\nVerifying team data:');
    verifyTeams.forEach(team => {
      console.log(`Team: ${team.name}, imageUrl: ${team.imageUrl}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
