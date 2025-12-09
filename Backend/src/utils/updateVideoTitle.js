const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

const connectDB = require('../config/db');
const Video = require('../models/Video');

// Connect to database
connectDB();

const updateVideoTitle = async () => {
  try {
    // Find the Maha Mitra Mela video by its current title
    const video = await Video.findOne({
      title: 'Maha Mitra Mela 2025 trailer chainal Ajaysing Patil 2nd'
    });

    if (!video) {
      console.log('Video not found');
      process.exit(1);
    }

    // Update the title
    video.title = 'Maha Mitra Mela 2025 trailer chainal Ajaysing Patil';
    await video.save();

    console.log('Video title updated successfully:');
    console.log('Old title:', 'Maha Mitra Mela 2025 trailer chainal Ajaysing Patil 2nd');
    console.log('New title:', video.title);
    console.log('URL:', video.url);

    process.exit(0);
  } catch (error) {
    console.error('Error updating video title:', error);
    process.exit(1);
  }
};

updateVideoTitle();