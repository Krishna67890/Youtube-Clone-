const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

const connectDB = require('../config/db');
const Video = require('../models/Video');

// Connect to database
connectDB();

// Sample user ID (in a real app, this would come from authentication)
// You would need to replace this with an actual user ID from your database
const SAMPLE_USER_ID = '64a8f8c8b3d8e42d8c123456'; // Replace with actual user ID

const videos = {
  'pal-pal-chainal': {
    title: 'Pal Pal Chainal | AFUSIC',
    description: 'Official music video for "Pal Pal Chainal" by AFUSIC.',
    url: 'https://youtu.be/AbkEmIgJMcU?list=RDAbkEmIgJMcU',
    thumbnail: 'https://i.ytimg.com/vi/AbkEmIgJMcU/hqdefault.jpg',
    duration: 240, // 4 minutes
    category: 'Music',
    tags: ['AFUSIC', 'Pal Pal Chainal', 'Music']
  },
  'minecraft': {
    title: 'MINECRAFT HARDCORE LAST EPISODE.... reason..... chainal Atharva Gamerz',
    description: 'Final episode of the Minecraft Hardcore series by Atharva Gamerz.',
    url: 'https://youtu.be/9L_rSSWKKOE',
    thumbnail: 'https://i.ytimg.com/vi/9L_rSSWKKOE/hqdefault.jpg',
    duration: 1200, // 20 minutes
    category: 'Gaming',
    tags: ['Minecraft', 'Hardcore', 'Atharva Gamerz', 'Gaming']
  },
  'tu-hai-kahan': {
    title: 'Tu Hai Kahan',
    description: 'Official music video for "Tu Hai Kahan" by Rauf & Faik.',
    url: 'https://youtu.be/YyKh758hwT0',
    thumbnail: 'https://i.ytimg.com/vi/YyKh758hwT0/hqdefault.jpg',
    duration: 260, // 4 minutes 20 seconds
    category: 'Music',
    tags: ['Rauf & Faik', 'Tu Hai Kahan', 'Music']
  },
  'maha-mitra-mela': {
    title: 'Maha Mitra Mela 2025 trailer chainal Ajaysing Patil',
    description: 'Official trailer for Maha Mitra Mela 2025 by Ajaysing Patil.',
    url: 'https://youtu.be/P9PZTG3r-tk',
    thumbnail: 'https://i.ytimg.com/vi/P9PZTG3r-tk/hqdefault.jpg',
    duration: 180, // 3 minutes
    category: 'Entertainment',
    tags: ['Maha Mitra Mela', 'Ajaysing Patil', 'Trailer', 'Event']
  },
  'kanbai-visarjan': {
    title: 'Kanbai Visarjan Mahale parivar chainal ShivGauri\'s Universe',
    description: 'Kanbai Visarjan ceremony by Mahale parivar from ShivGauri\'s Universe.',
    url: 'https://youtu.be/Nnr6RrlOu6U',
    thumbnail: 'https://i.ytimg.com/vi/Nnr6RrlOu6U/hqdefault.jpg',
    duration: 300, // 5 minutes
    category: 'Religious',
    tags: ['Kanbai', 'Visarjan', 'ShivGauri', 'Mahale', 'Religious']
  },
  'parts-of-speech': {
    title: 'Drama on Parts of Speech in English chainal Shubhangi Patil',
    description: 'Educational video on Parts of Speech in English through drama by Shubhangi Patil.',
    url: 'https://youtu.be/mkoyPYG_hTc',
    thumbnail: 'https://i.ytimg.com/vi/mkoyPYG_hTc/hqdefault.jpg',
    duration: 150, // 2.5 minutes
    category: 'Education',
    tags: ['Parts of Speech', 'English Grammar', 'Educational', 'Drama', 'Shubhangi Patil']
  },
  'sidha-swami-kavach': {
    title: 'Sidha Swami Kavach and chainal Suhasini Patil',
    description: 'Devotional video featuring Sidha Swami Kavach by Suhasini Patil.',
    url: 'https://youtu.be/PTGOtnSTKdc',
    thumbnail: 'https://i.ytimg.com/vi/PTGOtnSTKdc/hqdefault.jpg',
    duration: 200, // 3 minutes 20 seconds
    category: 'Religious',
    tags: ['Sidha Swami', 'Kavach', 'Devotional', 'Suhasini Patil', 'Religious']
  },
  'identify-tense': {
    title: 'Identify a Tense||How to read a tense? ||English Tense chainal Ajay English Word',
    description: 'Educational video on identifying English tenses by Ajay English Word.',
    url: 'https://youtu.be/1xfWu-FT9To',
    thumbnail: 'https://i.ytimg.com/vi/1xfWu-FT9To/hqdefault.jpg',
    duration: 180, // 3 minutes
    category: 'Education',
    tags: ['English Grammar', 'Tense', 'Educational', 'Ajay English Word']
  }
};

const addVideo = async (videoKey) => {
  try {
    // Check if video key is provided
    if (!videoKey) {
      console.log('Available videos:');
      Object.keys(videos).forEach(key => {
        console.log(`- ${key}: ${videos[key].title}`);
      });
      console.log('\nUsage: npm run add-video -- <video-key>');
      process.exit(0);
    }

    // Check if video key exists
    if (!videos[videoKey]) {
      console.log(`Video key "${videoKey}" not found.`);
      console.log('\nAvailable videos:');
      Object.keys(videos).forEach(key => {
        console.log(`- ${key}: ${videos[key].title}`);
      });
      process.exit(1);
    }

    const videoData = videos[videoKey];
    
    // Check if video already exists
    const existingVideo = await Video.findOne({ url: videoData.url });
    
    if (existingVideo) {
      console.log('Video already exists in database:');
      console.log(existingVideo);
      process.exit(0);
    }
    
    // Add required fields
    videoData.views = 0;
    videoData.likes = 0;
    videoData.dislikes = 0;
    videoData.uploader = SAMPLE_USER_ID;
    videoData.privacy = 'public';
    
    // Create new video
    const newVideo = new Video(videoData);
    await newVideo.save();
    
    console.log('Video added successfully:');
    console.log(newVideo);
    process.exit(0);
  } catch (error) {
    console.error('Error adding video:', error);
    process.exit(1);
  }
};

// Get video key from command line arguments
const videoKey = process.argv[2];
addVideo(videoKey);