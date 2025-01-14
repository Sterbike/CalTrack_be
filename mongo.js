const mongoose = require('mongoose');
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    // Csatlakozás az adatbázishoz
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Leállítja az alkalmazást, ha nem sikerül csatlakozni
  }
};

module.exports = connectDB;