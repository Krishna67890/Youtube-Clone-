import React from 'react';
import { Link } from 'react-router-dom';

interface VideoCardProps {
  id: string;
  title: string;
  channelName: string;
  views: number;
  timestamp: string;
  thumbnail: string;
  duration: string;
}

const VideoCard: React.FC<VideoCardProps> = ({
  id,
  title,
  channelName,
  views,
  timestamp,
  thumbnail,
  duration
}) => {
  return (
    <div className="video-card">
      <Link to={`/watch/${id}`} className="thumbnail-link">
        <div className="thumbnail-container">
          <img src={thumbnail} alt={title} className="thumbnail" />
          <span className="duration">{duration}</span>
        </div>
      </Link>
      
      <div className="video-info">
        <div className="channel-avatar"></div>
        <div className="video-details">
          <h3 className="video-title">
            <Link to={`/watch/${id}`}>{title}</Link>
          </h3>
          <p className="channel-name">{channelName}</p>
          <p className="video-meta">
            {views.toLocaleString()} views • {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;