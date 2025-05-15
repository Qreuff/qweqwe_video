// src/pages/VideoList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
const VideoList = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/videos/')
      .then(res => setVideos(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {videos.map(video => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
};
export default VideoList;