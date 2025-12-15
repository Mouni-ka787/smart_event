// WebSocket service for real-time location tracking
import io from 'socket.io-client';

// Define types for our WebSocket events
interface LocationUpdate {
  assignmentId: string;
  bookingId: string;
  vendorId: string;
  lat: number;
  lng: number;
  speed?: number;
  bearing?: number;
  ts: string; // ISO8601 timestamp
  etaSeconds?: number;
}

interface AssignmentStatus {
  assignmentId: string;
  status: 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED';
}

interface ETAUpdate {
  assignmentId: string;
  etaSeconds: number;
}

interface SocketError {
  code: string;
  message: string;
}

class WebSocketService {
  private socket: any = null;
  private token: string | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Initialize WebSocket connection
  init(token: string) {
    this.token = token;
    
    // Initialize socket connection
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'https://smart-event-backend.onrender.com', {
      auth: {
        token: this.token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      
      // Try to reconnect if it was not a manual disconnect
      if (reason === 'io server disconnect') {
        // The server disconnected, so we should reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      // Stop trying to reconnect after max attempts
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    return this.socket;
  }

  // Join a booking room
  joinBooking(bookingId: string) {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('join:booking', { bookingId });
  }

  // Join an event room
  joinEvent(eventId: string) {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('join:event', { eventId });
  }

  // Send location update
  sendLocationUpdate(locationData: LocationUpdate) {
    if (!this.socket || !this.isConnected) {
      // Fallback to REST API if WebSocket is not available
      this.sendLocationUpdateREST(locationData);
      return;
    }
    
    this.socket.emit('location:update', locationData);
  }

  // Update assignment status
  updateAssignmentStatus(statusData: AssignmentStatus) {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('assignment:status', statusData);
  }

  // Listen for location updates
  onLocationUpdate(callback: (data: LocationUpdate) => void) {
    if (!this.socket) return;
    
    this.socket.on('location:update', callback);
  }

  // Listen for assignment status updates
  onAssignmentStatus(callback: (data: AssignmentStatus) => void) {
    if (!this.socket) return;
    
    this.socket.on('assignment:status', callback);
  }

  // Listen for ETA updates
  onETAUpdate(callback: (data: ETAUpdate) => void) {
    if (!this.socket) return;
    
    this.socket.on('eta:update', callback);
  }

  // Listen for errors
  onError(callback: (data: SocketError) => void) {
    if (!this.socket) return;
    
    this.socket.on('error', callback);
  }

  // Fallback REST API for location updates when WebSocket is unavailable
  async sendLocationUpdateREST(locationData: LocationUpdate) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://smart-event-backend.onrender.com'}/vendors/${locationData.vendorId}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(locationData)
      });

      if (!response.ok) {
        throw new Error('Failed to send location update via REST');
      }

      console.log('Location update sent via REST API');
    } catch (error) {
      console.error('Error sending location update via REST:', error);
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Check if connected
  isConnectedStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export default new WebSocketService();