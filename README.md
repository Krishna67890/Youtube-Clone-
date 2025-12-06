# YouTube Clone

This is a YouTube clone application built with React, TypeScript, Node.js, and MongoDB.

## Features

- User authentication (register/login/logout)
- YouTube-like responsive UI with light/dark mode
- Interactive demo user accounts
- Video grid layout with thumbnails
- Working hamburger menu and sidebar navigation
- History, subscriptions, and playlists organization
- Video playback with next/previous controls
- 3-dot menu for videos with add/delete functionality
- Video recommendations sidebar
- Like, comment, and share functionality
- Minimizable video player
- Gaming, music, and shorts content sections
- Mobile-friendly responsive design
- Persistent like/comment status per video title
- Search functionality
- Video upload and playback
- Comments and replies
- Subscriptions
- Playlists
- User profiles and channels
- Advanced video settings (quality, subtitles, download)
- Enhanced sidebar with new sections: Liked videos, Watch later, Your videos, Downloads
- About Us section with team information
- Subscription system with subscribe button and notifications
- Messaging system for demo users to communicate
- Random 30-second video content generation for homepage
- Subscribe button on video cards that adds channels to Subscriptions tab
- Subscribe/Unsubscribe button in video player with notification toggle (just like YouTube)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (optional - for full backend functionality)
- npm or yarn

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd Frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Build for production:
   ```
   npm run build
   ```

### Backend Setup (Optional - Requires MongoDB)

1. Install MongoDB on your system or use MongoDB Atlas
2. Navigate to the backend directory:
   ```
   cd Backend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the `src/config` directory with the following content:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/youtube_clone
   JWT_SECRET=youtube_clone_jwt_secret
   ```

5. Run the backend:
   ```
   npm run dev
   ```

## Authentication Flow

### Registration
- Users can register with any email and password combination
- Registered users are stored in localStorage
- Duplicate email registrations are prevented
- Interactive demo users can be clicked to prefill registration forms

### Login
- Users can login with either:
  1. Their registered credentials
  2. One of the 4 demo user accounts (clickable in the login modal):
     - Krishna Patil Rajput (krishna@example.com / krishna123)
     - Atharva Patil Rajput (atharva@example.com / atharva123)
     - Ankush Khakale (ankush@example.com / ankush123)
     - Mahesh Vispute (mahesh@example.com / mahesh123)
- Successful login redirects to the home page
- Invalid credentials show error messages
- Clicking on demo users prefills login forms

### Logout
- Authenticated users can logout by clicking their avatar and selecting "Sign out"
- Logout clears the session and redirects to the landing page

## Theme Switching

- Toggle between light and dark mode using the moon/sun icon in the header
- Theme preference is saved in localStorage
- Automatically detects system preference on first visit

## Navigation Features

### Hamburger Menu
- Click the hamburger icon (☰) to toggle the sidebar
- Works on both desktop and mobile devices
- Collapses/expands the sidebar smoothly with animation

### Sidebar Organization
The sidebar is organized into several sections:
1. **Main Navigation**:
   - Home
   - Trending
   - Shorts
   - Subscriptions

2. **Library**:
   - Library
   - History
   - Liked videos
   - Watch later
   - Your videos
   - Downloads

3. **Explore**:
   - Gaming
   - Music

4. **Information**:
   - About us
   - Settings
   - Help
   - Send feedback

### Video Interaction
- All videos in the grid are clickable
- Hover effect provides visual feedback
- Videos display:
  - Thumbnail with duration overlay
  - Title (truncated to 2 lines)
  - Channel name
  - View count and upload timestamp
- Subscribe button for channels (adds to Subscriptions tab)
- Notification toggle for subscribed channels
- 3-dot menu for each video with:
  - Add to playlist option
  - Delete from history/playlist option
  - Quality settings
  - Subtitle settings
  - Download option

### Video Playback
- Click any video to open the player
- Full video player with controls:
  - Play/Pause button
  - Next/Previous video navigation (no like requirement)
  - Progress bar with seeking
  - Volume control
  - Minimize and close buttons
- Video actions:
  - Like button (toggle, persists per video title)
  - Comment button (opens comment section, persists per video title)
  - Share button
  - Subscribe/Unsubscribe button (just like YouTube)
  - Notification toggle for subscribed channels
- Recommendations sidebar with related videos:
  - Clicking a recommendation loads it in the player
  - Shows "Up next" instead of "Recommended"
- Commenting system:
  - Add new comments
  - View existing comments
  - Like comments
  - Reply to comments
- Content categories:
  - Gaming (Minecraft, GTA 5, RDR1, RDR2)
  - Music (Tu Hai Kahan, 12 Bande, Murder, Apa Fer Milaange)
  - Shorts (quick content videos)
- Mobile-friendly responsive design:
  - Adapts to all screen sizes
  - Touch-friendly controls
  - Optimized layouts for phones and tablets
- Persistent like/comment status:
  - Like status persists for videos with the same title
  - Comment section persists per video title
  - Navigating away and returning maintains previous interactions

### Advanced Video Settings
Accessed through the 3-dot menu:
- **Quality Settings**: Choose from 144p to 4K resolutions
- **Subtitle Settings**: Select from multiple language options
- **Download**: Download the video to your device

### Subscription System
- Subscribe button on each video/channel (both on homepage and in video player)
- Notification toggle for subscribed channels
- Visual indication of subscription status
- Subscriptions section in sidebar (shows content from subscribed channels)

### Messaging System
- Chat icon in bottom right corner
- Message windows for communication between demo users
- Unread message indicators
- Team chat functionality
- Personal messaging between demo users

### About Us Section
- Detailed information about the development team
- Profiles of all 4 demo users:
  - Krishna Patil Rajput (Full Stack Developer)
  - Atharva Patil Rajput (Frontend Developer)
  - Ankush Khakale (Backend Developer)
  - Mahesh Vispute (DevOps Engineer)

## Demo Users

The application comes with 4 demo users (clickable in the login/register modal):

1. Krishna Patil Rajput
   - Email: krishna@example.com
   - Password: krishna123

2. Atharva Patil Rajput
   - Email: atharva@example.com
   - Password: atharva123

3. Ankush Khakale
   - Email: ankush@example.com
   - Password: ankush123

4. Mahesh Vispute
   - Email: mahesh@example.com
   - Password: mahesh123

## Seeding Demo Users

To seed the database with demo users (requires MongoDB):
```
npm run seed-users
```

## Technologies Used

### Frontend
- React
- TypeScript
- Redux Toolkit
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Project Structure

### Backend
```
Backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── app.js          # Express app setup
├── server.js           # Entry point
└── package.json        # Dependencies
```

### Frontend
```
Frontend/
├── src/
│   ├── components/     # React components
│   │   ├── auth/       # Authentication components
│   │   ├── VideoPlayer.tsx # Video player component
│   │   └── VideoMenu.tsx   # 3-dot menu component
│   ├── pages/          # Page components
│   ├── store/          # Redux store
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   ├── styles/         # CSS styles
│   ├── App.tsx         # Main App component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── index.html          # HTML template
└── package.json        # Dependencies
```

## Current Status

The frontend is fully functional with mock authentication and a YouTube-like UI. You can:
- Register new users (data is stored in localStorage)
- Login with existing credentials or demo accounts
- Logout using the user menu
- Switch between light and dark themes
- Use interactive demo user cards that prefill forms
- Toggle the sidebar with the hamburger menu
- Navigate using the sidebar with organized sections
- View video grid layout with clickable videos
- Play videos with full player controls (next/previous/pause)
- Use 3-dot menu to add/delete videos from playlists/history
- Access advanced video settings (quality, subtitles, download)
- Like videos, add comments, and see recommendations
- Minimize the video player to continue browsing
- Access Gaming, Music, and Shorts content sections
- Enjoy mobile-friendly responsive design
- Experience persistent like/comment status per video title
- Use the enhanced sidebar with new sections
- Access the About Us section with team information
- Subscribe to channels and toggle notifications (subscribed channels appear in Subscriptions tab)
- Use Subscribe/Unsubscribe button in video player with notification toggle (just like YouTube)
- Communicate with other demo users through the messaging system
- See authentication state in the Redux store

To enable full backend functionality with persistent user accounts, MongoDB must be installed and configured.