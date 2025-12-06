// Mock PeerJS service for demonstration purposes
// In a real implementation, this would integrate with the actual PeerJS library

class PeerService {
  private peerId: string | null = null;
  private connections: Record<string, any> = {};
  private onMessageCallback: ((peerId: string, message: string) => void) | null = null;
  private onConnectionCallback: ((peerId: string) => void) | null = null;

  // Initialize the peer service
  init() {
    // Generate a mock peer ID
    this.peerId = `peer_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Peer service initialized with ID:', this.peerId);
    return this.peerId;
  }

  // Get the current peer ID
  getPeerId(): string | null {
    return this.peerId;
  }

  // Connect to another peer
  connectToPeer(remotePeerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simulate connection delay
      setTimeout(() => {
        if (remotePeerId && remotePeerId !== this.peerId) {
          this.connections[remotePeerId] = {
            id: remotePeerId,
            status: 'connected'
          };
          
          if (this.onConnectionCallback) {
            this.onConnectionCallback(remotePeerId);
          }
          
          console.log(`Connected to peer: ${remotePeerId}`);
          resolve();
        } else {
          reject(new Error('Invalid peer ID'));
        }
      }, 1000);
    });
  }

  // Send a message to a peer
  sendMessage(remotePeerId: string, message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connections[remotePeerId]) {
        // Simulate network delay
        setTimeout(() => {
          console.log(`Message sent to ${remotePeerId}: ${message}`);
          
          // Simulate receiving a response
          if (this.onMessageCallback) {
            // Simulate the other peer responding
            setTimeout(() => {
              if (this.onMessageCallback) {
                this.onMessageCallback(remotePeerId, `Echo: ${message}`);
              }
            }, 500);
          }
          
          resolve();
        }, 200);
      } else {
        reject(new Error('Not connected to peer'));
      }
    });
  }

  // Disconnect from a peer
  disconnectFromPeer(remotePeerId: string) {
    if (this.connections[remotePeerId]) {
      delete this.connections[remotePeerId];
      console.log(`Disconnected from peer: ${remotePeerId}`);
    }
  }

  // Set callback for incoming messages
  onMessage(callback: (peerId: string, message: string) => void) {
    this.onMessageCallback = callback;
  }

  // Set callback for new connections
  onConnection(callback: (peerId: string) => void) {
    this.onConnectionCallback = callback;
  }

  // Close all connections
  destroy() {
    this.connections = {};
    this.peerId = null;
    this.onMessageCallback = null;
    this.onConnectionCallback = null;
    console.log('Peer service destroyed');
  }
}

// Export a singleton instance
export const peerService = new PeerService();