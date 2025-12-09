const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

const connectDB = require('../config/db');
const Video = require('../models/Video');

// Connect to database
connectDB();

const testSearch = async () => {
  try {
    // Test search for "kanbai"
    console.log('Searching for "kanbai":');
    const kanbaiVideos = await Video.find({
      $or: [
        { title: { $regex: 'kanbai', $options: 'i' } },
        { description: { $regex: 'kanbai', $options: 'i' } },
        { tags: { $in: [new RegExp('kanbai', 'i')] } },
        { category: { $regex: 'kanbai', $options: 'i' } }
      ]
    });
    console.log('Found', kanbaiVideos.length, 'videos');
    kanbaiVideos.forEach(v => console.log('-', v.title));

    // Test search for "mitra mela"
    console.log('\nSearching for "mitra mela":');
    const melaVideos = await Video.find({
      $or: [
        { title: { $regex: 'mitra mela', $options: 'i' } },
        { description: { $regex: 'mitra mela', $options: 'i' } },
        { tags: { $in: [new RegExp('mitra mela', 'i')] } },
        { category: { $regex: 'mitra mela', $options: 'i' } }
      ]
    });
    console.log('Found', melaVideos.length, 'videos');
    melaVideos.forEach(v => console.log('-', v.title));

    process.exit(0);
  } catch (error) {
    console.error('Error testing search:', error);
    process.exit(1);
  }
};

testSearch();