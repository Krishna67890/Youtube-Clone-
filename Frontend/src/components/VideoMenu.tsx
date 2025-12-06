import React, { useState, useRef, useEffect } from 'react';

interface VideoMenuProps {
  onAddToPlaylist: () => void;
  onDelete: () => void;
  videoTitle: string;
  videoId: string;
  onSubscribe?: () => void;
  isSubscribed?: boolean;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
  onDownload?: (videoId: string) => void;
  onAddToWatchLater?: () => void; // Add watch later handler
  showFullMenu?: boolean; // Add prop to control menu options
}

const VideoMenu: React.FC<VideoMenuProps> = ({ 
  onAddToPlaylist, 
  onDelete, 
  videoTitle,
  videoId,
  onSubscribe,
  isSubscribed,
  notificationsEnabled,
  onToggleNotifications,
  onDownload,
  onAddToWatchLater, // Add watch later handler
  showFullMenu = true // Default to full menu
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const [showSubtitleOptions, setShowSubtitleOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowQualityOptions(false);
        setShowSubtitleOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to parent
    setIsOpen(!isOpen);
    // Reset submenu states when closing main menu
    if (isOpen) {
      setShowQualityOptions(false);
      setShowSubtitleOptions(false);
    }
  };

  const handleDownload = () => {
    console.log(`Downloading video: ${videoTitle}`);
    // In a real app, this would trigger a download
    alert(`Downloading "${videoTitle}"`);
    
    // Call the download handler if provided
    if (onDownload) {
      onDownload(videoId);
    }
  };

  return (
    <div className="video-menu" ref={menuRef}>
      <button className="menu-button" onClick={toggleMenu}>⋯</button>
      {isOpen && (
        <div className="menu-dropdown">
          {showFullMenu ? (
            <>
              <div className="menu-item" onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist();
              }}>
                Add to playlist
              </div>
              {onAddToWatchLater && (
                <div className="menu-item" onClick={(e) => {
                  e.stopPropagation();
                  onAddToWatchLater();
                }}>
                  Watch later
                </div>
              )}
              <div className="menu-item" onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}>
                Delete from {videoTitle.includes('History') ? 'history' : 'playlist'}
              </div>
              
              {/* Advanced Settings */}
              <div className="menu-divider"></div>
              
              {/* Quality Settings */}
              <div 
                className="menu-item submenu-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQualityOptions(!showQualityOptions);
                }}
              >
                Quality
                <span className="submenu-arrow">›</span>
              </div>
              {showQualityOptions && (
                <div className="submenu">
                  <div className="submenu-item">Auto</div>
                  <div className="submenu-item">144p</div>
                  <div className="submenu-item">240p</div>
                  <div className="submenu-item">360p</div>
                  <div className="submenu-item">480p</div>
                  <div className="submenu-item">720p</div>
                  <div className="submenu-item">1080p</div>
                  <div className="submenu-item">4K</div>
                </div>
              )}
              
              {/* Subtitle Settings */}
              <div 
                className="menu-item submenu-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSubtitleOptions(!showSubtitleOptions);
                }}
              >
                Subtitles/CC
                <span className="submenu-arrow">›</span>
              </div>
              {showSubtitleOptions && (
                <div className="submenu">
                  <div className="submenu-item">Off</div>
                  <div className="submenu-item">English</div>
                  <div className="submenu-item">Spanish</div>
                  <div className="submenu-item">French</div>
                  <div className="submenu-item">German</div>
                  <div className="submenu-item">Japanese</div>
                  <div className="submenu-item">Korean</div>
                  <div className="submenu-item">Chinese</div>
                  <div className="submenu-item">Hindi</div>
                  <div className="submenu-item">Arabic</div>
                  <div className="submenu-item">Russian</div>
                  <div className="submenu-item">Portuguese</div>
                  <div className="submenu-item">Italian</div>
                  <div className="submenu-item">Dutch</div>
                  <div className="submenu-item">Turkish</div>
                </div>
              )}
              
              {/* Download Option */}
              <div className="menu-item" onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}>
                Download
              </div>
              
              {/* Subscribe Option (if provided) */}
              {onSubscribe && (
                <>
                  <div className="menu-divider"></div>
                  <div 
                    className={`menu-item ${isSubscribed ? 'subscribed' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubscribe();
                    }}
                  >
                    {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                  </div>
                  {isSubscribed && onToggleNotifications && (
                    <div 
                      className={`menu-item notification-toggle ${notificationsEnabled ? 'enabled' : 'disabled'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleNotifications();
                      }}
                    >
                      Notifications {notificationsEnabled ? 'ON' : 'OFF'}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            // Simplified menu for specific sections
            <div className="menu-item" onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}>
              Remove from {videoTitle.includes('History') ? 'history' : 
                         videoTitle.includes('Downloads') ? 'downloads' : 
                         videoTitle.includes('Watch later') ? 'watch later' : 
                         videoTitle.includes('Your videos') ? 'your videos' : 
                         videoTitle.includes('Liked videos') ? 'liked videos' : 
                         videoTitle.includes('Gaming') ? 'gaming' : 
                         videoTitle.includes('Music') ? 'music' : 'playlist'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoMenu;