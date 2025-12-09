import React from 'react';

interface MobileBottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  toggleMobileMenu: () => void;
  goToHome: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  setCurrentView,
  toggleMobileMenu,
  goToHome
}) => {
  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home', action: goToHome },
    { id: 'trending', icon: '🔥', label: 'Trending', action: () => setCurrentView('trending') },
    { id: 'shorts', icon: '⏱️', label: 'Shorts', action: () => setCurrentView('shorts') },
    { id: 'subscriptions', icon: '📺', label: 'Subscriptions', action: () => setCurrentView('subscriptions') },
    { id: 'menu', icon: '☰', label: 'Menu', action: toggleMobileMenu }
  ];

  return (
    <div className="mobile-nav-bottom">
      {navItems.map(item => (
        <a 
          key={item.id}
          href="#" 
          className={`mobile-nav-item ${currentView === item.id ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            item.action();
          }}
        >
          <div className="mobile-nav-icon">{item.icon}</div>
          <span>{item.label}</span>
        </a>
      ))}
    </div>
  );
};

export default MobileBottomNav;