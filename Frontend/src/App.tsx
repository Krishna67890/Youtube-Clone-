import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './Store/hooks';
import { logout } from './Store/slices/authSlice';
import AuthModal from './components/auth/AuthModal';
import VideoPlayer from './components/VideoPlayer';
import VideoMenu from './components/VideoMenu';
import PeerChat from './components/PeerChat';
import { useTheme } from './contexts/ThemeContext';
import './App.css';
import './enhanced-responsive.css'; // Import the enhanced responsive CSS

// Define interfaces
interface Video {
  id: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  duration: string;
  thumbnail: string;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  read: boolean;
  recipientId?: string; // Optional recipient ID for direct messaging
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
}

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // Initialize sidebar state based on screen size - collapsed on mobile by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [currentView, setCurrentView] = useState('home'); // home, history, subscriptions, playlists, etc.
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([]);
  const [channelNotifications, setChannelNotifications] = useState<Record<string, boolean>>({});
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [openMessageWindows, setOpenMessageWindows] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState<{[key: string]: string}>({});
  const [downloadedVideos, setDownloadedVideos] = useState<string[]>([]); // Track downloaded videos
  const [userVideos, setUserVideos] = useState<Video[]>([]); // Track user uploaded videos
  const [userShorts, setUserShorts] = useState<Video[]>([]); // Track user uploaded shorts
  const [historyVideos, setHistoryVideos] = useState<Video[]>([]); // Track watched videos history
  const [searchQuery, setSearchQuery] = useState(''); // Search functionality
  const [searchResults, setSearchResults] = useState<Video[]>([]); // Search results
  const [peerIdInput, setPeerIdInput] = useState(''); // Peer ID input for connections
  
  // Peer chat states
  const [peerChatWindows, setPeerChatWindows] = useState<string[]>([]); // Track open peer chat windows
  const [peerMessages, setPeerMessages] = useState<Record<string, { text: string; sender: string; type: 'message' | 'system' }[]>>({});
  const [peerIds, setPeerIds] = useState<Record<string, string>>({}); // Map user IDs to peer IDs

  // New states for settings and feedback
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('general');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Advanced settings states
  const [activeSettingTab, setActiveSettingTab] = useState('general');
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [pauseOnScroll, setPauseOnScroll] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [qualityPreference, setQualityPreference] = useState('auto');
  const [subtitleLanguage, setSubtitleLanguage] = useState('off');
  const [dataSaverMode, setDataSaverMode] = useState(false);
  const [restrictedMode, setRestrictedMode] = useState(false);
  const [languagePreference, setLanguagePreference] = useState('en');
  
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();

  // Demo users for messaging
  const demoUsers = [
    { id: '1', name: 'Krishna Patil Rajput', online: true },
    { id: '2', name: 'Atharva Patil Rajput', online: true },
    { id: '3', name: 'Ankush Khakale', online: true },
    { id: '4', name: 'Mahesh Vispute', online: true }
  ];

  // Team members data
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Krishna Patil Rajput',
      role: 'Full Stack Developer',
      description: 'Lead developer responsible for backend architecture and database design.'
    },
    {
      id: '2',
      name: 'Atharva Patil Rajput',
      role: 'Frontend Developer',
      description: 'UI/UX specialist focused on creating responsive and engaging user interfaces.'
    },
    {
      id: '3',
      name: 'Ankush Khakale',
      role: 'Backend Developer',
      description: 'API and server-side logic expert with a focus on performance optimization.'
    },
    {
      id: '4',
      name: 'Mahesh Vispute',
      role: 'DevOps Engineer',
      description: 'Infrastructure and deployment specialist ensuring smooth application delivery.'
    }
  ];

  // Initialize with some demo messages
  useEffect(() => {
    if (isAuthenticated) {
      const demoMessages: Message[] = [
        {
          id: '1',
          sender: 'Atharva Patil Rajput',
          text: 'Hey Krishna, great work on the video player!',
          timestamp: '10:30 AM',
          read: false,
          recipientId: '1' // Message to Krishna (id: 1)
        },
        {
          id: '2',
          sender: 'Ankush Khakale',
          text: 'Don\'t forget to review the PR I sent for the auth module',
          timestamp: 'Yesterday',
          read: false,
          recipientId: '1' // Message to Krishna (id: 1)
        }
      ];
      setMessages(demoMessages);
      setUnreadMessages(demoMessages.filter(msg => !msg.read).length);
      
      // Initialize peer IDs for demo users
      const initialPeerIds: Record<string, string> = {};
      demoUsers.forEach(user => {
        initialPeerIds[user.id] = `peer_${user.id}_${Date.now()}`;
      });
      setPeerIds(initialPeerIds);
      
      // Set current user's peer ID
      if (user) {
        const currentUser = demoUsers.find(u => u.name === user.username);
        if (currentUser) {
          localStorage.setItem('peerId', initialPeerIds[currentUser.id]);
        }
      }
      
      // Initialize general peer messages
      setPeerMessages({
        general: [
          { text: 'Welcome to the study group!', sender: '', type: 'system' },
          { text: 'System: Peer connection established', sender: '', type: 'system' }
        ]
      });
    }
  }, [isAuthenticated]);

  // Add resize event listener to handle sidebar state on screen size changes
  useEffect(() => {
    const handleResize = () => {
      // On desktop (width > 768px), sidebar should be open by default
      // On mobile (width <= 768px), sidebar should be closed by default
      setIsSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
  
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Clear search when navigating home
  const goToHome = () => {
    setCurrentView('home');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
  };

  const selectVideo = (video: any) => {
    console.log('Video selected:', video);
    setSelectedVideo(video);
    setIsPlayerMinimized(false);
    
    // Add video to history when selected
    addToHistory(video);
  };

  // Function to add video to history
  const addToHistory = (video: Video) => {
    // Check if video is already in history
    const isAlreadyInHistory = historyVideos.some((v: Video) => v.id === video.id);
    
    if (!isAlreadyInHistory) {
      // Add to history (limit to 50 videos)
      setHistoryVideos((prev: Video[]) => {
        const newHistory = [video, ...prev];
        return newHistory.slice(0, 50); // Keep only last 50 videos
      });
    }
  };

  const closeVideoPlayer = () => {
    setSelectedVideo(null);
    setIsPlayerMinimized(false);
  };

  const minimizeVideoPlayer = () => {
    setIsPlayerMinimized(true);
  };

  const playNextVideo = () => {
    if (!selectedVideo) return;
    
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    const nextIndex = (currentIndex + 1) % videos.length;
    setSelectedVideo(videos[nextIndex]);
  };

  const playPreviousVideo = () => {
    if (!selectedVideo) return;
    
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    setSelectedVideo(videos[prevIndex]);
  };

  const handleAddToPlaylist = (videoId: string) => {
    console.log(`Added video ${videoId} to playlist`);
    // In a real app, this would add the video to a playlist
  };

  const handleDeleteVideo = (videoId: string) => {
    console.log(`Deleted video ${videoId}`);
    // In a real app, this would remove the video from history/playlist
  };

  const handleLoadRecommendedVideo = (video: any) => {
    setSelectedVideo(video);
  };

  const handleSubscribe = (channel: string) => {
    if (subscribedChannels.includes(channel)) {
      setSubscribedChannels(subscribedChannels.filter(c => c !== channel));
    } else {
      setSubscribedChannels([...subscribedChannels, channel]);
      // Enable notifications by default when subscribing
      setChannelNotifications(prev => ({ ...prev, [channel]: true }));
    }
  };

  const toggleChannelNotifications = (channel: string) => {
    setChannelNotifications(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
  };

  // Messaging functions
  const sendMessage = (recipientId: string, text: string) => {
    if (!text.trim()) return;
    
    const recipient = demoUsers.find(user => user.id === recipientId);
    if (!recipient) return;
    
    const newMessageObj: Message = {
      id: Date.now().toString(),
      sender: user?.username || 'You',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      recipientId: recipientId
    };
    
    setMessages([...messages, newMessageObj]);
    setNewMessage({...newMessage, [recipientId]: ''});
  };

  // Get messages for a specific conversation
  const getConversationMessages = (userId: string) => {
    const currentUser = user?.username || 'You';
    const recipient = demoUsers.find(user => user.id === userId)?.name || 'Unknown';
    
    // Filter messages between current user and the recipient
    return messages.filter(msg => 
      (msg.sender === currentUser && msg.recipientId === userId) ||
      (msg.sender === recipient && msg.recipientId === undefined) ||
      (msg.sender === recipient && msg.recipientId === 'self')
    );
  };

  const openMessageWindow = (userId: string) => {
    if (!openMessageWindows.includes(userId)) {
      setOpenMessageWindows([...openMessageWindows, userId]);
    }
  };

  const closeMessageWindow = (userId: string) => {
    setOpenMessageWindows(openMessageWindows.filter(id => id !== userId));
  };

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
    setUnreadMessages(messages.filter(msg => !msg.read).length - 1);
  };

  const handleNewMessageChange = (userId: string, text: string) => {
    setNewMessage({...newMessage, [userId]: text});
  };

  const handleDownloadVideo = (videoId: string) => {
    // Add video to downloaded videos list
    if (!downloadedVideos.includes(videoId)) {
      setDownloadedVideos([...downloadedVideos, videoId]);
      console.log(`Video ${videoId} added to downloads`);
    }
  };

  const handleAddToWatchLater = (videoId: string) => {
    console.log(`Adding video ${videoId} to watch later`);
    // In a real app, this would add the video to the user's watch later list
    alert(`Video added to Watch Later`);
  };

  // Add user video/short functionality
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isShortUpload, setIsShortUpload] = useState(false);

  const handleUploadVideo = (title: string, isShort: boolean = false) => {
    const newVideo: Video = {
      id: `user-${Date.now()}`,
      title,
      channel: user?.username || 'Your Channel',
      views: '0',
      timestamp: 'Just now',
      duration: isShort ? '0:15' : '0:30', // Set correct durations: 15s for shorts, 30s for regular videos
      thumbnail: isShort ? 'shorts' : 'user'
    };

    if (isShort) {
      setUserShorts([...userShorts, newVideo]);
    } else {
      setUserVideos([...userVideos, newVideo]);
    }
    
    // Close modal and reset form
    setIsUploadModalOpen(false);
    setUploadTitle('');
    setIsShortUpload(false);
  };

  // Function to generate a random video with specified duration
  const generateRandomVideo = (duration: string, idPrefix: string = 'gen'): Video => {
    const titles = [
      'Amazing New Song Release', 'Gaming Tutorial Session', 'Cooking Delicious Meal', 
      'Travel Vlog Adventure', 'Tech Review Latest Gadgets', 'Fitness Workout Routine',
      'Comedy Sketch Performance', 'Educational Lecture Series', 'Art Creation Time-lapse',
      'Music Cover Performance', 'DIY Home Improvement', 'Pet Fun Moments',
      'Science Experiment Demo', 'Book Review Discussion', 'Fashion Lookbook',
      'Car Modification Showcase', 'Garden Care Tips', 'Photography Techniques',
      'Dance Performance Video', 'Interview with Celebrity', 'Tu han Kahan', '12 Bande', 'Apa Fer Milaange'
    ];
    
    const channels = [
      'Popular Creator', 'Gaming Master', 'Music Channel', 'Cooking Expert',
      'Travel Guide', 'Tech Reviews', 'Comedy Central', 'Education Hub',
      'Art Studio', 'Fitness Guru', 'DIY Crafts', 'Pet Lovers',
      'Science World', 'Book Club', 'Fashion Trends',
      'Auto Enthusiasts', 'Garden Tips', 'Photo Pro', 'Dance Academy',
      'Celebrity Talk', 'Rauf & Faik', 'Divine', 'Nawazishein'
    ];
    
    const thumbnails = ['music', 'gaming', 'tech', 'cooking', 'travel', 'fitness', 'comedy'];
    
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomChannel = channels[Math.floor(Math.random() * channels.length)];
    const randomThumbnail = thumbnails[Math.floor(Math.random() * thumbnails.length)];
    
    // Generate random views (1K to 10M)
    const viewsNum = Math.floor(Math.random() * 10000000) + 1000;
    const views = viewsNum >= 1000000 
      ? `${(viewsNum / 1000000).toFixed(1)}M` 
      : viewsNum >= 1000 
        ? `${(viewsNum / 1000).toFixed(1)}K` 
        : `${viewsNum}`;
    
    // Generate random timestamp (1 minute to 2 years ago)
    const timeUnits = [
      { value: 60, label: 'seconds' },
      { value: 3600, label: 'hours' },
      { value: 86400, label: 'days' },
      { value: 604800, label: 'weeks' },
      { value: 2592000, label: 'months' },
      { value: 31536000, label: 'years' }
    ];
    
    const randomUnit = timeUnits[Math.floor(Math.random() * timeUnits.length)];
    const randomValue = Math.floor(Math.random() * 2) + 1; // 1-2 units
    const timestamp = `${randomValue} ${randomUnit.label === 'seconds' || randomUnit.label === 'hours' || randomUnit.label === 'days' ? randomUnit.label.slice(0, -1) : randomUnit.label} ago`;
    
    return {
      id: `${idPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: randomTitle,
      channel: randomChannel,
      views: views,
      timestamp: timestamp,
      duration: duration,
      thumbnail: randomThumbnail
    };
  };

  // Filter videos based on current view
  const getFilteredVideos = () => {
    switch(currentView) {
      case 'history':
        return historyVideos;
      case 'subscriptions':
        // Show videos from subscribed channels
        return videos.filter(v => subscribedChannels.includes(v.channel));
      case 'playlists':
        // In a real app, this would be based on user's playlists
        return videos.slice(2, 8);
      case 'liked':
        // For demo, return videos with "Liked" in title or a few sample videos
        return videos.filter(v => v.title.includes('Liked') || ['Tu Hai Kahan', '12 Bande'].includes(v.title));
      case 'watchlater':
        // For demo, return videos with "Watch Later" in title or a few sample videos
        return videos.filter(v => v.title.includes('Watch Later') || ['Murder', 'Apa Fer Milaange'].includes(v.title));
      case 'yourvideos':
        // Show user's uploaded videos
        return [...userVideos, ...videos.slice(8, 12)];
      case 'downloads':
        // Return downloaded videos
        return videos.filter(v => downloadedVideos.includes(v.id));
      case 'gaming':
        return videos.filter(v => v.channel.includes('Gaming') || v.channel.includes('Game') || v.title.includes('GTA') || v.title.includes('Red Dead') || v.title.includes('Minecraft'));
      case 'music':
        return videos.filter(v => v.thumbnail === 'music' || v.title.includes('Tu han Kahan') || v.title.includes('12 Bande') || v.title.includes('Apa Fer Milaange'));
      case 'shorts':
        // Generate 10 new random videos with 15s duration for shorts
        const newShorts = [];
        for (let i = 0; i < 10; i++) {
          newShorts.push(generateRandomVideo('0:15', 'short'));
        }
        return newShorts;
      case 'trending':
        // Generate 10 new random videos with 15s duration for trending
        const newTrending = [];
        for (let i = 0; i < 10; i++) {
          newTrending.push(generateRandomVideo('0:15', 'trend'));
        }
        return newTrending;
      default:
        // Home page: Generate 15 new random videos with 30s duration
        const newHomeVideos = [];
        for (let i = 0; i < 15; i++) {
          newHomeVideos.push(generateRandomVideo('0:30', 'home'));
        }
        // Also include user videos
        return [...userVideos, ...newHomeVideos];
    }
  };

  // Video data including the requested content
  const videos: Video[] = [
    // Music content
    {
      id: '1',
      title: 'Tu Hai Kahan',
      channel: 'Krishna Patil Rajput',
      views: '150M',
      timestamp: '1 year ago',
      duration: '4:20',
      thumbnail: 'music'
    },
    {
      id: '2',
      title: 'Tu han Kahan',
      channel: 'Atharva Patil Rajput',
      views: '150M',
      timestamp: '1 year ago',
      duration: '4:20',
      thumbnail: 'music'
    },
    {
      id: '3',
      title: '12 Bande',
      channel: 'Ankush Khakale',
      views: '85M',
      timestamp: '2 years ago',
      duration: '3:45',
      thumbnail: 'music'
    },
    {
      id: '4',
      title: 'Murder',
      channel: 'Mahesh Vispute',
      views: '200M',
      timestamp: '6 months ago',
      duration: '5:15',
      thumbnail: 'music'
    },
    {
      id: '5',
      title: 'Apa Fer Milaange',
      channel: 'Krishna Patil Rajput',
      views: '120M',
      timestamp: '3 months ago',
      duration: '4:10',
      thumbnail: 'music'
    },
    // Gaming content
    {
      id: '6',
      title: 'Minecraft Survival House Build Tutorial',
      channel: 'Atharva Patil Rajput',
      views: '12M',
      timestamp: '2 weeks ago',
      duration: '15:32',
      thumbnail: 'gaming'
    },
    {
      id: '7',
      title: 'GTA 5 Funny Moments Compilation',
      channel: 'Ankush Khakale',
      views: '45M',
      timestamp: '1 month ago',
      duration: '22:18',
      thumbnail: 'gaming'
    },
    {
      id: '8',
      title: 'Red Dead Redemption 1 - Epic Story Finale',
      channel: 'Mahesh Vispute',
      views: '8M',
      timestamp: '3 months ago',
      duration: '18:45',
      thumbnail: 'gaming'
    },
    {
      id: '9',
      title: 'Red Dead Redemption 2 - Best Hunting Locations',
      channel: 'Krishna Patil Rajput',
      views: '15M',
      timestamp: '5 months ago',
      duration: '12:30',
      thumbnail: 'gaming'
    },
    // Tech tutorials
    {
      id: '10',
      title: 'Building a YouTube Clone with React and Node.js',
      channel: 'Atharva Patil Rajput',
      views: '1.2M',
      timestamp: '2 days ago',
      duration: '10:25',
      thumbnail: 'tech'
    },
    {
      id: '11',
      title: 'Learn TypeScript in 1 Hour - Beginners Tutorial',
      channel: 'Ankush Khakale',
      views: '850K',
      timestamp: '1 week ago',
      duration: '15:42',
      thumbnail: 'coding'
    },
    // Shorts content
    {
      id: '12',
      title: 'Quick JavaScript Tip - Array Destructuring',
      channel: 'Mahesh Vispute',
      views: '2.3M',
      timestamp: '4 days ago',
      duration: '0:58',
      thumbnail: 'shorts'
    },
    {
      id: '13',
      title: 'Cooking Hack - 5 Minute Pasta',
      channel: 'Krishna Patil Rajput',
      views: '5.7M',
      timestamp: '1 week ago',
      duration: '0:42',
      thumbnail: 'shorts'
    },
    {
      id: '14',
      title: 'Fitness Motivation in 60 Seconds',
      channel: 'Atharva Patil Rajput',
      views: '3.2M',
      timestamp: '3 days ago',
      duration: '1:00',
      thumbnail: 'shorts'
    },
    {
      id: '15',
      title: 'Funny Cat Compilation #42',
      channel: 'Ankush Khakale',
      views: '18M',
      timestamp: '2 weeks ago',
      duration: '0:55',
      thumbnail: 'shorts'
    }
  ];

  const filteredVideos = getFilteredVideos();

  const handleSendFeedback = () => {
    if (feedbackText.trim()) {
      // In a real app, this would send the feedback to a server
      console.log('Feedback submitted:', {
        category: feedbackCategory,
        text: feedbackText,
        user: user?.username || 'Anonymous'
      });
      
      setFeedbackSubmitted(true);
      setFeedbackText('');
      setFeedbackCategory('general');
      
      // Reset the submission status after 3 seconds
      setTimeout(() => {
        setFeedbackSubmitted(false);
      }, 3000);
    }
  };

  // Advanced settings toggle functions
  const toggleAutoplay = () => {
    setAutoplayEnabled(!autoplayEnabled);
    // In a real app, this would save to user preferences
    console.log('Autoplay setting:', !autoplayEnabled);
  };

  const togglePauseOnScroll = () => {
    setPauseOnScroll(!pauseOnScroll);
    // In a real app, this would save to user preferences
    console.log('Pause on scroll setting:', !pauseOnScroll);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real app, this would save to user preferences
    console.log('Notifications setting:', !notificationsEnabled);
  };

  const toggleDataSaver = () => {
    setDataSaverMode(!dataSaverMode);
    // In a real app, this would save to user preferences
    console.log('Data saver setting:', !dataSaverMode);
  };

  const toggleRestrictedMode = () => {
    setRestrictedMode(!restrictedMode);
    // In a real app, this would save to user preferences
    console.log('Restricted mode setting:', !restrictedMode);
  };

  const handleLanguageChange = (language: string) => {
    setLanguagePreference(language);
    // In a real app, this would save to user preferences and potentially reload content
    console.log('Language preference changed to:', language);
  };

  // Peer chat functions
  const openPeerChatWindow = (userId: string) => {
    if (!peerChatWindows.includes(userId)) {
      // Initialize peer messages for this user if not exists
      if (!peerMessages[userId]) {
        setPeerMessages(prev => ({
          ...prev,
          [userId]: [
            { text: 'Peer chat session started', sender: '', type: 'system' }
          ]
        }));
      }
      
      // Generate a peer ID for this user if not exists
      if (!peerIds[userId]) {
        const newPeerId = `peer_${userId}_${Date.now()}`;
        setPeerIds(prev => ({
          ...prev,
          [userId]: newPeerId
        }));
      }
      
      setPeerChatWindows([...peerChatWindows, userId]);
    }
  };

  const closePeerChatWindow = (userId: string) => {
    setPeerChatWindows(peerChatWindows.filter(id => id !== userId));
  };

  const sendPeerMessage = (userId: string, message: string) => {
    const currentUser = user?.username || 'You';
    
    setPeerMessages(prev => ({
      ...prev,
      [userId]: [
        ...prev[userId],
        { text: message, sender: currentUser, type: 'message' }
      ]
    }));
  };

  const handlePeerMessageReceived = (userId: string, message: string) => {
    const sender = demoUsers.find(u => u.id === userId)?.name || 'Unknown';
    
    setPeerMessages(prev => ({
      ...prev,
      [userId]: [
        ...prev[userId],
        { text: message, sender, type: 'message' }
      ]
    }));
  };

  // Search function
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    // Combine all videos including user videos for search
    const allVideos = [...videos, ...userVideos, ...userShorts];
    
    // Filter videos by title (case insensitive)
    const results = allVideos.filter(video => 
      video.title.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
  };

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by input change, but we can add additional logic here if needed
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="App-header">
        <div className="header-left">
          <div className="menu-icon" onClick={toggleSidebar}>☰</div>
          <div className="logo" onClick={goToHome}>
            <span>You</span><span>Tube</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="search-bar">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search" 
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
            <button className="search-button" onClick={handleSearchSubmit}>🔍</button>
          </div>
          <button className="voice-search">🎤</button>
        </div>
        
        <div className="header-right">
          <button className="icon-button">🎥</button>
          <button className="icon-button">🔔</button>
          <button className="icon-button" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <div className="user-avatar" onClick={toggleUserMenu}>
            {isAuthenticated ? user?.username.charAt(0) : 'U'}
          </div>
          
          {isUserMenuOpen && (
            <div className="user-menu">
              <div className="user-menu-item">
                <div className="user-info">
                  <div className="user-avatar-small">
                    {isAuthenticated ? user?.username.charAt(0) : 'U'}
                  </div>
                  <div className="user-name">
                    {isAuthenticated ? user?.username : 'Guest'}
                  </div>
                </div>
              </div>
              <div className="user-menu-divider"></div>
              <div className="user-menu-item" onClick={() => setIsUploadModalOpen(true)}>
                Upload video
              </div>
              <div className="user-menu-item" onClick={handleLogout}>
                Sign out
              </div>
            </div>
          )}
          
          {/* Upload Modal */}
          {isUploadModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="close-button" onClick={() => setIsUploadModalOpen(false)}>×</button>
                <h2>Upload Video</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (uploadTitle.trim()) {
                    handleUploadVideo(uploadTitle, isShortUpload);
                  }
                }}>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Video title"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={isShortUpload}
                        onChange={(e) => setIsShortUpload(e.target.checked)}
                      />
                      Upload as Short (15 seconds)
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Upload
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      
      {isAuthenticated ? (
        <>
          {/* Sidebar */}
          <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div 
              className={`sidebar-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={goToHome}
            >
              <div className="sidebar-icon">🏠</div>
              <div className="sidebar-text">Home</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'trending' ? 'active' : ''}`}
              onClick={() => setCurrentView('trending')}
            >
              <div className="sidebar-icon">🔥</div>
              <div className="sidebar-text">Trending</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'shorts' ? 'active' : ''}`}
              onClick={() => setCurrentView('shorts')}
            >
              <div className="sidebar-icon">⏱️</div>
              <div className="sidebar-text">Shorts</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setCurrentView('subscriptions')}
            >
              <div className="sidebar-icon">📺</div>
              <div className="sidebar-text">Subscriptions</div>
            </div>
            
            <div className="sidebar-divider"></div>
            
            <div className="sidebar-item">
              <div className="sidebar-icon">📚</div>
              <div className="sidebar-text">Library</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'history' ? 'active' : ''}`}
              onClick={() => setCurrentView('history')}
            >
              <div className="sidebar-icon">🕒</div>
              <div className="sidebar-text">History</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'liked' ? 'active' : ''}`}
              onClick={() => setCurrentView('liked')}
            >
              <div className="sidebar-icon">👍</div>
              <div className="sidebar-text">Liked videos</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'watchlater' ? 'active' : ''}`}
              onClick={() => setCurrentView('watchlater')}
            >
              <div className="sidebar-icon">⏱️</div>
              <div className="sidebar-text">Watch later</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'yourvideos' ? 'active' : ''}`}
              onClick={() => setCurrentView('yourvideos')}
            >
              <div className="sidebar-icon">🎥</div>
              <div className="sidebar-text">Your videos</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'downloads' ? 'active' : ''}`}
              onClick={() => setCurrentView('downloads')}
            >
              <div className="sidebar-icon">⬇️</div>
              <div className="sidebar-text">Downloads</div>
            </div>
            
            <div className="sidebar-divider"></div>
            
            <div className="sidebar-section-title">Explore</div>
            <div 
              className={`sidebar-item ${currentView === 'gaming' ? 'active' : ''}`}
              onClick={() => setCurrentView('gaming')}
            >
              <div className="sidebar-icon">🎮</div>
              <div className="sidebar-text">Gaming</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'music' ? 'active' : ''}`}
              onClick={() => setCurrentView('music')}
            >
              <div className="sidebar-icon">🎵</div>
              <div className="sidebar-text">Music</div>
            </div>
            
            <div className="sidebar-divider"></div>
            
            <div className="sidebar-item" onClick={() => setShowAboutUs(true)}>
              <div className="sidebar-icon">ℹ️</div>
              <div className="sidebar-text">About us</div>
            </div>
            <div className="sidebar-item" onClick={() => setShowSettings(true)}>
              <div className="sidebar-icon">⚙️</div>
              <div className="sidebar-text">Settings</div>
            </div>
            <div className="sidebar-item" onClick={() => setShowHelp(true)}>
              <div className="sidebar-icon">❓</div>
              <div className="sidebar-text">Help</div>
            </div>
            <div className="sidebar-item" onClick={() => setCurrentView('feedback')}>
              <div className="sidebar-icon">💬</div>
              <div className="sidebar-text">Send feedback</div>
            </div>
            <div className="sidebar-item" onClick={() => setCurrentView('copyright')}>
              <div className="sidebar-icon">©️</div>
              <div className="sidebar-text">Copyright</div>
            </div>

          </div>
          
          {/* Content Area */}
          <div className={`content ${isSidebarOpen ? '' : 'content-expanded'}`}>
            <h1 className="page-title">
              {currentView === 'home' && 'Recommended'}
              {currentView === 'trending' && 'Trending'}
              {currentView === 'history' && 'Watch history'}
              {currentView === 'subscriptions' && 'Subscriptions'}
              {currentView === 'playlists' && 'Playlists'}
              {currentView === 'liked' && 'Liked videos'}
              {currentView === 'watchlater' && 'Watch later'}
              {currentView === 'yourvideos' && 'Your videos'}
              {currentView === 'downloads' && 'Downloads'}
              {currentView === 'gaming' && 'Gaming'}
              {currentView === 'music' && 'Music'}
              {currentView === 'shorts' && 'Shorts'}
              {currentView === 'feedback' && 'Send Feedback'}
              {currentView === 'copyright' && 'Copyright Information'}
            </h1>
            
            <div className="video-grid">
              {currentView === 'feedback' ? (
                <div className="feedback-page">
                  <div className="feedback-form-container">
                    <div className="feedback-header">
                      <h2>Send Feedback</h2>
                      <button className="close-button" onClick={() => setCurrentView('home')}>×</button>
                    </div>
                    <p>We'd love to hear your thoughts! Please share your feedback with us.</p>
                    <div className="feedback-category">
                      <label htmlFor="feedback-category">Category:</label>
                      <select 
                        id="feedback-category"
                        className="feedback-category-select"
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value)}
                      >
                        <option value="general">General Feedback</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="ui">UI/UX Suggestion</option>
                        <option value="performance">Performance Issue</option>
                        <option value="accessibility">Accessibility Issue</option>
                        <option value="content">Content Related</option>
                        <option value="account">Account Issue</option>
                        <option value="security">Security Concern</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <textarea 
                      className="feedback-input" 
                      placeholder="Describe your issue or suggestion..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                    <div className="feedback-actions">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setCurrentView('home')}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={handleSendFeedback}
                        disabled={!feedbackText.trim()}
                      >
                        Submit Feedback
                      </button>
                    </div>
                    {feedbackSubmitted && <p className="feedback-submitted">Thank you for your feedback!</p>}
                  </div>
                </div>
              ) : currentView === 'copyright' ? (
                <div className="copyright-page">
                  <div className="copyright-content">
                    <h2>Copyright Information</h2>
                    <div className="copyright-section">
                      <h3>General Copyright Notice</h3>
                      <p>
                        All content provided on this platform is protected by copyright laws. 
                        Unauthorized reproduction, distribution, or transmission of any content 
                        without prior written permission is strictly prohibited.
                      </p>
                    </div>
                    
                    <div className="copyright-section">
                      <h3>Specific Content Rights</h3>
                      <div className="copyright-item">
                        <h4>YouTube Content</h4>
                        <p>
                          YouTube and all related logos, trademarks, and content are the property 
                          of Google LLC. This is a demonstration application and not affiliated 
                          with YouTube or Google.
                        </p>
                      </div>
                      
                      <div className="copyright-item">
                        <h4>Music Copyright - 12 Bande</h4>
                        <p>
                          The song "12 Bande" is copyrighted material owned by Divine. 
                          All rights reserved. This content is used for demonstration purposes only.
                        </p>
                      </div>
                      
                      <div className="copyright-item">
                        <h4>Music Copyright - Tu Hai Kahan</h4>
                        <p>
                          The song "Tu Hai Kahan" is copyrighted material owned by Rauf & Faik. 
                          All rights reserved. This content is used for demonstration purposes only.
                        </p>
                      </div>
                      
                      <div className="copyright-item">
                        <h4>Music Copyright - Apa Fer Milaange</h4>
                        <p>
                          The song "Apa Fer Milaange" is copyrighted material owned by Nawazishein. 
                          All rights reserved. This content is used for demonstration purposes only.
                        </p>
                      </div>
                    </div>
                    
                    <div className="copyright-section">
                      <h3>Disclaimer</h3>
                      <p>
                        All Music and Videos shown in this demo are the property of their respective copyright owners. 
                        This project only displays embedded content from YouTube for educational and demonstration purposes.
                      </p>
                    </div>
                    
                    <div className="copyright-section">
                      <h3>Fair Use Disclaimer</h3>
                      <p>
                        This application is created for educational and demonstration purposes only. 
                        All media content used is for illustrative purposes and falls under fair use 
                        provisions of copyright law.
                      </p>
                    </div>
                    
                    <div className="copyright-footer">
                      <p>© 2025 YouTube Clone Demo. All rights reserved.</p>
                    </div>
                  </div>
                </div>
              ) : searchQuery.trim() !== '' ? (
                // Display search results when search query is not empty
                searchResults.length > 0 ? (
                  searchResults.map(video => (
                    <div className="video-card" key={video.id} onClick={() => selectVideo(video)}>
                      <div className="thumbnail-container">
                        <div className="thumbnail">
                          <div className="thumbnail-name">{video.channel}</div>
                          <div className="duration">{video.duration}</div>
                        </div>
                        {/* Simplified 3-dot menu for video grid - only remove option */}
                        <VideoMenu 
                          onAddToPlaylist={() => handleAddToPlaylist(video.id)}
                          onDelete={() => handleDeleteVideo(video.id)}
                          videoTitle={video.title}
                          videoId={video.id}
                          onDownload={handleDownloadVideo}
                          showFullMenu={false} // Simplified menu for grid
                        />
                      </div>
                      <div className="video-info">
                        <div 
                          className="channel-avatar" 
                          onClick={(e) => e.stopPropagation()}
                        ></div>
                        <div className="video-details">
                          <div className="video-title">{video.title}</div>
                          <div className="channel-name">{video.channel}</div>
                          <div className="video-meta">{video.views} views • {video.timestamp}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <h3>No videos found</h3>
                    <p>Try different search terms</p>
                  </div>
                )
              ) : (
                filteredVideos.map(video => (
                  <div className="video-card" key={video.id} onClick={() => selectVideo(video)}>
                    <div className="thumbnail-container">
                      <div className="thumbnail">
                        <div className="thumbnail-name">{video.channel}</div>
                        <div className="duration">{video.duration}</div>
                      </div>
                      {/* Simplified 3-dot menu for video grid - only remove option */}
                      <VideoMenu 
                        onAddToPlaylist={() => handleAddToPlaylist(video.id)}
                        onDelete={() => handleDeleteVideo(video.id)}
                        videoTitle={video.title}
                        videoId={video.id}
                        onDownload={handleDownloadVideo}
                        showFullMenu={false} // Simplified menu for grid
                      />
                    </div>
                    <div className="video-info">
                      <div 
                        className="channel-avatar" 
                        onClick={(e) => e.stopPropagation()}
                      ></div>
                      <div className="video-details">
                        <div className="video-title">{video.title}</div>
                        <div className="channel-name">{video.channel}</div>
                        <div className="video-meta">{video.views} views • {video.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
      
          {/* Video Player Modal */}
          {selectedVideo && !isPlayerMinimized && (
            <VideoPlayer 
              video={selectedVideo}
              videos={videos}
              onNext={playNextVideo}
              onPrevious={playPreviousVideo}
              onClose={closeVideoPlayer}
              onMinimize={minimizeVideoPlayer}
              onAddToPlaylist={handleAddToPlaylist}
              onDeleteVideo={handleDeleteVideo}
              onLoadRecommendedVideo={handleLoadRecommendedVideo}
              onSubscribe={handleSubscribe}
              isSubscribed={subscribedChannels.includes(selectedVideo.channel)}
              notificationsEnabled={channelNotifications[selectedVideo.channel] ?? true}
              onToggleNotifications={() => toggleChannelNotifications(selectedVideo.channel)}
              onDownload={handleDownloadVideo}
              onAddToWatchLater={handleAddToWatchLater} // Add watch later handler
            />
          )}
      
          {/* Minimized Video Player */}
          {selectedVideo && isPlayerMinimized && (
            <div className="minimized-player" onClick={() => setIsPlayerMinimized(false)}>
              <div className="minimized-player-content">
                <div className="minimized-video-info">
                  <span className="minimized-video-title">{selectedVideo.title}</span>
                </div>
                <div className="minimized-player-controls">
                  <button className="minimized-control-button" onClick={(e) => {
                    e.stopPropagation();
                    playPreviousVideo();
                  }}>⏮</button>
                  <button className="minimized-control-button play-pause" onClick={(e) => {
                    e.stopPropagation();
                    // Toggle play logic would go here
                  }}>
                    ▶
                  </button>
                  <button className="minimized-control-button" onClick={(e) => {
                    e.stopPropagation();
                    playNextVideo();
                  }}>⏭</button>
                  <button className="minimized-close-button" onClick={(e) => {
                    e.stopPropagation();
                    closeVideoPlayer();
                  }}>×</button>
                </div>
              </div>
            </div>
          )}
      

          {/* About Us Modal */}
          {showAboutUs && (
            <div className="about-us-modal">
              <div className="about-us-content">
                <div className="about-us-header">
                  <h2>About Us</h2>
                  <button className="about-us-close" onClick={() => setShowAboutUs(false)}>×</button>
                </div>
                <div className="team-members">
                  {teamMembers.map(member => {
                    // Find the corresponding demo user
                    const demoUser = demoUsers.find(user => user.name === member.name);
                    const userId = demoUser?.id || member.id;
                    
                    return (
                      <div className="team-member" key={member.id}>
                        <div className="member-avatar">{member.name.charAt(0)}</div>
                        <div className="member-name">{member.name}</div>
                        <div className="member-role">{member.role}</div>
                        <div className="member-description">{member.description}</div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                          <button 
                            className="btn btn-primary"
                            onClick={() => openMessageWindow(userId)}
                          >
                            Message
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => openPeerChatWindow(userId)}
                          >
                            Peer Chat
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
      
          {/* Chat Icon */}
          {isAuthenticated && (
            <div 
              className="chat-icon"
              onClick={() => openMessageWindow('general')}
            >
              💬{" "}
              {unreadMessages > 0 && (
                <div className="unread-indicator">{unreadMessages}</div>
              )}
            </div>
          )}

          {/* Message Windows */}
          {isAuthenticated && openMessageWindows.map(windowId => {
            const recipient = demoUsers.find(user => user.id === windowId) || 
                             { id: 'general', name: 'Team Chat' };
            const userMessages = getConversationMessages(windowId);
            
            return (
              <div className="messages-container" key={windowId}>
                <div className="message-window">
                  <div className="message-header">
                    <h3>{recipient.name}</h3>
                    <button 
                      className="close-message-window" 
                      onClick={() => closeMessageWindow(windowId)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="messages-list">
                    {userMessages.map(message => (
                      <div 
                        className={`message-item ${message.sender === user?.username ? 'own-message' : ''}`} 
                        key={message.id}
                        onClick={() => markAsRead(message.id)}
                      >
                        <div className="message-sender">{message.sender}</div>
                        <div className="message-text">{message.text}</div>
                        <div className="message-time">{message.timestamp}</div>
                      </div>
                    ))}
                  </div>
                  <div className="message-input-container">
                    <input 
                      type="text" 
                      className="message-input" 
                      placeholder="Type a message..."
                      value={newMessage[windowId] || ''}
                      onChange={(e) => handleNewMessageChange(windowId, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage(windowId, newMessage[windowId] || '');
                        }
                      }}
                    />
                    <button 
                      className="message-send-button"
                      onClick={() => sendMessage(windowId, newMessage[windowId] || '')}
                    >
                      Send
                    </button>
                    {/* Add Peer Chat button */}
                    {recipient.id !== 'general' && (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => openPeerChatWindow(windowId)}
                        style={{ marginLeft: '10px' }}
                      >
                        Peer Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Peer Chat Windows */}
          {isAuthenticated && peerChatWindows.map(windowId => {
            const recipient = demoUsers.find(user => user.id === windowId);
            if (!recipient) return null;
            
            return (
              <PeerChat
                key={`peer-${windowId}`}
                peerId={peerIds[windowId] || 'unknown'}
                onClose={() => closePeerChatWindow(windowId)}
                onSendMessage={(message) => sendPeerMessage(windowId, message)}
                messages={peerMessages[windowId] || []}
              />
            );
          })}

          {/* Settings Modal */}
          {showSettings && (
            <div className="modal-overlay">
              <div className="modal-content settings-modal">
                <div className="modal-header">
                  <h2>Settings</h2>
                  <button className="close-button" onClick={() => setShowSettings(false)}>×</button>
                </div>
                <div className="settings-tabs">
                  <button 
                    className={`tab-button ${activeSettingTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveSettingTab('general')}
                  >
                    General
                  </button>
                  <button 
                    className={`tab-button ${activeSettingTab === 'playback' ? 'active' : ''}`}
                    onClick={() => setActiveSettingTab('playback')}
                  >
                    Playback
                  </button>
                  <button 
                    className={`tab-button ${activeSettingTab === 'data' ? 'active' : ''}`}
                    onClick={() => setActiveSettingTab('data')}
                  >
                    Data
                  </button>
                  <button 
                    className={`tab-button ${activeSettingTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveSettingTab('notifications')}
                  >
                    Notifications
                  </button>
                  <button 
                    className={`tab-button ${activeSettingTab === 'peer' ? 'active' : ''}`}
                    onClick={() => setActiveSettingTab('peer')}
                  >
                    Peer
                  </button>
                </div>
                <div className="settings-content">
                  {/* General Settings */}
                  {activeSettingTab === 'general' && (
                    <div className="settings-section">
                      <h3>Appearance</h3>
                      <div className="setting-item">
                        <span>Dark theme</span>
                        <button 
                          className={`toggle-button ${theme === 'dark' ? 'on' : 'off'}`}
                          onClick={toggleTheme}
                        >
                          {theme === 'dark' ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <div className="setting-item">
                        <span>Language</span>
                        <select 
                          className="settings-select"
                          value={languagePreference}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="ja">Japanese</option>
                          <option value="ko">Korean</option>
                          <option value="zh">Chinese</option>
                          <option value="hi">Hindi</option>
                          <option value="ru">Russian</option>
                          <option value="ar">Arabic</option>
                          <option value="pt">Portuguese</option>
                          <option value="it">Italian</option>
                          <option value="nl">Dutch</option>
                          <option value="tr">Turkish</option>
                          <option value="pl">Polish</option>
                          <option value="sv">Swedish</option>
                          <option value="fi">Finnish</option>
                          <option value="da">Danish</option>
                          <option value="no">Norwegian</option>
                          <option value="cs">Czech</option>
                          <option value="sk">Slovak</option>
                          <option value="hu">Hungarian</option>
                          <option value="ro">Romanian</option>
                          <option value="bg">Bulgarian</option>
                          <option value="uk">Ukrainian</option>
                          <option value="el">Greek</option>
                          <option value="th">Thai</option>
                          <option value="vi">Vietnamese</option>
                          <option value="id">Indonesian</option>
                          <option value="ms">Malay</option>
                          <option value="fil">Filipino</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {/* Playback Settings */}
                  {activeSettingTab === 'playback' && (
                    <div className="settings-section">
                      <h3>Playback</h3>
                      <div className="setting-item">
                        <span>Autoplay next video</span>
                        <button 
                          className={`toggle-button ${autoplayEnabled ? 'on' : 'off'}`}
                          onClick={toggleAutoplay}
                        >
                          {autoplayEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <div className="setting-item">
                        <span>Pause when scrolling away</span>
                        <button 
                          className={`toggle-button ${pauseOnScroll ? 'on' : 'off'}`}
                          onClick={togglePauseOnScroll}
                        >
                          {pauseOnScroll ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <div className="setting-item">
                        <span>Default quality</span>
                        <select 
                          className="settings-select"
                          value={qualityPreference}
                          onChange={(e) => setQualityPreference(e.target.value)}
                        >
                          <option value="auto">Auto</option>
                          <option value="144p">144p</option>
                          <option value="240p">240p</option>
                          <option value="360p">360p</option>
                          <option value="480p">480p</option>
                          <option value="720p">720p</option>
                          <option value="1080p">1080p</option>
                          <option value="4K">4K</option>
                        </select>
                      </div>
                      <div className="setting-item">
                        <span>Subtitles</span>
                        <select 
                          className="settings-select"
                          value={subtitleLanguage}
                          onChange={(e) => setSubtitleLanguage(e.target.value)}
                        >
                          <option value="off">Off</option>
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="ja">Japanese</option>
                          <option value="ko">Korean</option>
                          <option value="zh">Chinese</option>
                          <option value="hi">Hindi</option>
                          <option value="ru">Russian</option>
                          <option value="ar">Arabic</option>
                          <option value="pt">Portuguese</option>
                          <option value="it">Italian</option>
                          <option value="nl">Dutch</option>
                          <option value="tr">Turkish</option>
                          <option value="pl">Polish</option>
                          <option value="sv">Swedish</option>
                          <option value="fi">Finnish</option>
                          <option value="da">Danish</option>
                          <option value="no">Norwegian</option>
                          <option value="cs">Czech</option>
                          <option value="sk">Slovak</option>
                          <option value="hu">Hungarian</option>
                          <option value="ro">Romanian</option>
                          <option value="bg">Bulgarian</option>
                          <option value="uk">Ukrainian</option>
                          <option value="el">Greek</option>
                          <option value="th">Thai</option>
                          <option value="vi">Vietnamese</option>
                          <option value="id">Indonesian</option>
                          <option value="ms">Malay</option>
                          <option value="fil">Filipino</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {/* Data Settings */}
                  {activeSettingTab === 'data' && (
                    <div className="settings-section">
                      <h3>Data</h3>
                      <div className="setting-item">
                        <span>Data Saver mode</span>
                        <button 
                          className={`toggle-button ${dataSaverMode ? 'on' : 'off'}`}
                          onClick={toggleDataSaver}
                        >
                          {dataSaverMode ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <div className="setting-item">
                        <span>Restricted mode</span>
                        <button 
                          className={`toggle-button ${restrictedMode ? 'on' : 'off'}`}
                          onClick={toggleRestrictedMode}
                        >
                          {restrictedMode ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <div className="setting-item">
                        <span>Clear search history</span>
                        <button className="btn-secondary" style={{padding: '6px 12px'}}>
                          Clear
                        </button>
                      </div>
                      <div className="setting-item">
                        <span>Clear watch history</span>
                        <button className="btn-secondary" style={{padding: '6px 12px'}}>
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Notification Settings */}
                  {activeSettingTab === 'notifications' && (
                    <div className="settings-section">
                      <h3>Notifications</h3>
                      <div className="setting-item">
                        <span>Enable notifications</span>
                        <button 
                          className={`toggle-button ${notificationsEnabled ? 'on' : 'off'}`}
                          onClick={toggleNotifications}
                        >
                          {notificationsEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <div className="setting-item">
                        <span>Email notifications</span>
                        <button className="toggle-button off">
                          OFF
                        </button>
                      </div>
                      <div className="setting-item">
                        <span>Push notifications</span>
                        <button className="toggle-button on">
                          ON
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Peer Settings */}
                  {activeSettingTab === 'peer' && (
                    <div className="settings-section">
                      <div className="virtual-study-group">
                        <h3 id="group-title">Welcome</h3>
                        <p id="group-subject"></p>
                        
                        <div className="share-link">
                          <p>Share this group link:</p>
                          <input 
                            type="text" 
                            id="share-url" 
                            readOnly 
                            value={`${window.location.origin}${window.location.pathname}?group=MyStudyGroup`}
                            className="share-url-input"
                          />
                        </div>
                        
                        <div className="chat-messages" id="chat-messages">
                          {peerMessages.general?.map((msg, index) => (
                            <div 
                              key={index} 
                              className={msg.type === 'system' ? 'system-message' : 'message'}
                            >
                              {msg.text}
                            </div>
                          )) || <div className="system-message">Welcome to the study group!</div>}
                        </div>
                        
                        <div className="controls">
                          <input 
                            type="text" 
                            id="message-input" 
                            placeholder="Type your message..." 
                            value={newMessage.peer || ''}
                            onChange={(e) => setNewMessage({...newMessage, peer: e.target.value})}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                sendMessage('peer', newMessage.peer || '');
                              }
                            }}
                          />
                          <button 
                            onClick={() => {
                              sendMessage('peer', newMessage.peer || '');
                            }}
                          >
                            Send
                          </button>
                          <button onClick={() => {
                            // Download chat functionality
                            const chatText = peerMessages.general?.map(msg => msg.text).join('\n') || '';
                            const blob = new Blob([chatText], { type: 'text/plain' });
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download = 'study_group_chat.txt';
                            link.click();
                          }}>
                            Download Chat
                          </button>
                          <button id="end-chat-btn" onClick={() => {
                            // End chat functionality
                          }}>
                            End Chat
                          </button>
                        </div>
                        
                        <div className="peer-section">
                          <p><strong>Your Peer ID:</strong> <span id="my-peer-id">
                            {user ? (() => {
                              const currentUser = demoUsers.find(u => u.name === user.username);
                              return currentUser && peerIds[currentUser.id] ? 
                                peerIds[currentUser.id] : 
                                'Generating...';
                            })() : 'Not available'}
                          </span></p>
                          <div className="controls">
                            <input 
                              type="text" 
                              id="peer-id-input" 
                              placeholder="Enter Peer ID to call or chat"
                              value={peerIdInput || ''}
                              onChange={(e) => setPeerIdInput(e.target.value)}
                            />
                            <button onClick={() => {
                              // Connect functionality
                              if (peerIdInput?.trim()) {
                                // Add connection logic here
                              }
                            }}>
                              Connect
                            </button>
                            <button id="end-call-btn" onClick={() => {
                              // End call functionality
                            }}>
                              End Call
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* Help Modal */}
          {showHelp && (
            <div className="modal-overlay">
              <div className="modal-content help-modal">
                <div className="modal-header">
                  <h2>Help</h2>
                  <button className="close-button" onClick={() => setShowHelp(false)}>×</button>
                </div>
                <div className="help-content">
                  <div className="help-section">
                    <h3>Getting Started</h3>
                    <p>Welcome to YouTube Clone! Here are some basic tips to get you started:</p>
                    <ul>
                      <li>Sign in to like videos, comment, and subscribe.</li>
                      <li>Explore the sidebar for different categories like Home, Trending, Shorts, Subscriptions, and more.</li>
                      <li>Click on a video to play it. Use the controls to pause, play, and navigate between videos.</li>
                      <li>Upload your own videos by clicking the upload button in the header.</li>
                    </ul>
                  </div>
                  
                  <div className="help-section">
                    <h3>Features</h3>
                    <ul>
                      <li><strong>Dark theme</strong>: Toggle the theme in the settings.</li>
                      <li><strong>Autoplay</strong>: Videos will automatically play the next one in the list.</li>
                      <li><strong>Notifications</strong>: Get notified about new videos from subscribed channels.</li>
                      <li><strong>Video quality</strong>: Adjust video quality in the player settings.</li>
                      <li><strong>Subtitles</strong>: Enable subtitles in multiple languages.</li>
                    </ul>
                  </div>
                  
                  <div className="help-section">
                    <h3>Navigation</h3>
                    <ul>
                      <li><strong>Sidebar</strong>: Use the hamburger menu to expand/collapse the sidebar.</li>
                      <li><strong>Tabs</strong>: Switch between different content categories using the sidebar tabs.</li>
                      <li><strong>Search</strong>: Use the search bar to find specific videos.</li>
                      <li><strong>User menu</strong>: Access your profile, settings, and sign out options.</li>
                    </ul>
                  </div>
                  
                  <div className="help-section">
                    <h3>Video Player</h3>
                    <ul>
                      <li><strong>Controls</strong>: Play/pause, volume, fullscreen, and more.</li>
                      <li><strong>Actions</strong>: Like, comment, and share videos.</li>
                      <li><strong>Settings</strong>: Access quality, subtitles, and download options via the 3-dot menu.</li>
                      <li><strong>Minimize</strong>: Minimize the player to continue browsing.</li>
                    </ul>
                  </div>
                  
                  <div className="help-section">
                    <h3>Feedback</h3>
                    <p>If you have any suggestions or encounter any issues, feel free to send feedback through the "Send feedback" option in the sidebar.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </>
      ) : (
        // Landing page for unauthenticated users
        <div className="landing-page">
          <div className="landing-content">
            <h1>Welcome to YouTube Clone</h1>
            <p>Sign in to like videos, comment, and subscribe.</p>
            <button className="btn btn-primary" onClick={openAuthModal}>
              Sign in / Register
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;