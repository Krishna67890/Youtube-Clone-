const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true // Add index for faster searches
  },
  description: {
    type: String,
    required: true,
    index: true // Add index for faster searches
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  category: {
    type: String,
    default: 'Music',
    index: true // Add index for faster searches
  },
  tags: [{
    type: String,
    index: true // Add index for faster searches
  }],
  privacy: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for search functionality
videoSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Video', videoSchema);