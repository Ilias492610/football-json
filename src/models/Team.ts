import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    league: { type: String, required: true },
    foundedYear: { type: Number, required: true },
    stadium: { type: String, required: true },
    manager: { type: String, required: true },
    country: { type: String, required: true },
    image: { type: String, default: '/public/images/default-team.jpg' },
    imageUrl: { type: String }
});

export const Team = mongoose.model('Team', teamSchema); 