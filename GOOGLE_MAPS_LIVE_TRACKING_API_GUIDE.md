# Google Maps & Live Tracking API Implementation Guide

## Overview
This document outlines all the APIs required to make Google Maps and Live Tracking work in the SmartEventX application. The system enables real-time location tracking of vendors traveling from their location to the event venue once services are booked.

---

## 🎯 Feature Flow

1. **User books a service** → Booking created with `pending` status
2. **Vendor accepts booking** → Status changes to `confirmed`
3. **Vendor starts traveling** → Status changes to `in_progress`, tracking begins
4. **Real-time location updates** → Vendor's location is continuously updated
5. **Vendor arrives** → Status changes to `completed`
6. **Service completion** → Payment can be released via QR code

---

## 📍 Current Implementation Status

### ✅ Already Implemented (Backend)

1. **Location Tracking Controller** (`src/controllers/locationController.ts`)
   - ✅ Update vendor location
   - ✅ Update assignment status
   - ✅ Get booking tracking info

2. **Location Routes** (`src/routes/locationRoutes.ts`)
   - ✅ POST `/api/location/vendors/:vendorId/location`
   - ✅ PUT `/api/location/bookings/:bookingId/status`
   - ✅ GET `/api/location/bookings/:bookingId/tracking`

3. **Booking Model** (`src/models/Booking.ts`)
   - ✅ Tracking info structure with current location
   - ✅ ETA calculation
   - ✅ Status updates history

4. **Location Utilities** (`src/utils/locationUtils.ts`)
   - ✅ Distance calculation (Haversine formula)
   - ✅ ETA calculation
   - ✅ Geofence checking
   - ✅ Bearing calculation

### ✅ Already Implemented (Frontend)

1. **Components**
   - ✅ `MapComponent.tsx` - Google Maps display with vendor & venue markers
   - ✅ `VendorTracking.tsx` - Vendor-side tracking interface
   - ✅ `SimpleTracking.tsx` - Basic tracking component
   - ✅ `TrackingModal.tsx` - Modal for tracking display

2. **Services**
   - ✅ `websocket.ts` - WebSocket service for real-time updates
   - ✅ `api.ts` - API service for REST calls

---

## 🔧 APIs That Need to Be Created

### 1. **Booking Creation with Location Data**

#### **Purpose**: Create a booking with event venue location information

**Endpoint**: `POST /api/bookings` (Enhance existing)

**Current Location**: `src/controllers/bookingController.ts`

**Enhancement Needed**:
```typescript
// Add to booking creation
{
  "user": "userId",
  "service": "serviceId",
  "vendor": "vendorId",
  "eventName": "Wedding Ceremony",
  "eventDate": "2025-12-01T18:00:00Z",
  "guestCount": 150,
  "totalPrice": 5000,
  // NEW: Add venue location
  "venueLocation": {
    "address": "123 Main St, New York, NY 10001",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }
}
```

**Action Required**: Modify the Booking model to include venue location.

---

### 2. **Vendor Accept Booking API**

#### **Purpose**: Vendor accepts a booking and can start tracking

**Endpoint**: `PUT /api/bookings/:id/accept`

**File to Create/Modify**: `src/controllers/bookingController.ts`

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
    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
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
    }
    
    await booking.save();
    
    res.json({
      message: 'Booking accepted successfully',
      booking
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

**Add Route**: In `src/routes/bookingRoutes.ts`
```typescript
router.put('/:id/accept', protect, acceptBooking);
```

---

### 3. **Start Tracking API**

#### **Purpose**: Vendor starts traveling and initiates real-time tracking

**Endpoint**: `POST /api/location/bookings/:bookingId/start-tracking`

**File to Modify**: `src/controllers/locationController.ts`

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
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify vendor owns this booking
    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
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
    
    res.json({
      message: 'Tracking started successfully',
      tracking: booking.trackingInfo
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

**Add Route**: In `src/routes/locationRoutes.ts`
```typescript
router.post('/bookings/:bookingId/start-tracking', startTracking);
```

---

### 4. **Stop Tracking API**

#### **Purpose**: Vendor stops tracking when arrived or service completed

**Endpoint**: `POST /api/location/bookings/:bookingId/stop-tracking`

**File to Modify**: `src/controllers/locationController.ts`

```typescript
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
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify vendor owns this booking
    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
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
    
    res.json({
      message: 'Tracking stopped successfully',
      status: booking.status
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

**Add Route**: In `src/routes/locationRoutes.ts`
```typescript
router.post('/bookings/:bookingId/stop-tracking', stopTracking);
```

---

### 5. **Get Active Bookings for Vendor**

#### **Purpose**: Get all bookings that are active and can be tracked

**Endpoint**: `GET /api/bookings/vendor/active`

**File to Modify**: `src/controllers/bookingController.ts`

```typescript
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
    res.status(500).json({ message: error.message });
  }
};
```

**Add Route**: In `src/routes/bookingRoutes.ts`
```typescript
router.get('/vendor/active', protect, getVendorActiveBookings);
```

---

### 6. **Get User's Trackable Bookings**

#### **Purpose**: User can see all their bookings with live tracking enabled

**Endpoint**: `GET /api/bookings/user/trackable`

**File to Modify**: `src/controllers/bookingController.ts`

```typescript
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
      status: { $in: ['confirmed', 'in_progress'] },
      'trackingInfo.currentLocation': { $exists: true }
    })
    .populate('vendor', 'name email phoneNumber')
    .populate('service', 'name category')
    .sort({ eventDate: 1 });
    
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

**Add Route**: In `src/routes/bookingRoutes.ts`
```typescript
router.get('/user/trackable', protect, getUserTrackableBookings);
```

---

### 7. **WebSocket Event Handlers**

#### **Purpose**: Real-time communication for location updates

**File to Create**: `src/websocket/trackingSocket.ts`

```typescript
import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join booking room
    socket.on('join:booking', ({ bookingId }) => {
      socket.join(`booking:${bookingId}`);
      console.log(`Socket ${socket.id} joined booking:${bookingId}`);
    });

    // Join event room
    socket.on('join:event', ({ eventId }) => {
      socket.join(`event:${eventId}`);
      console.log(`Socket ${socket.id} joined event:${eventId}`);
    });

    // Handle location updates
    socket.on('location:update', (data) => {
      const { bookingId, lat, lng, speed, bearing, ts } = data;
      
      // Broadcast to all clients in the booking room
      io.to(`booking:${bookingId}`).emit('location:update', {
        assignmentId: data.assignmentId,
        bookingId,
        lat,
        lng,
        speed,
        bearing,
        ts,
        etaSeconds: data.etaSeconds
      });
    });

    // Handle status updates
    socket.on('assignment:status', (data) => {
      const { assignmentId, status } = data;
      
      // Broadcast to all clients in the booking room
      io.to(`booking:${data.bookingId}`).emit('assignment:status', {
        assignmentId,
        status
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};
```

**Integrate in**: `src/server.ts`

```typescript
import http from 'http';
import { setupTrackingSocket } from './websocket/trackingSocket';

// After creating the express app
const server = http.createServer(app);

// Setup WebSocket
const io = setupTrackingSocket(server);

// Make io accessible in controllers
app.set('io', io);

// Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 📦 Database Model Enhancements

### Update Booking Model

**File**: `src/models/Booking.ts`

Add venue location to the booking:

```typescript
export interface IBooking extends Document {
  // ... existing fields
  venueLocation?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  // ... rest of fields
}

// In schema
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
}
```

---

## 🔄 Complete API Workflow

### **Scenario: Vendor Traveling to Wedding Venue**

#### **Step 1: Booking Creation (User Side)**
```bash
POST /api/bookings
{
  "service": "serviceId",
  "vendor": "vendorId",
  "eventName": "Wedding Reception",
  "eventDate": "2025-12-15T18:00:00Z",
  "guestCount": 200,
  "venueLocation": {
    "address": "Grand Ballroom, 456 Park Ave, NY",
    "coordinates": { "lat": 40.7589, "lng": -73.9851 }
  }
}
```

#### **Step 2: Vendor Accepts Booking**
```bash
PUT /api/bookings/{bookingId}/accept
```

#### **Step 3: Vendor Starts Traveling**
```bash
POST /api/location/bookings/{bookingId}/start-tracking
{
  "startLocation": { "lat": 40.7128, "lng": -74.0060 }
}
```

#### **Step 4: Continuous Location Updates (Every 5-10 seconds)**
```bash
POST /api/location/vendors/{vendorId}/location
{
  "bookingId": "bookingId",
  "lat": 40.7350,
  "lng": -73.9950,
  "speed": 15,
  "bearing": 45,
  "ts": "2025-12-15T16:30:00Z"
}
```

#### **Step 5: User Monitors Live Tracking**
```bash
GET /api/location/bookings/{bookingId}/tracking

# WebSocket connection receives real-time updates
socket.on('location:update', (data) => {
  // Update map with vendor's current position
});
```

#### **Step 6: Vendor Arrives**
```bash
POST /api/location/bookings/{bookingId}/stop-tracking
{
  "reason": "ARRIVED"
}
```

#### **Step 7: Service Completed**
```bash
POST /api/location/bookings/{bookingId}/stop-tracking
{
  "reason": "COMPLETED"
}
```

---

## 🗺️ Google Maps Integration

### **Environment Variables Needed**

Add to `.env` files:

**Backend** (`smarteventx-backend/.env`):
```env
# WebSocket
WS_PORT=5001

# Google Maps (for server-side calculations)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Frontend** (`smarteventx-v2/.env.local`):
```env
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# API URLs
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### **Getting Google Maps API Key**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API (for route calculation)
   - Distance Matrix API (for ETA calculation)
4. Create credentials → API Key
5. Restrict the API key to your domain

---

## 📋 Summary of APIs to Add

### **New Endpoints to Create:**

1. ✅ `PUT /api/bookings/:id/accept` - Vendor accepts booking
2. ✅ `POST /api/location/bookings/:bookingId/start-tracking` - Start tracking
3. ✅ `POST /api/location/bookings/:bookingId/stop-tracking` - Stop tracking
4. ✅ `GET /api/bookings/vendor/active` - Get vendor's active bookings
5. ✅ `GET /api/bookings/user/trackable` - Get user's trackable bookings
6. ✅ WebSocket handlers for real-time updates

### **Existing Endpoints to Use:**

1. ✅ `POST /api/location/vendors/:vendorId/location` - Update location (already exists)
2. ✅ `PUT /api/location/bookings/:bookingId/status` - Update status (already exists)
3. ✅ `GET /api/location/bookings/:bookingId/tracking` - Get tracking (already exists)

---

## 🚀 Next Steps

1. **Install Socket.IO** (if not already installed):
   ```bash
   cd smarteventx-backend
   npm install socket.io
   ```

2. **Update Booking Model** to include `venueLocation`

3. **Create New API Endpoints** as outlined above

4. **Setup WebSocket Server** for real-time tracking

5. **Test the Complete Flow**:
   - Create booking with venue location
   - Vendor accepts booking
   - Start tracking
   - Send location updates
   - Monitor on user side
   - Stop tracking

6. **Add Google Directions API** for accurate ETA (optional enhancement)

---

## 📝 Notes

- The current implementation already has most of the infrastructure in place
- WebSocket integration is partially implemented in frontend but needs backend setup
- Distance and ETA calculations are simplified; consider using Google Directions API for production
- Implement rate limiting on location update endpoints (max 1 update per 5 seconds)
- Add error handling for GPS failures
- Consider battery optimization for mobile devices

---

## 🔒 Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Vendors can only update their own locations
3. **Rate Limiting**: Prevent abuse of location update endpoints
4. **Data Validation**: Validate coordinates are within reasonable bounds
5. **WebSocket Authentication**: Verify JWT before allowing socket connections

---

## 📊 Performance Optimization

1. **Geospatial Indexing**: Booking model already has 2dsphere index on coordinates
2. **Caching**: Cache vendor locations in Redis for faster retrieval
3. **Batch Updates**: Consider batching multiple location updates
4. **WebSocket Rooms**: Use rooms to limit broadcast scope
5. **Database Connection Pooling**: Already configured in MongoDB

---

This guide provides a complete roadmap for implementing and enhancing the Google Maps and Live Tracking features in your SmartEventX application!
