import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, clearError } from '../../Store/slices/authSlice';
import { authAPI } from '../../services/api/authAPI';

interface LoginFormProps {
  onToggleForm: () => void;
  prefillData?: { email?: string; password?: string };
  onLoginSuccess?: () => void; // Add this prop
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm, prefillData = {}, onLoginSuccess }) => {
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state: any) => state.auth);
  
  const [formData, setFormData] = useState({
    email: prefillData.email || '',
    password: prefillData.password || '',
  });

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Update form data when prefillData changes
  useEffect(() => {
    setFormData(prev => ({
      email: prefillData.email || prev.email,
      password: prefillData.password || prev.password,
    }));
  }, [prefillData]);

  const { email, password } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());
    
    try {
      const data = await authAPI.login({ email, password });
      dispatch(loginSuccess(data));
      // Call the onLoginSuccess callback if provided
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      // Handle both network errors and API errors
      const errorMessage = err.response?.data?.msg || err.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={onChange}
          required
        />
        <i>📧</i>
      </div>
      <div className="form-group">
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={onChange}
          minLength={6}
          required
        />
        <i>🔒</i>
      </div>
      
      {error && (
        <div className="error-message">
          <i>⚠️</i>
          {error}
        </div>
      )}
      
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? (
          <>
            <span className="loading-spinner"></span>
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>
      
      <div className="auth-footer">
        <p>Don't have an account? <button type="button" onClick={onToggleForm} className="link-button">Create account</button></p>
      </div>
    </form>
  );
};

export default LoginForm;