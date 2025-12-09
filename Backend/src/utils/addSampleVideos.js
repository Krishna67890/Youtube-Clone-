const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Video = require('../models/Video');

// Connect to database
connectDB();

// Sample user ID (in a real app, this would come from authentication)
// You would need to replace this with an actual user ID from your database
const SAMPLE_USER_ID = '64a8f8c8b3d8e42d8c123456'; // Replace with actual user ID

const addSampleVideos = async () => {
  try {
    // Check if videos already exist
    const existingVideos = await Video.find({});
    
    if (existingVideos.length > 0) {
      console.log('Videos already exist in database:');
      existingVideos.forEach(video => {
        console.log(`- ${video.title} (${video.url})`);
      });
      
      // Ask user if they want to add more videos
      console.log('\nWould you like to add the sample video anyway? (y/N)');
      // In a real script, you would handle user input here
      // For now, we'll just exit
      process.exit(0);
    }
    
    // Sample videos data
    const sampleVideos = [
      {
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
      },
      {
        title: 'Tu Hai Kahan',
        description: 'Official music video for "Tu Hai Kahan" by Rauf & Faik.',
        url: 'https://youtu.be/YyKh758hwT0',
        thumbnail: 'https://i.ytimg.com/vi/YyKh758hwT0/hqdefault.jpg',
        duration: 260, // 4 minutes 20 seconds
        views: 0,
        likes: 0,
        dislikes: 0,
        uploader: SAMPLE_USER_ID,
        category: 'Music',
        tags: ['Rauf & Faik', 'Tu Hai Kahan', 'Music'],
        privacy: 'public'
      },
      {
        title: 'MINECRAFT HARDCORE LAST EPISODE.... reason..... chainal Atharva Gamerz',
        description: 'Final episode of the Minecraft Hardcore series by Atharva Gamerz.',
        url: 'https://youtu.be/9L_rSSWKKOE',
        thumbnail: 'https://i.ytimg.com/vi/9L_rSSWKKOE/hqdefault.jpg',
        duration: 1200, // 20 minutes
        views: 0,
        likes: 0,
        dislikes: 0,
        uploader: SAMPLE_USER_ID,
        category: 'Gaming',
        tags: ['Minecraft', 'Hardcore', 'Atharva Gamerz', 'Gaming'],
        privacy: 'public'
      }
    ];
    
    // Add videos to database
    for (const videoData of sampleVideos) {
      // Check if video already exists
      const existingVideo = await Video.findOne({ url: videoData.url });
      
      if (existingVideo) {
        console.log(`Video "${videoData.title}" already exists in database`);
        continue;
      }
      
      // Create new video
      const newVideo = new Video(videoData);
      await newVideo.save();
      
      console.log(`Added video: ${newVideo.title}`);
    }
    
    console.log('\nAll sample videos have been added to the database!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample videos:', error);
    process.exit(1);
  }
};

// Run the function
addSampleVideos();