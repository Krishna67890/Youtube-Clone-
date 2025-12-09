import React, { useState } from 'react';
import AddVideo from '../../components/admin/AddVideo';

const AdminPanel: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  
  const handleVideoAdded = () => {
    // In a real application, this would fetch updated video list from backend
    // For now, we'll just show a notification
    alert('Video successfully uploaded!');
  };

  return (
    <div className="admin-panel">
      <div className="container">
        <h1>Upload Videos</h1>
        
        <div className="admin-content">
          <div className="admin-sidebar">
            <div 
              className={`sidebar-item ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <span>Upload Video</span>
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <span>Manage Videos</span>
            </div>
            <div className="sidebar-item">
              <span>Analytics</span>
            </div>
            <div className="sidebar-item">
              <span>Settings</span>
            </div>
          </div>
          
          <div className="admin-main">
            {activeTab === 'upload' ? (
              <AddVideo onVideoAdded={handleVideoAdded} />
            ) : (
              <div className="manage-videos">
                <h2>Manage Videos</h2>
                <div className="video-filters">
                  <div className="filter-group">
                    <label>Category:</label>
                    <select>
                      <option>All</option>
                      <option>Music</option>
                      <option>Gaming</option>
                      <option>Education</option>
                      <option>Entertainment</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Sort by:</label>
                    <select>
                      <option>Newest</option>
                      <option>Oldest</option>
                      <option>Most Views</option>
                      <option>Least Views</option>
                    </select>
                  </div>
                  <button className="btn btn-primary">Apply Filters</button>
                </div>
                
                <div className="video-list">
                  <div className="video-table">
                    <div className="table-header">
                      <div className="table-cell">Thumbnail</div>
                      <div className="table-cell">Title</div>
                      <div className="table-cell">Category</div>
                      <div className="table-cell">Views</div>
                      <div className="table-cell">Date</div>
                      <div className="table-cell">Actions</div>
                    </div>
                    <div className="table-row">
                      <div className="table-cell">
                        <div className="thumbnail-small"></div>
                      </div>
                      <div className="table-cell">Sample Video Title</div>
                      <div className="table-cell">Music</div>
                      <div className="table-cell">1,234</div>
                      <div className="table-cell">2023-05-15</div>
                      <div className="table-cell">
                        <button className="btn btn-secondary">Edit</button>
                        <button className="btn btn-danger">Delete</button>
                      </div>
                    </div>
                    <div className="table-row">
                      <div className="table-cell">
                        <div className="thumbnail-small"></div>
                      </div>
                      <div className="table-cell">Another Video Title</div>
                      <div className="table-cell">Gaming</div>
                      <div className="table-cell">5,678</div>
                      <div className="table-cell">2023-05-10</div>
                      <div className="table-cell">
                        <button className="btn btn-secondary">Edit</button>
                        <button className="btn btn-danger">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;