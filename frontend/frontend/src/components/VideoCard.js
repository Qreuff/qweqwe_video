import React from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ id, title, description, thumbnail }) => {
  return (
    <div className="video-card" style={styles.card}>
      <Link to={`/video/${id}`} style={styles.thumbnailLink}>
        <img 
          src={thumbnail || 'https://via.placeholder.com/320x180'} 
          alt={title} 
          style={styles.thumbnail}
        />
      </Link>
      <div style={styles.content}>
        <h3 style={styles.title}>
          <Link to={`/video/${id}`} style={styles.titleLink}>{title}</Link>
        </h3>
        <p style={styles.description}>{description}</p>
      </div>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #e1e1e1',
    borderRadius: '8px',
    overflow: 'hidden',
    margin: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  thumbnailLink: {
    display: 'block',
    textDecoration: 'none'
  },
  thumbnail: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderBottom: '1px solid #e1e1e1'
  },
  content: {
    padding: '15px'
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '1.1rem',
    color: '#333'
  },
  titleLink: {
    color: 'inherit',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  description: {
    margin: '0',
    fontSize: '0.9rem',
    color: '#666',
    lineHeight: '1.4'
  }
};

export default VideoCard;