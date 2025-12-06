import React, { useState, useRef, useEffect } from 'react';
import VideoMenu from './VideoMenu';

interface Video {
  id: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  duration: string;
  thumbnail: string;
}

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  likes: number;
}

interface VideoState {
  liked: boolean;
  comments: Comment[];
}

interface VideoPlayerProps {
  video: Video;
  videos: Video[];
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onAddToPlaylist: (videoId: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onLoadRecommendedVideo: (video: Video) => void;
  onSubscribe?: (channel: string) => void;
  isSubscribed?: boolean;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
  onDownload?: (videoId: string) => void;
  onAddToWatchLater?: (videoId: string) => void; // Add watch later handler
}

// Simple in-memory storage for video states
const videoStates: Record<string, VideoState> = {};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  videos, 
  onNext, 
  onPrevious, 
  onClose,
  onMinimize,
  onAddToPlaylist,
  onDeleteVideo,
  onLoadRecommendedVideo,
  onSubscribe,
  isSubscribed,
  notificationsEnabled,
  onToggleNotifications,
  onDownload,
  onAddToWatchLater // Add watch later handler
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Load or initialize video state when video changes
  useEffect(() => {
    if (videoRef.current) {
      // Reset player state when video changes
      setIsPlaying(false);
      setCurrentTime(0);
      // Simulate a 5-minute video
      setDuration(300);
    }
    
    // Check if we have saved state for this video title
    const savedState = videoStates[video.title];
    
    if (savedState) {
      // Load saved state
      setLiked(savedState.liked);
      setComments(savedState.comments);
    } else {
      // Initialize with default state
      setLiked(false);
      const defaultComments = [
        {
          id: '1',
          username: 'Tech Enthusiast',
          text: 'Great video! Really helped me understand the concept.',
          timestamp: '2 days ago',
          likes: 24
        },
        {
          id: '2',
          username: 'Coding Master',
          text: 'Thanks for the tutorial. Can you make one on advanced topics?',
          timestamp: '1 day ago',
          likes: 12
        }
      ];
      setComments(defaultComments);
      
      // Save initial state
      videoStates[video.title] = {
        liked: false,
        comments: defaultComments
      };
    }
    
    // Reset comment form when video changes
    setComment('');
  }, [video.title]);

  // Save state when liked or comments change
  useEffect(() => {
    // Save current state for this video title
    videoStates[video.title] = {
      liked,
      comments
    };
  }, [video.title, liked, comments]);

  // Scroll to bottom of comments when new comment is added
  useEffect(() => {
    if (showComments && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, showComments]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video play/pause events
  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  // Handle video end event
  const handleVideoEnd = () => {
    setIsPlaying(false);
    // Optionally play the next video automatically
    // onNext();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleLike = () => {
    setLiked(!liked);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() === '') return;
    
    const newComment: Comment = {
      id: `${Date.now()}`, // Unique ID based on timestamp
      username: 'Current User',
      text: comment,
      timestamp: 'Just now',
      likes: 0
    };
    
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    setComment('');
  };

  const handleSubscribeClick = () => {
    if (onSubscribe) {
      onSubscribe(video.channel);
    }
  };

  const handleNotificationToggle = () => {
    if (onToggleNotifications) {
      onToggleNotifications();
    }
  };

  const handleDownload = () => {
    console.log(`Downloading video: ${video.title}`);
    // In a real app, this would trigger a download
    alert(`Downloading "${video.title}"`);
    
    // Call the download handler if provided
    if (onDownload) {
      onDownload(video.id);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Get recommended videos (excluding current video)
  const recommendedVideos = videos.filter(v => v.id !== video.id).slice(0, 10);

  // Check if video should use YouTube embed
  const isYouTubeVideo = (title: string) => {
    return title === 'Tu Hai Kahan' || title === 'Tu han Kahan' || title === '12 Bande' || title === 'Apa Fer Milaange';
  };

  // Get YouTube video ID from URL
  const getYouTubeVideoId = (title: string) => {
    if (title === 'Tu Hai Kahan' || title === 'Tu han Kahan') {
      return 'AX6OrbgS8lI';
    }
    if (title === '12 Bande') {
      return 'yIR76Q3InbY';
    }
    if (title === 'Apa Fer Milaange') {
      return 'Pp82_VdaKqE';
    }
    return '';
  };

  // Simulated video sources for the requested songs
  const getVideoSource = (title: string) => {
    // In a real app, this would be actual video URLs
    // For demo purposes, we'll simulate different videos
    // Map specific titles to YouTube URLs
    if (title === 'Tu Hai Kahan' || title === 'Tu han Kahan') {
      return 'https://youtu.be/AX6OrbgS8lI?list=RDAX6OrbgS8lI';
    }
    
    if (title === '12 Bande') {
      return 'https://youtu.be/yIR76Q3InbY?list=RDyIR76Q3InbY';
    }
    
    if (title === 'Apa Fer Milaange') {
      return 'https://youtu.be/Pp82_VdaKqE?list=RDPp82_VdaKqE';
    }
    
    const videoMap: Record<string, string> = {
      'Murder': 'https://example.com/murder.mp4'
    };
    
    return videoMap[title] || 'https://example.com/default-video.mp4';
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="video-player-overlay">
      <div className="video-player-container">
        <div className="video-player-header">
          <h2>{video.title}</h2>
          <div className="player-controls">
            <button className="minimize-button" onClick={onMinimize}>−</button>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="video-player-content">
          <div className="video-main-content">
            {/* Video element - using a placeholder since we can't host actual videos */}
            <div className="video-placeholder">
              {isPlaying ? null : (
                <div className="video-thumbnail-large" onClick={togglePlay}>
                  <div className="play-overlay">▶</div>
                </div>
              )}
              {isYouTubeVideo(video.title) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.title)}?autoplay=1&mute=0`}
                  className="video-element"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                ></iframe>
              ) : (
                <video
                  ref={videoRef}
                  className="video-element"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onEnded={handleVideoEnd}
                >
                  <source src={getVideoSource(video.title)} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            
            {/* Video controls */}
            {!isYouTubeVideo(video.title) && (
              <div className="video-controls">
                <div className="progress-container" onClick={handleProgressClick}>
                  <div 
                    className="progress-bar" 
                  >
                    <div 
                      className="progress-filled" 
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="controls-row">
                  <div className="left-controls">
                    <button className="control-button" onClick={togglePlay}>
                      {isPlaying ? '⏸' : '▶'}
                    </button>
                    <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Video actions */}
            <div className="video-actions">
              <button className={`action-button ${liked ? 'liked' : ''}`} onClick={toggleLike}>
                {liked ? '❤️' : '🤍'} Like
              </button>
              <button className="action-button" onClick={toggleComments}>
                💬 Comment ({comments.length})
              </button>
              <button className="action-button">↗️ Share</button>
              
              {/* Subscribe button in video player */}
              {onSubscribe && (
                <button 
                  className={`action-button ${isSubscribed ? 'subscribed' : ''}`}
                  onClick={handleSubscribeClick}
                >
                  {isSubscribed ? '✅ Subscribed' : '➕ Subscribe'}
                </button>
              )}
              
              {/* Notification toggle for subscribed channels */}
              {isSubscribed && onToggleNotifications && (
                <button 
                  className={`action-button notification-toggle ${notificationsEnabled ? 'enabled' : 'disabled'}`}
                  onClick={handleNotificationToggle}
                >
                  {notificationsEnabled ? '🔔 Notifications ON' : '🔕 Notifications OFF'}
                </button>
              )}
              
              <VideoMenu 
                onAddToPlaylist={() => onAddToPlaylist(video.id)}
                onDelete={() => onDeleteVideo(video.id)}
                onAddToWatchLater={onAddToWatchLater ? () => onAddToWatchLater(video.id) : undefined} // Pass watch later handler
                videoTitle={video.title}
                videoId={video.id}
                onDownload={onDownload}
                onSubscribe={onSubscribe ? () => onSubscribe(video.channel) : undefined}
                isSubscribed={isSubscribed}
                notificationsEnabled={notificationsEnabled}
                onToggleNotifications={onToggleNotifications}
                showFullMenu={true} // Always show full menu in video player
              />
              
              {/* Download button in video player actions */}
              <button className="action-button" onClick={() => onDownload && onDownload(video.id)}>
                ⬇️ Download
              </button>
            </div>
            
            {/* Comments section */}
            {showComments && (
              <div className="comments-section">
                <h3>Comments ({comments.length})</h3>
                <div className="comments-list">
                  {comments.map(comment => (
                    <div className="comment-item" key={comment.id}>
                      <div className="comment-avatar"></div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-username">{comment.username}</span>
                          <span className="comment-timestamp">{comment.timestamp}</span>
                        </div>
                        <div className="comment-text">{comment.text}</div>
                        <div className="comment-actions">
                          <button className="comment-action-button">👍 {comment.likes}</button>
                          <button className="comment-action-button">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={commentsEndRef} />
                </div>
                <form className="comment-form" onSubmit={handleAddComment}>
                  <div className="comment-input-container">
                    <div className="comment-avatar-small"></div>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="comment-input"
                    />
                  </div>
                  <div className="comment-form-actions">
                    <button type="button" className="cancel-button" onClick={() => setShowComments(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-button" disabled={!comment.trim()}>
                      Comment
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Recommendations sidebar */}
          <div className="recommendations-sidebar">
            <h3>Up next</h3>
            <div className="recommendations-list">
              {recommendedVideos.map(recVideo => (
                <div 
                  className="recommendation-item" 
                  key={recVideo.id}
                  onClick={() => onLoadRecommendedVideo(recVideo)}
                >
                  <div className="recommendation-thumbnail">
                    <div className="duration">{recVideo.duration}</div>
                  </div>
                  <div className="recommendation-info">
                    <div className="recommendation-title">{recVideo.title}</div>
                    <div className="recommendation-channel">{recVideo.channel}</div>
                    <div className="recommendation-meta">{recVideo.views} views • {recVideo.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="video-info-panel">
          <div className="channel-info">
            <div className="channel-avatar-large"></div>
            <div className="channel-details">
              <h3>{video.channel}</h3>
              <p>{video.views} views • {video.timestamp}</p>
            </div>
          </div>
          <div className="video-description">
            <p>This is a simulated video player for "{video.title}". In a real application, this would play the actual video content.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;