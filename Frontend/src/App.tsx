import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './Store/hooks';
import { logout } from './Store/slices/authSlice';
import AuthModal from './components/auth/AuthModal';
import VideoPlayer from './components/VideoPlayer';
import VideoMenu from './components/VideoMenu';
import PeerChat from './components/PeerChat';
import AdminPanel from './Pages/Admin/AdminPanel';
import VideoCardSkeleton from './components/common/VideoCard/VideoCardSkeleton';
import MobileMenu from './components/common/Sidebar/MobileMenu';
import MobileBottomNav from './components/common/MobileBottomNav';
import { useTheme } from './contexts/ThemeContext';
import axios from 'axios';
import './App.css';
import './enhanced-responsive.css'; // Import the enhanced responsive CSS
import './components/admin/admin.css'; // Import admin styles

// Define interfaces
interface Video {
  id: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  duration: string;
  thumbnail: string;
  description?: string;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Add this state for mobile menu
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
  
  // New state for trending and shorts videos
  const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
  const [shortsVideos, setShortsVideos] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingShorts, setLoadingShorts] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Search functionality
  const [searchResults, setSearchResults] = useState<Video[]>([]); // Search results
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); // Debounced search query
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]); // Search suggestions
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false); // Show/hide search suggestions
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

  // Debounce search queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim() !== '') {
      handleSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  // Fetch trending videos
  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        const response = await axios.get('/api/videos/trending');
        setTrendingVideos(response.data);
        setLoadingTrending(false);
      } catch (error) {
        console.error('Error fetching trending videos:', error);
        setLoadingTrending(false);
      }
    };

    fetchTrendingVideos();
  }, []);

  // Fetch shorts videos
  useEffect(() => {
    const fetchShortsVideos = async () => {
      try {
        const response = await axios.get('/api/videos/shorts');
        setShortsVideos(response.data);
        setLoadingShorts(false);
      } catch (error) {
        console.error('Error fetching shorts videos:', error);
        setLoadingShorts(false);
      }
    };

    fetchShortsVideos();
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

  // Add this function for mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadChannel, setUploadChannel] = useState('');
  const [isShortUpload, setIsShortUpload] = useState(false);



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
        // Return real shorts videos from backend
        return shortsVideos.map(video => ({
          id: video._id,
          title: video.title,
          channel: video.uploader?.username || 'Unknown Channel',
          views: `${video.views} views`,
          timestamp: 'Recently',
          duration: `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`,
          thumbnail: video.thumbnail
        }));
      case 'trending':
        // Return real trending videos from backend
        return trendingVideos.map(video => ({
          id: video._id,
          title: video.title,
          channel: video.uploader?.username || 'Unknown Channel',
          views: `${video.views} views`,
          timestamp: 'Recently',
          duration: `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`,
          thumbnail: video.thumbnail
        }));
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
      channel: 'Rauf & Faik',
      views: '150M',
      timestamp: '1 year ago',
      duration: '4:20',
      thumbnail: 'music'
    },
    {
      id: '2',
      title: 'Tu han Kahan',
      channel: 'Rauf & Faik',
      views: '150M',
      timestamp: '1 year ago',
      duration: '4:20',
      thumbnail: 'music'
    },
    {
      id: '3',
      title: '12 Bande',
      channel: 'Divine',
      views: '85M',
      timestamp: '2 years ago',
      duration: '3:45',
      thumbnail: 'music'
    },
    {
      id: '4',
      title: 'Murder',
      channel: 'Amit Trivedi',
      views: '200M',
      timestamp: '6 months ago',
      duration: '5:15',
      thumbnail: 'music'
    },
    {
      id: '5',
      title: 'Apa Fer Milaange',
      channel: 'Nawazishein',
      views: '120M',
      timestamp: '3 months ago',
      duration: '4:10',
      thumbnail: 'music'
    },
    // Gaming content
    {
      id: '6',
      title: 'Minecraft Survival House Build Tutorial',
      channel: 'GamingWithMark',
      views: '12M',
      timestamp: '2 weeks ago',
      duration: '15:32',
      thumbnail: 'gaming'
    },
    {
      id: '7',
      title: 'GTA 5 Funny Moments Compilation',
      channel: 'GameLaughs',
      views: '45M',
      timestamp: '1 month ago',
      duration: '22:18',
      thumbnail: 'gaming'
    },
    {
      id: '8',
      title: 'Red Dead Redemption 1 - Epic Story Finale',
      channel: 'WesternGamer',
      views: '8M',
      timestamp: '3 months ago',
      duration: '18:45',
      thumbnail: 'gaming'
    },
    {
      id: '9',
      title: 'Red Dead Redemption 2 - Best Hunting Locations',
      channel: 'WildWestAdventures',
      views: '15M',
      timestamp: '5 months ago',
      duration: '12:30',
      thumbnail: 'gaming'
    },
    // Tech tutorials
    {
      id: '10',
      title: 'Building a YouTube Clone with React and Node.js',
      channel: 'Tech Tutorials',
      views: '1.2M',
      timestamp: '2 days ago',
      duration: '10:25',
      thumbnail: 'tech'
    },
    {
      id: '11',
      title: 'Learn TypeScript in 1 Hour - Beginner\'s Tutorial',
      channel: 'Coding Master',
      views: '850K',
      timestamp: '1 week ago',
      duration: '15:42',
      thumbnail: 'coding'
    },
    // Shorts content
    {
      id: '12',
      title: 'Quick JavaScript Tip - Array Destructuring',
      channel: 'JS Shorts',
      views: '2.3M',
      timestamp: '4 days ago',
      duration: '0:58',
      thumbnail: 'shorts'
    },
    {
      id: '13',
      title: 'Cooking Hack - 5 Minute Pasta',
      channel: 'FoodieShorts',
      views: '5.7M',
      timestamp: '1 week ago',
      duration: '0:42',
      thumbnail: 'shorts'
    },
    {
      id: '14',
      title: 'Fitness Motivation in 60 Seconds',
      channel: 'FitLife',
      views: '3.2M',
      timestamp: '3 days ago',
      duration: '1:00',
      thumbnail: 'shorts'
    },
    {
      id: '15',
      title: 'Funny Cat Compilation #42',
      channel: 'PetLovers',
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
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    try {
      // Search videos using backend API
      const response = await axios.get(`/api/videos/search?q=${encodeURIComponent(query)}`);
      
      // Transform backend video data to match frontend format
      const results = response.data.map((video: any) => ({
        id: video._id,
        title: video.title,
        channel: video.uploader?.username || 'Unknown Channel',
        views: `${video.views} views`,
        timestamp: 'Recently',
        duration: `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`,
        thumbnail: video.thumbnail
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching videos:', error);
      // Fallback to client-side search if API fails
      // Include the videos we want to be searchable
      const searchableVideos = [
        ...videos, 
        ...userVideos, 
        ...userShorts,
        // Add the specific videos we want to be found
        {
          id: 'minecraft-1',
          title: 'MINECRAFT HARDCORE LAST EPISODE.... reason..... chainal Atharva Gamerz',
          channel: 'Atharva Gamerz',
          views: '1.2M views',
          timestamp: '2 days ago',
          duration: '20:00',
          thumbnail: 'gaming'
        },
        {
          id: 'pal-pal-1',
          title: 'Pal Pal Chainal | AFUSIC',
          channel: 'AFUSIC',
          views: '500K views',
          timestamp: '1 month ago',
          duration: '4:00',
          thumbnail: 'music'
        },
        {
          id: 'mitra-mela-1',
          title: 'Maha Mitra Mela 2025 trailer chainal Ajaysing Patil',
          channel: 'Ajaysing Patil',
          views: '100K views',
          timestamp: 'Recently',
          duration: '3:00',
          thumbnail: 'entertainment'
        },
        {
          id: 'kanbai-1',
          title: 'Kanbai Visarjan Mahale parivar chainal ShivGauri\'s Universe',
          channel: 'ShivGauri\'s Universe',
          views: '50K views',
          timestamp: 'Recently',
          duration: '5:00',
          thumbnail: 'religious'
        }
      ];
      
      const results = searchableVideos.filter(video => 
        video.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Show search suggestions when there's input
    if (value.trim() !== '') {
      setShowSearchSuggestions(true);
      
      // Generate search suggestions based on popular searches
      const popularSearches = [
        'Music',
        'Gaming',
        'News',
        'Sports',
        'Learning',
        'Fashion',
        'Beauty',
        'Comedy',
        'Cooking',
        'Travel',
        'Technology',
        'Fitness',
        'Cars',
        'Animation',
        'Education',
        'Science',
        'How-to',
        'DIY',
        'Pets',
        'Vlogs'
      ];
      
      // Filter suggestions based on input
      const filteredSuggestions = popularSearches.filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      
      setSearchSuggestions(filteredSuggestions.slice(0, 8)); // Limit to 8 suggestions
    } else {
      setShowSearchSuggestions(false);
      setSearchSuggestions([]);
    }
  };
  
  // Handle search suggestion click
  const handleSearchSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSearchSuggestions(false);
    setDebouncedSearchQuery(suggestion);
  };
  
  // Handle search input blur (hide suggestions after delay)
  const handleSearchInputBlur = () => {
    // Use timeout to allow clicking on suggestions
    setTimeout(() => {
      setShowSearchSuggestions(false);
    }, 200);
  };
  
  // Handle search input focus (show suggestions)
  const handleSearchInputFocus = () => {
    if (searchQuery.trim() !== '') {
      setShowSearchSuggestions(true);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger immediate search
    setDebouncedSearchQuery(searchQuery);
  };

  return (
    <div className="App">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      {/* Header */}
      <header className="App-header">
        <div className="header-left">
          <div className="menu-icon" onClick={() => {
                      const isLargeScreen = window.innerWidth >= 1024;
                      if (isLargeScreen) {
                        // On PC, keep the sidebar open and only toggle mobile menu if needed
                        setIsSidebarOpen(true);
                        // Close mobile menu if it's open
                        setIsMobileMenuOpen(false);
                      } else {
                        // On mobile, toggle the mobile menu
                        toggleMobileMenu();
                      }
                    }}>☰</div>          <div className="logo" onClick={goToHome}>
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
              onFocus={handleSearchInputFocus}
              onBlur={handleSearchInputBlur}
            />
            
            {/* Search Suggestions Dropdown */}
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className="search-suggestion-item"
                    onClick={() => handleSearchSuggestionClick(suggestion)}
                  >
                    🔍 {suggestion}
                  </div>
                ))}
              </div>
            )}
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
                    // Create a more detailed video object
                    const newVideo: Video = {
                      id: `user-${Date.now()}`,
                      title: uploadTitle,
                      channel: uploadChannel || user?.username || 'Your Channel',
                      views: '0',
                      timestamp: 'Just now',
                      duration: isShortUpload ? '0:15' : '0:30',
                      thumbnail: isShortUpload ? 'shorts' : 'user',
                      description: uploadDescription || ''
                    };
                    
                    // Add to user videos
                    setUserVideos([newVideo, ...userVideos]);
                    
                    // Close modal and reset form
                    setIsUploadModalOpen(false);
                    setUploadTitle('');
                    setUploadDescription('');
                    setUploadChannel('');
                    setIsShortUpload(false);
                  }
                }}>
                  <div className="form-group">
                    <label htmlFor="upload-title">Video Title</label>
                    <input
                      id="upload-title"
                      type="text"
                      placeholder="Enter video title"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="upload-description">Description</label>
                    <textarea
                      id="upload-description"
                      placeholder="Enter video description"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="upload-channel">Channel Name</label>
                    <input
                      id="upload-channel"
                      type="text"
                      placeholder="Enter channel name"
                      value={uploadChannel}
                      onChange={(e) => setUploadChannel(e.target.value)}
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
                    Upload Video
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Mobile Menu - only visible on mobile devices when open */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="logo" onClick={goToHome}>
            <span>You</span><span>Tube</span>
          </div>
          <button className="close-button" onClick={toggleMobileMenu}>×</button>
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
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToHome(); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToHome();
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">🏠</div>
              <div className="mobile-menu-text">Home</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentView('trending'); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('trending');
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">🔥</div>
              <div className="mobile-menu-text">Trending</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentView('shorts'); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('shorts');
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">⏱️</div>
              <div className="mobile-menu-text">Shorts</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentView('subscriptions'); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('subscriptions');
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">📺</div>
              <div className="mobile-menu-text">Subscriptions</div>
            </div>
          </div>
          
          <div className="mobile-menu-section">
            <h3>Library</h3>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToHome(); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToHome();
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">📚</div>
              <div className="mobile-menu-text">Library</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentView('history'); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('history');
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">🕒</div>
              <div className="mobile-menu-text">History</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentView('liked'); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('liked');
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">👍</div>
              <div className="mobile-menu-text">Liked videos</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentView('watchlater'); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('watchlater');
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">⏱️</div>
              <div className="mobile-menu-text">Watch later</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentView('yourvideos'); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('yourvideos');
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">🎥</div>
              <div className="mobile-menu-text">Your videos</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentView('downloads'); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('downloads');
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">⬇️</div>
              <div className="mobile-menu-text">Downloads</div>
            </div>
          </div>
          
          <div className="mobile-menu-section">
            <h3>Explore</h3>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentView('gaming'); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('gaming');
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">🎮</div>
              <div className="mobile-menu-text">Gaming</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentView('music'); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('music');
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">🎵</div>
              <div className="mobile-menu-text">Music</div>
            </div>
          </div>
          
          <div className="mobile-menu-section">
            <h3>Settings</h3>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAboutUs(true); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowAboutUs(true);
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">ℹ️</div>
              <div className="mobile-menu-text">About us</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSettings(true); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowSettings(true);
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">⚙️</div>
              <div className="mobile-menu-text">Settings</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowHelp(true); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowHelp(true);
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">❓</div>
              <div className="mobile-menu-text">Help</div>
            </div>
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentView('feedback'); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('feedback');
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">💬</div>
              <div className="mobile-menu-text">Send feedback</div>
            </div>
            {/* Upload Video Item */}
            <div className="mobile-menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsUploadModalOpen(true); setIsMobileMenuOpen(false); setIsSidebarOpen(false); }} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsUploadModalOpen(true);
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
              }
            }}>
              <div className="mobile-menu-icon">⬆️</div>
              <div className="mobile-menu-text">Upload Video</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>}
      
      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      
      {isAuthenticated ? (
        <>
          {/* Sidebar */}
          <div className={`sidebar ${isSidebarOpen ? 'sidebar-mobile-open' : ''} ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <div 
              className={`sidebar-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={goToHome}
              tabIndex={0} /* Make sidebar items focusable */
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToHome();
                }
              }}
            >
              <div className="sidebar-icon">🏠</div>
              <div className="sidebar-text">Home</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'trending' ? 'active' : ''}`}
              onClick={() => setCurrentView('trending')}
              tabIndex={0} /* Make sidebar items focusable */
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('trending');
                }
              }}
            >
              <div className="sidebar-icon">🔥</div>
              <div className="sidebar-text">Trending</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'shorts' ? 'active' : ''}`}
              onClick={() => setCurrentView('shorts')}
              tabIndex={0} /* Make sidebar items focusable */
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('shorts');
                }
              }}
            >
              <div className="sidebar-icon">⏱️</div>
              <div className="sidebar-text">Shorts</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setCurrentView('subscriptions')}
              tabIndex={0} /* Make sidebar items focusable */
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('subscriptions');
                }
              }}
            >
              <div className="sidebar-icon">📺</div>
              <div className="sidebar-text">Subscriptions</div>
            </div>
            
            <div className="sidebar-divider"></div>
            
            <div className="sidebar-item" tabIndex={0}>
              <div className="sidebar-icon">📚</div>
              <div className="sidebar-text">Library</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'history' ? 'active' : ''}`}
              onClick={() => setCurrentView('history')}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('history');
                }
              }}
            >
              <div className="sidebar-icon">🕒</div>
              <div className="sidebar-text">History</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'liked' ? 'active' : ''}`}
              onClick={() => setCurrentView('liked')}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('liked');
                }
              }}
            >
              <div className="sidebar-icon">👍</div>
              <div className="sidebar-text">Liked videos</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'watchlater' ? 'active' : ''}`}
              onClick={() => setCurrentView('watchlater')}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('watchlater');
                }
              }}
            >
              <div className="sidebar-icon">⏱️</div>
              <div className="sidebar-text">Watch later</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'yourvideos' ? 'active' : ''}`}
              onClick={() => setCurrentView('yourvideos')}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('yourvideos');
                }
              }}
            >
              <div className="sidebar-icon">🎥</div>
              <div className="sidebar-text">Your videos</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'downloads' ? 'active' : ''}`}
              onClick={() => setCurrentView('downloads')}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('downloads');
                }
              }}
            >
              <div className="sidebar-icon">⬇️</div>
              <div className="sidebar-text">Downloads</div>
            </div>
            
            <div className="sidebar-divider"></div>
            
            <div className="sidebar-section-title">Explore</div>
            <div 
              className={`sidebar-item ${currentView === 'gaming' ? 'active' : ''}`}
              onClick={() => setCurrentView('gaming')}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('gaming');
                }
              }}
            >
              <div className="sidebar-icon">🎮</div>
              <div className="sidebar-text">Gaming</div>
            </div>
            <div 
              className={`sidebar-item ${currentView === 'music' ? 'active' : ''}`}
              onClick={() => setCurrentView('music')}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('music');
                }
              }}
            >
              <div className="sidebar-icon">🎵</div>
              <div className="sidebar-text">Music</div>
            </div>
            
            <div className="sidebar-divider"></div>
            
            <div className="sidebar-item" onClick={() => setShowAboutUs(true)} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowAboutUs(true);
              }
            }}>
              <div className="sidebar-icon">ℹ️</div>
              <div className="sidebar-text">About us</div>
            </div>
            <div className="sidebar-item" onClick={() => setShowSettings(true)} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowSettings(true);
              }
            }}>
              <div className="sidebar-icon">⚙️</div>
              <div className="sidebar-text">Settings</div>
            </div>
            <div className="sidebar-item" onClick={() => setShowHelp(true)} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowHelp(true);
              }
            }}>
              <div className="sidebar-icon">❓</div>
              <div className="sidebar-text">Help</div>
            </div>
            <div className="sidebar-item" onClick={() => setCurrentView('feedback')} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('feedback');
              }
            }}>
              <div className="sidebar-icon">💬</div>
              <div className="sidebar-text">Send feedback</div>
            </div>
            <div className="sidebar-item" onClick={() => setCurrentView('admin')} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('admin');
              }
            }}>
              <div className="sidebar-icon">⬆️</div>
              <div className="sidebar-text">Upload Videos</div>
            </div>
            <div className="sidebar-item" onClick={() => setCurrentView('copyright')} tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('copyright');
              }
            }}>
              <div className="sidebar-icon">©️</div>
              <div className="sidebar-text">Copyright</div>
            </div>

          </div>
          
          {/* Content Area */}
          <div className={`content ${!isSidebarOpen ? 'content-expanded' : ''}`}>
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
              {currentView === 'admin' && 'Upload Videos'}
            </h1>
            
            <div className="video-grid">
              {currentView === 'feedback' ? (
                <div className="feedback-page">
                  <div className="feedback-form-container">
                    <div className="feedback-header">
                      <h2>Send Feedback</h2>
                      <button className="close-button" onClick={() => setCurrentView('home')}>×</button>
                    </div>                    <p>We'd love to hear your thoughts! Please share your feedback with us.</p>
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
              ) : currentView === 'admin' ? (
                <AdminPanel />
              ) : searchQuery.trim() !== '' ? (
                // Display search results when search query is not empty
                searchResults.length > 0 ? (
                  searchResults.map(video => (
                    <div className="video-card" key={video.id} onClick={() => selectVideo(video)}>
                      <div className="thumbnail-container">
                        <div className="thumbnail">
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
                <>
                  {/* Show loading skeletons when loading trending or shorts videos */}
                  {(currentView === 'trending' && loadingTrending) || 
                   (currentView === 'shorts' && loadingShorts) ? (
                    <VideoCardSkeleton count={12} />
                  ) : (
                    filteredVideos.map(video => (
                      <div className="video-card" key={video.id} onClick={() => selectVideo(video)}>
                        <div className="thumbnail-container">
                          <div className="thumbnail">
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
                </>
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

          {/* Mobile Bottom Navigation - Visible only on mobile devices */}
          {isAuthenticated && (
            <div className="mobile-nav-bottom">
              <a 
                href="#" 
                className={`mobile-nav-item ${currentView === 'home' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  goToHome();
                }}
              >
                <div className="mobile-nav-icon">🏠</div>
                <span>Home</span>
              </a>
              <a 
                href="#" 
                className={`mobile-nav-item ${currentView === 'trending' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('trending');
                }}
              >
                <div className="mobile-nav-icon">🔥</div>
                <span>Trending</span>
              </a>
              <a 
                href="#" 
                className={`mobile-nav-item ${currentView === 'shorts' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('shorts');
                }}
              >
                <div className="mobile-nav-icon">⏱️</div>
                <span>Shorts</span>
              </a>
              <a 
                href="#" 
                className={`mobile-nav-item ${currentView === 'subscriptions' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('subscriptions');
                }}
              >
                <div className="mobile-nav-icon">📺</div>
                <span>Subscriptions</span>
              </a>
              <a 
                href="#" 
                className="mobile-nav-item"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMobileMenu();
                }}
              >
                <div className="mobile-nav-icon">☰</div>
                <span>Menu</span>
              </a>
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