const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Video = require('../models/Video');

// Connect to database
connectDB();

// Sample user ID (in a real app, this would come from authentication)
// You would need to replace this with an actual user ID from your database
const SAMPLE_USER_ID = '64a8f8c8b3d8e42d8c123456'; // Replace with actual user ID

const addPalPalChainalVideo = async () => {
  try {
    // Check if video already exists
    const existingVideo = await Video.findOne({ 
      url: 'https://youtu.be/AbkEmIgJMcU?list=RDAbkEmIgJMcU' 
    });
    
    if (existingVideo) {
      console.log('Video already exists in database');
      console.log(existingVideo);
      process.exit(0);
    }
    
    // Create video object
    const videoData = {
      title: 'Pal Pal Chainal | AFUSIC',
      description: 'Official music video for "Pal Pal Chainal" by AFUSIC.',
      url: 'https://youtu.be/AbkEmIgJMcU?list=RDAbkEmIgJMcU',
      thumbnail: 'https://i.ytimg.com/vi/AbkEmIgJMcU/hqdefault.jpg',
      duration: 240, // 4 minutes
      views: 0,
      likes: 0,
      dislikes: 0,
      uploader: SAMPLE_USER_ID,
      category: 'Music',
      tags: ['AFUSIC', 'Pal Pal Chainal', 'Music'],
      privacy: 'public'
    };
    
    // Create new video
    const newVideo = new Video(videoData);
    await newVideo.save();
    
    console.log('Video added successfully:', newVideo);
    process.exit(0);
  } catch (error) {
    console.error('Error adding video:', error);
    process.exit(1);
  }
};

// Run the function
addPalPalChainalVideo();