# Ready-to-Use Code Snippets for Live Tracking

This file contains all the code snippets you need to copy and paste to implement live tracking.

---

## 📁 File 1: WebSocket Server Setup

### Create: `smarteventx-backend/src/websocket/trackingSocket.ts`

```typescript
import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  role?: string;
}

export const setupTrackingSocket = (httpServer: HTTPServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(
        token.replace('Bearer ', ''), 
        process.env.JWT_SECRET || 'fallback_secret'
      ) as DecodedToken;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id, 'User:', socket.data.user?.userId);

    // Join booking room
    socket.on('join:booking', ({ bookingId }) => {
      socket.join(`booking:${bookingId}`);
      console.log(`Socket ${socket.id} joined booking:${bookingId}`);
      
      // Send confirmation
      socket.emit('joined:booking', { bookingId });
    });

    // Join event room
    socket.on('join:event', ({ eventId }) => {
      socket.join(`event:${eventId}`);
      console.log(`Socket ${socket.id} joined event:${eventId}`);
      
      // Send confirmation
      socket.emit('joined:event', { eventId });
    });

    // Handle location updates from vendor
    socket.on('location:update', (data) => {
      const { assignmentId, bookingId, vendorId, lat, lng, speed, bearing, ts, etaSeconds } = data;
      
      console.log(`Location update from vendor ${vendorId} for booking ${bookingId}`);
      
      // Broadcast to all clients in the booking room (including sender)
      io.to(`booking:${bookingId}`).emit('location:update', {
        assignmentId,
        bookingId,
        vendorId,
        lat,
        lng,
        speed,
        bearing,
        ts,
        etaSeconds
      });
    });

    // Handle status updates
    socket.on('assignment:status', (data) => {
      const { assignmentId, bookingId, status } = data;
      
      console.log(`Status update for assignment ${assignmentId}: ${status}`);
      
      // Broadcast to all clients in the booking room
      io.to(`booking:${bookingId}`).emit('assignment:status', {
        assignmentId,
        status
      });
    });

    // Handle ETA updates
    socket.on('eta:update', (data) => {
      const { assignmentId, bookingId, etaSeconds } = data;
      
      console.log(`ETA update for assignment ${assignmentId}: ${etaSeconds}s`);
      
      // Broadcast to all clients in the booking room
      io.to(`booking:${bookingId}`).emit('eta:update', {
        assignmentId,
        etaSeconds
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', {
        code: 'SOCKET_ERROR',
        message: error.message || 'An error occurred'
      });
    });
  });

  return io;
};
```

---

## 📁 File 2: Update Server.ts

### Modify: `smarteventx-backend/src/server.ts`

Add these imports at the top:
```typescript
import http from 'http';
import { setupTrackingSocket } from './websocket/trackingSocket';
```

Replace the app.listen section with:
```typescript
// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket
const io = setupTrackingSocket(server);

// Make io accessible in controllers
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});
```

---

## 📁 File 3: Update Booking Model

### Modify: `smarteventx-backend/src/models/Booking.ts`

Add to IBooking interface (around line 12):
```typescript
export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId | string;
  eventName: string;
  eventDate: Date;
  guestCount: number;
  specialRequests?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'released' | 'refunded';
  qrCode?: string;
  // ADD THIS:
  venueLocation?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  // END ADD
  trackingInfo?: {
    currentLocation?: {
      type: 'Point';
      coordinates: [number, number];
    };
    estimatedArrival?: Date;
    updates: {
      status: string;
      timestamp: Date;
      description: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

Add to BookingSchema (around line 85, before timestamps):
```typescript
  // ADD THIS:
  venueLocation: {
    address: {
      type: String
    },
    coordinates: {
      lat: {
        type: Number
      },
      lng: {
        type: Number
      }
    }
  },
  // END ADD
```

---

## 📁 File 4: Add New Location Controller Methods

### Modify: `smarteventx-backend/src/controllers/locationController.ts`

Add these functions at the end of the file (before the export statements):

```typescript
// @desc    Start tracking for a booking
// @route   POST /api/location/bookings/:bookingId/start-tracking
// @access  Private/Vendor
export const startTracking = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const { bookingId } = req.params;
    const { startLocation } = req.body;
    
    // Validate input
    if (!startLocation || !startLocation.lat || !startLocation.lng) {
      return res.status(400).json({ message: 'Start location with lat and lng is required' });
    }
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify vendor owns this booking
    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to track this booking' });
    }
    
    // Update status to in_progress
    booking.status = 'in_progress';
    
    // Initialize tracking info with starting location
    if (!booking.trackingInfo) {
      booking.trackingInfo = { updates: [] };
    }
    
    booking.trackingInfo.currentLocation = {
      type: 'Point',
      coordinates: [startLocation.lng, startLocation.lat]
    };
    
    booking.trackingInfo.updates.push({
      status: 'EN_ROUTE',
      timestamp: new Date(),
      description: 'Vendor started traveling to venue'
    });
    
    await booking.save();
    
    // Get the io instance
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${bookingId}`).emit('assignment:status', {
        assignmentId: bookingId,
        status: 'EN_ROUTE'
      });
    }
    
    res.json({
      message: 'Tracking started successfully',
      tracking: booking.trackingInfo
    });
  } catch (error: any) {
    console.error('Error in startTracking:', error);
    res.status(500).json({ message: 'Failed to start tracking: ' + error.message });
  }
};

// @desc    Stop tracking for a booking
// @route   POST /api/location/bookings/:bookingId/stop-tracking
// @access  Private/Vendor
export const stopTracking = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const { bookingId } = req.params;
    const { reason } = req.body; // 'ARRIVED' or 'COMPLETED'
    
    // Validate reason
    if (!reason || !['ARRIVED', 'COMPLETED'].includes(reason)) {
      return res.status(400).json({ message: 'Invalid reason. Must be ARRIVED or COMPLETED' });
    }
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify vendor owns this booking
    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Update status based on reason
    if (reason === 'COMPLETED') {
      booking.status = 'completed';
    }
    
    // Add final update
    if (!booking.trackingInfo) {
      booking.trackingInfo = { updates: [] };
    }
    
    booking.trackingInfo.updates.push({
      status: reason,
      timestamp: new Date(),
      description: reason === 'ARRIVED' 
        ? 'Vendor arrived at venue' 
        : 'Service completed'
    });
    
    await booking.save();
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${bookingId}`).emit('assignment:status', {
        assignmentId: bookingId,
        status: reason
      });
    }
    
    res.json({
      message: 'Tracking stopped successfully',
      status: booking.status
    });
  } catch (error: any) {
    console.error('Error in stopTracking:', error);
    res.status(500).json({ message: 'Failed to stop tracking: ' + error.message });
  }
};
```

---

## 📁 File 5: Add New Booking Controller Methods

### Modify: `smarteventx-backend/src/controllers/bookingController.ts`

Add these functions at the end of the file:

```typescript
// @desc    Vendor accepts booking
// @route   PUT /api/bookings/:id/accept
// @access  Private/Vendor
export const acceptBooking = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify vendor owns this booking
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this booking' });
    }
    
    // Update status to confirmed
    booking.status = 'confirmed';
    
    // Initialize tracking info
    if (!booking.trackingInfo) {
      booking.trackingInfo = {
        updates: [{
          status: 'ACCEPTED',
          timestamp: new Date(),
          description: 'Vendor accepted the booking'
        }]
      };
    } else {
      booking.trackingInfo.updates.push({
        status: 'ACCEPTED',
        timestamp: new Date(),
        description: 'Vendor accepted the booking'
      });
    }
    
    await booking.save();
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${booking._id}`).emit('assignment:status', {
        assignmentId: booking._id,
        status: 'ACCEPTED'
      });
    }
    
    res.json({
      message: 'Booking accepted successfully',
      booking
    });
  } catch (error: any) {
    console.error('Error in acceptBooking:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active bookings for vendor
// @route   GET /api/bookings/vendor/active
// @access  Private/Vendor
export const getVendorActiveBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const bookings = await Booking.find({
      vendor: req.user._id,
      status: { $in: ['confirmed', 'in_progress'] }
    })
    .populate('user', 'name email phoneNumber')
    .populate('service', 'name category')
    .sort({ eventDate: 1 });
    
    res.json(bookings);
  } catch (error: any) {
    console.error('Error in getVendorActiveBookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's trackable bookings
// @route   GET /api/bookings/user/trackable
// @access  Private/User
export const getUserTrackableBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const bookings = await Booking.find({
      user: req.user._id,
      status: { $in: ['confirmed', 'in_progress'] }
    })
    .populate('vendor', 'name email phoneNumber')
    .populate('service', 'name category')
    .sort({ eventDate: 1 });
    
    res.json(bookings);
  } catch (error: any) {
    console.error('Error in getUserTrackableBookings:', error);
    res.status(500).json({ message: error.message });
  }
};
```

---

## 📁 File 6: Update Location Routes

### Modify: `smarteventx-backend/src/routes/locationRoutes.ts`

Replace entire file content:

```typescript
import express from 'express';
import { 
  updateVendorLocation,
  updateAssignmentStatus,
  getBookingTracking,
  startTracking,
  stopTracking
} from '../controllers/locationController';
import { authenticate as protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Vendor location updates
router.route('/vendors/:vendorId/location')
  .post(updateVendorLocation);

// Assignment status updates
router.route('/bookings/:bookingId/status')
  .put(updateAssignmentStatus);

// Get booking tracking info
router.route('/bookings/:bookingId/tracking')
  .get(getBookingTracking);

// Start tracking
router.route('/bookings/:bookingId/start-tracking')
  .post(startTracking);

// Stop tracking
router.route('/bookings/:bookingId/stop-tracking')
  .post(stopTracking);

export default router;
```

---

## 📁 File 7: Update Booking Routes

### Modify: `smarteventx-backend/src/routes/bookingRoutes.ts`

Add these imports at the top:
```typescript
import {
  // ... existing imports
  acceptBooking,
  getVendorActiveBookings,
  getUserTrackableBookings
} from '../controllers/bookingController';
```

Add these routes (before `export default router;`):
```typescript
// Vendor accepts booking
router.put('/:id/accept', protect, acceptBooking);

// Get vendor's active bookings
router.get('/vendor/active', protect, getVendorActiveBookings);

// Get user's trackable bookings
router.get('/user/trackable', protect, getUserTrackableBookings);
```

---

## 📁 File 8: Environment Files

### `smarteventx-backend/.env`

Add these lines:
```env
# WebSocket Configuration
WS_PORT=5001

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### `smarteventx-v2/.env.local`

Add/update these lines:
```env
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

---

## 📁 File 9: Package.json Updates

### `smarteventx-backend/package.json`

Add socket.io dependency:
```bash
npm install socket.io
npm install @types/socket.io --save-dev
```

### `smarteventx-v2/package.json`

Socket.io-client is already installed based on your websocket.ts file.

---

## 🧪 Testing Code

### Test 1: Test WebSocket Connection (Browser Console)

```javascript
// In browser console (Frontend)
const socket = io('http://localhost:5000', {
  auth: { 
    token: localStorage.getItem('token') // or your token storage method
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket');
});

socket.on('joined:booking', (data) => {
  console.log('✅ Joined booking:', data);
});

socket.on('location:update', (data) => {
  console.log('📍 Location update:', data);
});

socket.on('assignment:status', (data) => {
  console.log('📊 Status update:', data);
});

// Join a booking room
socket.emit('join:booking', { bookingId: 'your_booking_id' });
```

### Test 2: Test API Endpoints (cURL/Postman)

```bash
# 1. Accept Booking
curl -X PUT http://localhost:5000/api/bookings/BOOKING_ID/accept \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# 2. Start Tracking
curl -X POST http://localhost:5000/api/location/bookings/BOOKING_ID/start-tracking \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startLocation": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }'

# 3. Update Location
curl -X POST http://localhost:5000/api/location/vendors/VENDOR_ID/location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_ID",
    "lat": 40.7350,
    "lng": -73.9950,
    "speed": 15,
    "bearing": 45,
    "ts": "2025-11-20T10:00:00Z"
  }'

# 4. Stop Tracking
curl -X POST http://localhost:5000/api/location/bookings/BOOKING_ID/stop-tracking \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "ARRIVED"
  }'

# 5. Get Tracking Info
curl -X GET http://localhost:5000/api/location/bookings/BOOKING_ID/tracking \
  -H "Authorization: Bearer YOUR_TOKEN"

# 6. Get Vendor Active Bookings
curl -X GET http://localhost:5000/api/bookings/vendor/active \
  -H "Authorization: Bearer YOUR_TOKEN"

# 7. Get User Trackable Bookings
curl -X GET http://localhost:5000/api/bookings/user/trackable \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Frontend Integration Example

### Example: Vendor Dashboard with Tracking

```typescript
// src/app/dashboard/vendor/bookings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import VendorTracking from '@/components/VendorTracking';
import { API_BASE_URL } from '@/services/api';

export default function VendorBookingsPage() {
  const [activeBookings, setActiveBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchActiveBookings();
  }, []);

  const fetchActiveBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bookings/vendor/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setActiveBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleStartTracking = (booking) => {
    setSelectedBooking(booking);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Active Bookings</h1>
      
      <div className="grid gap-4">
        {activeBookings.map((booking) => (
          <div key={booking._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{booking.eventName}</h3>
            <p>Customer: {booking.user.name}</p>
            <p>Status: {booking.status}</p>
            
            {booking.status === 'confirmed' && (
              <button
                onClick={() => handleStartTracking(booking)}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Start Tracking
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedBooking && (
        <div className="mt-8">
          <VendorTracking
            assignmentId={selectedBooking._id}
            bookingId={selectedBooking._id}
            vendorId={selectedBooking.vendor._id}
            venueLocation={selectedBooking.venueLocation?.coordinates}
          />
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Quick Start Commands

```bash
# 1. Backend - Install dependencies
cd smarteventx-backend
npm install socket.io
npm install @types/socket.io --save-dev

# 2. Backend - Start server
npm run dev

# 3. Frontend - Start development server
cd ../smarteventx-v2
npm run dev

# 4. Open browser
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
```

---

**All code is ready to copy and paste! Follow the checklist file for the implementation order.**
