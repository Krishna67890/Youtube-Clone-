const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

const connectDB = require('../config/db');
const Video = require('../models/Video');

// Connect to database
connectDB();

const checkVideos = async () => {
  try {
    const videos = await Video.find({});
    console.log('Total videos in DB:', videos.length);
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title} - ${video.url}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error checking videos:', error);
    process.exit(1);
  }
};

checkVideos();