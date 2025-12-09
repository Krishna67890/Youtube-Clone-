import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: number;
  uploader: {
    username: string;
  };
  createdAt: string;
}

const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(`/api/videos/${id}`);
        setVideo(res.data);
        
        // Increment view count
        await axios.put(`/api/videos/${id}/views`);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    if (id) {
      fetchVideo();
    }
  }, [id]);

  if (loading) {
    return <div>Loading video...</div>;
  }

  if (!video) {
    return <div>Video not found</div>;
  }

  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const videoId = getYoutubeVideoId(video.url);

  return (
    <div className="watch-page">
      <div className="video-container">
        {videoId ? (
          <iframe
            width="100%"
            height="500"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div>Unable to load video player</div>
        )}
      </div>
      
      <div className="video-info">
        <h1>{video.title}</h1>
        <div className="video-stats">
          <span>{video.views} views</span>
          <span>Uploaded by {video.uploader.username}</span>
        </div>
        <p>{video.description}</p>
      </div>
    </div>
  );
};

export default Watch;