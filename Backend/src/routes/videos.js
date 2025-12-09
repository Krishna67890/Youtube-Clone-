const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const videoController = require('../controllers/videoController');

// @route   GET /api/videos/trending
// @desc    Get trending videos
// @access  Public
router.get('/trending', videoController.getTrendingVideos);

// @route   GET /api/videos/shorts
// @desc    Get Shorts videos
// @access  Public
router.get('/shorts', videoController.getShortsVideos);

// @route   GET /api/videos/search
// @desc    Search videos
// @access  Public
router.get('/search', videoController.searchVideos);

// @route   GET /api/videos
// @desc    Get all videos
// @access  Public
router.get('/', videoController.getVideos);

// @route   GET /api/videos/:id
// @desc    Get video by ID
// @access  Public
router.get('/:id', videoController.getVideoById);

// @route   POST /api/videos
// @desc    Create a video
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('thumbnail', 'Thumbnail is required').not().isEmpty(),
      check('duration', 'Duration is required').isNumeric()
    ]
  ],
  videoController.createVideo
);

// @route   PUT /api/videos/:id
// @desc    Update a video
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty()
    ]
  ],
  videoController.updateVideo
);

// @route   DELETE /api/videos/:id
// @desc    Delete a video
// @access  Private
router.delete('/:id', auth, videoController.deleteVideo);

// @route   PUT /api/videos/:id/views
// @desc    Increment video views
// @access  Public
router.put('/:id/views', videoController.incrementViews);

module.exports = router;