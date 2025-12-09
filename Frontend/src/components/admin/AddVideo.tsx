import React, { useState } from 'react';

interface AddVideoProps {
  onVideoAdded: () => void;
}

const AddVideo: React.FC<AddVideoProps> = ({ onVideoAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('Music');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // In a real application, this would send a request to your backend
      // For now, we'll simulate the process
      console.log('Adding video:', {
        title,
        description,
        thumbnail,
        duration,
        category,
        tags: tags.split(',').map(tag => tag.trim())
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      setMessage('Video added successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setThumbnail('');
      setDuration('');
      setTags('');
      
      // Notify parent component
      onVideoAdded();
    } catch (error) {
      console.error('Error adding video:', error);
      setMessage('Error adding video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-video-form">
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Video description"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail URL:</label>
          <input
            type="text"
            id="thumbnail"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="https://example.com/thumbnail.jpg"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="duration">Duration (seconds):</label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="240"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Music">Music</option>
              <option value="Gaming">Gaming</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sports">Sports</option>
              <option value="News">News</option>
              <option value="Howto">How-to</option>
              <option value="Tech">Technology</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated):</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Uploading...' : 'Upload Video'}
        </button>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddVideo;