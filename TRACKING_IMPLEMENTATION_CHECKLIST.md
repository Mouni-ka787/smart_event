# Live Tracking Implementation Checklist

## 🎯 Quick Start Guide

This checklist will help you implement the Google Maps and Live Tracking features step by step.

---

## ✅ Phase 1: Backend Setup (Priority: HIGH)

### Step 1: Install Dependencies
```bash
cd smarteventx-backend
npm install socket.io
npm install @types/socket.io --save-dev
```

### Step 2: Update Booking Model
**File**: `src/models/Booking.ts`

- [ ] Add `venueLocation` field to IBooking interface
- [ ] Add `venueLocation` schema definition
- [ ] Test model changes

### Step 3: Create WebSocket Server
**File**: `src/websocket/trackingSocket.ts` (NEW FILE)

- [ ] Create trackingSocket.ts file
- [ ] Implement socket authentication
- [ ] Add event handlers for:
  - [ ] `join:booking`
  - [ ] `join:event`
  - [ ] `location:update`
  - [ ] `assignment:status`
- [ ] Test WebSocket connection

### Step 4: Integrate WebSocket in Server
**File**: `src/server.ts`

- [ ] Import http and trackingSocket
- [ ] Create HTTP server
- [ ] Setup WebSocket with setupTrackingSocket()
- [ ] Change app.listen to server.listen
- [ ] Test server starts correctly

### Step 5: Add New Controller Methods
**File**: `src/controllers/locationController.ts`

- [ ] Add `startTracking` function
- [ ] Add `stopTracking` function
- [ ] Test both functions

**File**: `src/controllers/bookingController.ts`

- [ ] Add `acceptBooking` function
- [ ] Add `getVendorActiveBookings` function
- [ ] Add `getUserTrackableBookings` function
- [ ] Test all three functions

### Step 6: Update Routes
**File**: `src/routes/locationRoutes.ts`

- [ ] Add POST `/bookings/:bookingId/start-tracking`
- [ ] Add POST `/bookings/:bookingId/stop-tracking`
- [ ] Test route registration

**File**: `src/routes/bookingRoutes.ts`

- [ ] Add PUT `/:id/accept`
- [ ] Add GET `/vendor/active`
- [ ] Add GET `/user/trackable`
- [ ] Test route registration

### Step 7: Enhance Booking Creation
**File**: `src/controllers/bookingController.ts` → `createBooking`

- [ ] Add venueLocation to request body
- [ ] Save venueLocation in booking
- [ ] Test booking creation with venue

---

## ✅ Phase 2: Frontend Integration (Priority: MEDIUM)

### Step 1: Install Dependencies
```bash
cd smarteventx-v2
npm install socket.io-client
```

### Step 2: Update WebSocket Service
**File**: `src/services/websocket.ts`

- [ ] Verify WebSocket initialization works
- [ ] Test connection to backend
- [ ] Test location update sending
- [ ] Test location update receiving

### Step 3: Update Booking Flow
**File**: `src/app/booking/[id]/page.tsx` (or create if not exists)

- [ ] Add venue location input in booking form
- [ ] Include venue coordinates (use Google Maps autocomplete)
- [ ] Send venue location with booking creation
- [ ] Test booking creation

### Step 4: Vendor Dashboard Updates
**File**: `src/app/dashboard/vendor/page.tsx`

- [ ] Fetch active bookings from `/api/bookings/vendor/active`
- [ ] Display list of active bookings
- [ ] Add "Start Tracking" button for each booking
- [ ] Integrate VendorTracking component
- [ ] Test tracking start

### Step 5: User Dashboard Updates
**File**: `src/app/dashboard/user/page.tsx` or tracking page

- [ ] Fetch trackable bookings from `/api/bookings/user/trackable`
- [ ] Display bookings with live tracking
- [ ] Show MapComponent with vendor location
- [ ] Display ETA and status
- [ ] Test real-time updates

### Step 6: Map Component Enhancement
**File**: `src/components/MapComponent.tsx`

- [ ] Verify Google Maps API key is set
- [ ] Test map displays correctly
- [ ] Test vendor marker updates in real-time
- [ ] Test route line between vendor and venue
- [ ] Test auto-centering on both markers

---

## ✅ Phase 3: Environment & Configuration (Priority: HIGH)

### Backend Environment
**File**: `smarteventx-backend/.env`

```env
# Add these variables
WS_PORT=5001
GOOGLE_MAPS_API_KEY=your_api_key_here
```

- [ ] Add WS_PORT variable
- [ ] Add GOOGLE_MAPS_API_KEY
- [ ] Restart backend server

### Frontend Environment
**File**: `smarteventx-v2/.env.local`

```env
# Add/verify these variables
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

- [ ] Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- [ ] Verify NEXT_PUBLIC_API_BASE_URL
- [ ] Verify NEXT_PUBLIC_WS_URL
- [ ] Restart frontend dev server

### Get Google Maps API Key
- [ ] Go to Google Cloud Console
- [ ] Create/select project
- [ ] Enable Maps JavaScript API
- [ ] Enable Geocoding API
- [ ] Enable Directions API (optional)
- [ ] Create API key
- [ ] Add API key to .env files
- [ ] Test API key works

---

## ✅ Phase 4: Testing (Priority: HIGH)

### Unit Tests
- [ ] Test booking creation with venue location
- [ ] Test vendor accepts booking
- [ ] Test start tracking API
- [ ] Test location update API
- [ ] Test stop tracking API
- [ ] Test WebSocket connection
- [ ] Test WebSocket events

### Integration Tests
- [ ] Complete flow: Create booking → Accept → Start tracking → Update location → Stop tracking
- [ ] Test vendor can see active bookings
- [ ] Test user can see trackable bookings
- [ ] Test real-time location updates appear on map
- [ ] Test ETA calculation
- [ ] Test status updates

### UI/UX Tests
- [ ] Test map loads correctly
- [ ] Test markers appear on map
- [ ] Test route line displays
- [ ] Test auto-center/zoom works
- [ ] Test "Start Tracking" button works
- [ ] Test "Stop Tracking" button works
- [ ] Test tracking info updates in real-time

---

## ✅ Phase 5: Optimization (Priority: LOW)

### Performance
- [ ] Add Redis caching for vendor locations
- [ ] Implement rate limiting on location updates
- [ ] Add database indexing optimization
- [ ] Implement WebSocket room management
- [ ] Test with multiple concurrent users

### Security
- [ ] Add input validation for coordinates
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Test authentication on all endpoints
- [ ] Test authorization rules

### User Experience
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add retry logic for failed updates
- [ ] Add offline detection
- [ ] Add battery optimization warnings

---

## 📊 Progress Tracker

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Backend Setup | ⏳ Not Started | 0% |
| Phase 2: Frontend Integration | ⏳ Not Started | 0% |
| Phase 3: Environment & Config | ⏳ Not Started | 0% |
| Phase 4: Testing | ⏳ Not Started | 0% |
| Phase 5: Optimization | ⏳ Not Started | 0% |

**Overall Progress: 0%**

---

## 🚀 Quick Test Commands

### Start Backend
```bash
cd smarteventx-backend
npm run dev
```

### Start Frontend
```bash
cd smarteventx-v2
npm run dev
```

### Test WebSocket Connection (Browser Console)
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
  socket.emit('join:booking', { bookingId: 'test_booking_id' });
});
```

### Test Location Update API (Postman/cURL)
```bash
curl -X POST http://localhost:5000/api/location/vendors/{vendorId}/location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking_id",
    "lat": 40.7128,
    "lng": -74.0060,
    "speed": 15,
    "bearing": 45,
    "ts": "2025-11-20T10:00:00Z"
  }'
```

---

## 📝 Important Notes

1. **Google Maps API Key**: Get this first! Everything depends on it.
2. **WebSocket Port**: Make sure port 5000 is not blocked by firewall
3. **CORS**: Backend CORS must allow frontend origin (localhost:3000)
4. **Database**: Ensure MongoDB is running before testing
5. **Geolocation**: Test on HTTPS or localhost (required for navigator.geolocation)

---

## 🐛 Common Issues & Solutions

### Issue: Map doesn't load
**Solution**: Check if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set correctly

### Issue: WebSocket won't connect
**Solution**: Verify WS_URL matches backend server URL and port

### Issue: Location updates not showing
**Solution**: Check WebSocket connection, ensure user joined booking room

### Issue: "Geolocation not supported"
**Solution**: Use HTTPS or localhost, ensure browser has location permission

### Issue: ETA not calculating
**Solution**: Verify venue location is saved in booking, check locationUtils

---

## 🎉 Success Criteria

Your implementation is complete when:

- [ ] User can create a booking with venue location
- [ ] Vendor can accept bookings
- [ ] Vendor can start tracking
- [ ] Vendor's location updates appear on user's map in real-time
- [ ] ETA displays and updates automatically
- [ ] Route line shows between vendor and venue
- [ ] Vendor can mark as arrived
- [ ] Vendor can complete service
- [ ] All status updates reflect in real-time

---

**Last Updated**: 2025-11-20
**Version**: 1.0
