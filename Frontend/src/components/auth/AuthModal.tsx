import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DemoUser {
  name: string;
  email: string;
  password: string;
}

const demoUsers: DemoUser[] = [
  { name: 'Krishna Patil Rajput', email: 'krishna@example.com', password: 'krishna123' },
  { name: 'Atharva Patil Rajput', email: 'atharva@example.com', password: 'atharva123' },
  { name: 'Ankush Khakale', email: 'ankush@example.com', password: 'ankush123' },
  { name: 'Mahesh Vispute', email: 'mahesh@example.com', password: 'mahesh123' }
];

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [prefillData, setPrefillData] = useState<{ email?: string; password?: string }>({});

  // Always render the component but conditionally show/hide with CSS
  if (!isOpen) return null;

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setPrefillData({}); // Clear prefill data when switching forms
  };

  const handleDemoUserClick = (user: DemoUser, formType: 'register' | 'login') => {
    if (formType === 'register') {
      // For registration, prefill username and email, but not password
      setPrefillData({ 
        email: user.email
      });
      setIsLogin(false); // Switch to register form
    } else {
      // For login, prefill email and password
      setPrefillData({ 
        email: user.email, 
        password: user.password 
      });
      setIsLogin(true); // Switch to login form
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="auth-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <div className="auth-header">
          <h2>{isLogin ? 'Sign in' : 'Create account'}</h2>
        </div>
        <div className="auth-form">
          {isLogin ? (
            <LoginForm onToggleForm={toggleForm} prefillData={prefillData} onLoginSuccess={onClose} />
          ) : (
            <RegisterForm onToggleForm={toggleForm} prefillData={prefillData} />
          )}
        </div>
        
        {/* Demo Accounts Information */}
        <div className="demo-users-info">
          <h3>Demo Accounts</h3>
          <p className="demo-instruction">Click on any user to {isLogin ? 'login' : 'register'} with their credentials</p>
          <div className="demo-users-grid">
            {demoUsers.map((user, index) => (
              <div 
                key={index} 
                className="demo-user-card"
                onClick={() => handleDemoUserClick(user, isLogin ? 'login' : 'register')}
              >
                <div className="demo-user-avatar">{user.name.charAt(0)}</div>
                <div className="demo-user-details">
                  <div className="demo-user-name">{user.name}</div>
                  <div className="demo-user-credentials">
                    <span className="demo-user-email">{user.email}</span>
                    {!isLogin && <span className="demo-user-password">Password: {user.password}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;