import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { registerStart, registerSuccess, registerFailure } from '../../Store/slices/AuthSlice';
import { authAPI } from '../../services/api/authAPI';

interface RegisterFormProps {
  onToggleForm: () => void;
  prefillData?: { email?: string; password?: string };
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm, prefillData = {} }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    email: prefillData.email || '',
    password: '',
    confirmPassword: '',
  });

  // Update form data when prefillData changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      email: prefillData.email || prev.email,
    }));
  }, [prefillData]);

  const { username, email, password, confirmPassword } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      dispatch(registerFailure('Passwords do not match'));
      return;
    }
    
    dispatch(registerStart());
    
    try {
      const data = await authAPI.register({ username, email, password });
      dispatch(registerSuccess(data));
    } catch (err: any) {
      // Handle both network errors and API errors
      const errorMessage = err.response?.data?.msg || err.message || 'Registration failed';
      dispatch(registerFailure(errorMessage));
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <input
          type="text"
          placeholder="Username"
          name="username"
          value={username}
          onChange={onChange}
          required
        />
      </div>
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
      <div className="form-group">
        <input
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={onChange}
          minLength={6}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Create account</button>
      
      <div className="auth-footer">
        <p>Already have an account? <button type="button" onClick={onToggleForm} className="link-button">Sign in</button></p>
      </div>
    </form>
  );
};

export default RegisterForm;