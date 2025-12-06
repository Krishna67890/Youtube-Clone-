const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'youtube_clone_secret_key';

const auth = async (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  // Check if not token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;