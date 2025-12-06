import React, { useState, useEffect, useRef } from 'react';
import { peerService } from '../services/peerService';

interface PeerChatProps {
  peerId: string;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  messages: { text: string; sender: string; type: 'message' | 'system' }[];
}

const PeerChat: React.FC<PeerChatProps> = ({ peerId, onClose, onSendMessage, messages }) => {
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [localPeerId, setLocalPeerId] = useState<string | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Initialize peer service
  useEffect(() => {
    const id = peerService.init();
    setLocalPeerId(id);
    
    // Set up message listener
    peerService.onMessage((senderId, message) => {
      // Add received message to chat
      onSendMessage(`Received: ${message}`);
    });
    
    return () => {
      peerService.destroy();
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim() && isConnected) {
      // Send message via peer service
      peerService.sendMessage(peerId, message)
        .then(() => {
          // Add sent message to chat
          onSendMessage(message);
          setMessage('');
        })
        .catch(err => {
          console.error('Failed to send message:', err);
          onSendMessage(`Error: ${err.message}`);
        });
    }
  };

  const handleConnect = () => {
    if (peerId && localPeerId && peerId !== localPeerId) {
      peerService.connectToPeer(peerId)
        .then(() => {
          setIsConnected(true);
          setConnectionStatus(`Connected to ${peerId}`);
          onSendMessage(`Connected to peer ${peerId}`);
        })
        .catch(err => {
          console.error('Failed to connect:', err);
          onSendMessage(`Connection failed: ${err.message}`);
        });
    } else {
      onSendMessage('Invalid peer ID or not initialized');
    }
  };

  const handleDisconnect = () => {
    peerService.disconnectFromPeer(peerId);
    setIsConnected(false);
    setConnectionStatus('Disconnected');
    onSendMessage(`Disconnected from peer ${peerId}`);
  };

  return (
    <div className="peer-chat-modal">
      <div className="peer-chat-content">
        <div className="peer-chat-header">
          <h3>Peer Chat with {peerId.substring(0, 10)}...</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="peer-status">
          <p>Status: {connectionStatus}</p>
          {!isConnected ? (
            <button className="btn btn-primary" onClick={handleConnect}>
              Connect to Peer
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={handleDisconnect}>
              Disconnect
            </button>
          )}
        </div>
        
        <div className="peer-chat-messages" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={msg.type === 'system' ? 'system-message' : 'message'}
            >
              {msg.sender && <strong>{msg.sender}: </strong>}
              {msg.text}
            </div>
          ))}
        </div>
        
        {isConnected && (
          <div className="peer-chat-controls">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="btn btn-primary" onClick={handleSend}>
              Send
            </button>
          </div>
        )}
        
        <div className="peer-info">
          <p><strong>Your Peer ID:</strong> {localPeerId ? localPeerId.substring(0, 15) + '...' : 'Generating...'}</p>
          <p><strong>Remote Peer ID:</strong> {peerId.substring(0, 15) + '...'}</p>
        </div>
      </div>
    </div>
  );
};

export default PeerChat;