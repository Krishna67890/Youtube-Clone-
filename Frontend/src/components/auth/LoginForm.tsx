import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../Store/slices/AuthSlice';
import { authAPI } from '../../services/api/authAPI';

interface LoginFormProps {
  onToggleForm: () => void;
  prefillData?: { email?: string; password?: string };
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm, prefillData = {} }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: prefillData.email || '',
    password: prefillData.password || '',
  });

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
      </div>
      <button type="submit" className="btn btn-primary">Sign in</button>
      
      <div className="auth-footer">
        <p>Don't have an account? <button type="button" onClick={onToggleForm} className="link-button">Create account</button></p>
      </div>
    </form>
  );
};

export default LoginForm;