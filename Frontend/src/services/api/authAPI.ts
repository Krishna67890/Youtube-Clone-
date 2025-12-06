// Mock delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Demo users
const demoUsers = [
  { id: '1', username: 'Krishna Patil Rajput', email: 'krishna@example.com', password: 'krishna123' },
  { id: '2', username: 'Atharva Patil Rajput', email: 'atharva@example.com', password: 'atharva123' },
  { id: '3', username: 'Ankush Khakale', email: 'ankush@example.com', password: 'ankush123' },
  { id: '4', username: 'Mahesh Vispute', email: 'mahesh@example.com', password: 'mahesh123' }
];

// Auth API functions
export const authAPI = {
  // Register user
  register: async (userData: { username: string; email: string; password: string }) => {
    // Simulate network delay
    await delay(1000);
    
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = existingUsers.some((user: any) => user.email === userData.email);
    
    if (userExists) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      password: userData.password // In a real app, this would be hashed
    };
    
    // Save to localStorage
    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    // Return success response
    return {
      token: 'mock-jwt-token-' + newUser.id,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    };
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    // Simulate network delay
    await delay(1000);
    
    // Check demo users first
    const demoUser = demoUsers.find(user => 
      user.email === credentials.email && user.password === credentials.password
    );
    
    if (demoUser) {
      return {
        token: 'mock-jwt-token-' + demoUser.id,
        user: {
          id: demoUser.id,
          username: demoUser.username,
          email: demoUser.email
        }
      };
    }
    
    // Check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const registeredUser = registeredUsers.find((user: any) => 
      user.email === credentials.email && user.password === credentials.password
    );
    
    if (registeredUser) {
      return {
        token: 'mock-jwt-token-' + registeredUser.id,
        user: {
          id: registeredUser.id,
          username: registeredUser.username,
          email: registeredUser.email
        }
      };
    }
    
    // If no user found
    throw new Error('Invalid credentials');
  },

  // Get authenticated user
  getAuthUser: async () => {
    // Simulate network delay
    await delay(500);
    
    // In a real app, this would verify the token and return user data
    // For now, we'll just return mock data
    return {
      id: '1',
      username: 'Authenticated User',
      email: 'user@example.com'
    };
  },
};