const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Set strictQuery option to suppress deprecation warning
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('Database connection error:', err.message);
    // Don't exit the process, just log the error
    // process.exit(1);
  }
};

module.exports = connectDB;