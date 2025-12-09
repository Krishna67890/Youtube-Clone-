import React from 'react';
import VideoGrid from './VedioGrid';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <div className="content">
        <VideoGrid />
      </div>
    </div>
  );
};

export default Home;