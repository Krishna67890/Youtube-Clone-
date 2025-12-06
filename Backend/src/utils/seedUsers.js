const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

// Demo users data
const demoUsers = [
  {
    username: 'Krishna Patil Rajput',
    email: 'krishna@example.com',
    password: 'krishna123'
  },
  {
    username: 'Atharva Patil Rajput',
    email: 'atharva@example.com',
    password: 'atharva123'
  },
  {
    username: 'Ankush Khakale',
    email: 'ankush@example.com',
    password: 'ankush123'
  },
  {
    username: 'Mahesh Vispute',
    email: 'mahesh@example.com',
    password: 'mahesh123'
  }
];

// Connect to database
connectDB();

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Insert demo users
    const users = await User.insertMany(demoUsers);
    console.log('Demo users added:', users.map(user => user.username));
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();