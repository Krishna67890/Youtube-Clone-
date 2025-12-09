import React from 'react';

interface VideoCardSkeletonProps {
  count?: number;
}

const VideoCardSkeleton: React.FC<VideoCardSkeletonProps> = ({ count = 12 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="video-card-skeleton">
          <div className="skeleton-thumbnail"></div>
          <div className="video-info">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-text">
              <div className="skeleton-line"></div>
              <div className="skeleton-line" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default VideoCardSkeleton;