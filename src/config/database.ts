import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://hamdaouiilias14:N7ymXJvMs0fzDvyA@webontwikkeling.abgrzzs.mongodb.net/?retryWrites=true&w=majority&appName=Webontwikkeling';
        console.log('Connecting to MongoDB...');
        console.log('MongoDB URI:', mongoURI);
        
        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Toon database info
        if (conn.connection.db) {
            console.log('Database naam:', conn.connection.db.databaseName);
            
            // Log alle collections die er zijn
            const collections = await conn.connection.db.listCollections().toArray();
            console.log('Collections in de database:', collections.map(c => c.name));
        }
        
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        console.error('Please make sure MongoDB is running on your system');
        process.exit(1);
    }
};

export default connectDB; 