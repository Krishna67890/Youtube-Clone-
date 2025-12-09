const Video = require('../models/Video');
const User = require('../models/User');

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate('uploader', 'username');
    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get video by ID
// @route   GET /api/videos/:id
// @access  Public
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('uploader', 'username');
    
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    res.json(video);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Video not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Create a video
// @route   POST /api/videos
// @access  Private
exports.createVideo = async (req, res) => {
  try {
    const { title, description, thumbnail, duration, category, tags } = req.body;
    
    // Create new video (without requiring URL)
    const newVideo = new Video({
      title,
      description,
      // Generate a placeholder URL since it's required in the model but not used for direct uploads
      url: `uploaded://${Date.now()}`,
      thumbnail,
      duration,
      uploader: req.user.id,
      category,
      tags
    });
    
    const video = await newVideo.save();
    
    res.json(video);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update a video
// @route   PUT /api/videos/:id
// @access  Private
exports.updateVideo = async (req, res) => {
  try {
    const { title, description, thumbnail, category, tags } = req.body;
    
    // Build video object
    const videoFields = {};
    if (title) videoFields.title = title;
    if (description) videoFields.description = description;
    if (thumbnail) videoFields.thumbnail = thumbnail;
    if (category) videoFields.category = category;
    if (tags) videoFields.tags = tags;
    
    let video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    // Check if user is authorized to update this video
    if (video.uploader.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    video = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: videoFields },
      { new: true }
    );
    
    res.json(video);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Video not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    // Check if user is authorized to delete this video
    if (video.uploader.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await video.remove();
    
    res.json({ msg: 'Video removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Video not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Increment video views
// @route   PUT /api/videos/:id/views
// @access  Public
exports.incrementViews = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    video.views += 1;
    await video.save();
    
    res.json(video);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Video not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Get trending videos
// @route   GET /api/videos/trending
// @access  Public
exports.getTrendingVideos = async (req, res) => {
  try {
    // Get videos sorted by views in descending order
    const videos = await Video.find()
      .sort({ views: -1 })
      .limit(20)
      .populate('uploader', 'username');
    
    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get shorts videos
// @route   GET /api/videos/shorts
// @access  Public
exports.getShortsVideos = async (req, res) => {
  try {
    // Get videos with duration less than 60 seconds (1 minute)
    const videos = await Video.find({ duration: { $lt: 60 } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('uploader', 'username');
    
    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Search videos
// @route   GET /api/videos/search?q=
// @access  Public
exports.searchVideos = async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ msg: 'Query parameter is required' });
    }
    
    // Use text search with scoring for better results
    const videos = await Video.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .populate('uploader', 'username');
    
    // If text search yields no results, fall back to regex search
    if (videos.length === 0) {
      const regexVideos = await Video.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { category: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(20)
      .populate('uploader', 'username');
      
      return res.json(regexVideos);
    }
    
    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};