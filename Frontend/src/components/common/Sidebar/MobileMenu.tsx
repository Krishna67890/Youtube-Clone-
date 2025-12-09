import React from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user: any;
  handleLogout: () => void;
  setCurrentView: (view: string) => void;
  setShowAboutUs: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowHelp: (show: boolean) => void;
  setIsUploadModalOpen: (open: boolean) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  handleLogout,
  setCurrentView,
  setShowAboutUs,
  setShowSettings,
  setShowHelp,
  setIsUploadModalOpen
}) => {
  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Home', action: () => { setCurrentView('home'); onClose(); } },
    { id: 'trending', icon: '🔥', label: 'Trending', action: () => { setCurrentView('trending'); onClose(); } },
    { id: 'shorts', icon: '⏱️', label: 'Shorts', action: () => { setCurrentView('shorts'); onClose(); } },
    { id: 'subscriptions', icon: '📺', label: 'Subscriptions', action: () => { setCurrentView('subscriptions'); onClose(); } },
    { id: 'library', icon: '📚', label: 'Library', action: () => { setCurrentView('home'); onClose(); } },
    { id: 'history', icon: '🕒', label: 'History', action: () => { setCurrentView('history'); onClose(); } },
    { id: 'liked', icon: '👍', label: 'Liked videos', action: () => { setCurrentView('liked'); onClose(); } },
    { id: 'watchlater', icon: '⏱️', label: 'Watch later', action: () => { setCurrentView('watchlater'); onClose(); } },
    { id: 'yourvideos', icon: '🎥', label: 'Your videos', action: () => { setCurrentView('yourvideos'); onClose(); } },
    { id: 'downloads', icon: '⬇️', label: 'Downloads', action: () => { setCurrentView('downloads'); onClose(); } },
    { id: 'gaming', icon: '🎮', label: 'Gaming', action: () => { setCurrentView('gaming'); onClose(); } },
    { id: 'music', icon: '🎵', label: 'Music', action: () => { setCurrentView('music'); onClose(); } },
    { id: 'about', icon: 'ℹ️', label: 'About us', action: () => { setShowAboutUs(true); onClose(); } },
    { id: 'settings', icon: '⚙️', label: 'Settings', action: () => { setShowSettings(true); onClose(); } },
    { id: 'help', icon: '❓', label: 'Help', action: () => { setShowHelp(true); onClose(); } },
    { id: 'feedback', icon: '💬', label: 'Send feedback', action: () => { setCurrentView('feedback'); onClose(); } },
    { id: 'upload', icon: '⬆️', label: 'Upload Video', action: () => { setIsUploadModalOpen(true); onClose(); } }
  ];

  return (
    <>
      {/* Mobile Menu - only visible on mobile devices when open */}
      <div className={`mobile-menu ${isOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="logo" onClick={() => { setCurrentView('home'); onClose(); }}>
            <span>You</span><span>Tube</span>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {/* User Profile Section */}
        {isAuthenticated && user && (
          <div className="mobile-menu-profile">
            <div className="user-avatar-large">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-email">{user.email || 'user@example.com'}</div>
            </div>
            <button className="sign-out-button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
        
        <div className="mobile-menu-content">
          <div className="mobile-menu-section">
            <h3>Navigation</h3>
            {menuItems.slice(0, 4).map(item => (
              <div 
                key={item.id}
                className="mobile-menu-item"
                onClick={item.action}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.action();
                  }
                }}
              >
                <div className="mobile-menu-icon">{item.icon}</div>
                <div className="mobile-menu-text">{item.label}</div>
              </div>
            ))}
          </div>
          
          <div className="mobile-menu-section">
            <h3>Library</h3>
            {menuItems.slice(4, 11).map(item => (
              <div 
                key={item.id}
                className="mobile-menu-item"
                onClick={item.action}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.action();
                  }
                }}
              >
                <div className="mobile-menu-icon">{item.icon}</div>
                <div className="mobile-menu-text">{item.label}</div>
              </div>
            ))}
          </div>
          
          <div className="mobile-menu-section">
            <h3>Settings</h3>
            {menuItems.slice(11).map(item => (
              <div 
                key={item.id}
                className="mobile-menu-item"
                onClick={item.action}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.action();
                  }
                }}
              >
                <div className="mobile-menu-icon">{item.icon}</div>
                <div className="mobile-menu-text">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      {isOpen && <div className="mobile-menu-overlay" onClick={onClose}></div>}
    </>
  );
};

export default MobileMenu;