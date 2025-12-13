# Event Booking Flow with Live Tracking & Payment

## Overview
Complete booking system for event packages with admin tracking and QR code payment processing.

## Booking Flow

### 1. **User Books Event**
- User clicks "Book This Event" on event details page
- Modal opens with booking form:
  - Event Date & Time
  - Guest Count
  - Venue Address (with lat/lng coordinates)
  - Special Requests
- User submits booking
- **Status**: `pending` | **Payment**: `pending`
- **Tracking**: `NOT_STARTED`

**API**: `POST /api/bookings/event`
```javascript
{
  eventId: string,
  eventName: string,
  eventDate: string,
  guestCount: number,
  venueAddress: string,
  venueLat: number,
  venueLng: number,
  specialRequests?: string
}
```

### 2. **Admin Accepts Booking**
- Admin sees booking in dashboard
- Admin clicks "Accept Booking"
- **Status**: `confirmed`
- **Tracking**: `NOT_STARTED`
- User receives confirmation notification

**API**: `PUT /api/bookings/:id/accept`

### 3. **Admin Starts Service (Live Tracking Begins)**
- Admin clicks "Start Service" when heading to venue
- Provides current location (lat/lng)
- **Status**: `in_progress`
- **Tracking**: `EN_ROUTE`
- **Live tracking activated** - User can see admin's real-time location on map
- ETA calculated and displayed to user

**API**: `PUT /api/bookings/:id/start-service`
```javascript
{
  location: {
    lat: number,
    lng: number
  }
}
```

### 4. **Admin Completes Service (QR Code Generated)**
- Admin clicks "Complete Service" after delivering event services
- **Status**: `completed`
- **Tracking**: `COMPLETED`
- **QR Code generated automatically** for payment
- QR code contains:
  - Booking ID
  - Payment amount
  - Timestamp

**API**: `PUT /api/bookings/:id/complete-service`
**Response**: Returns booking with QR code image (base64)

### 5. **User Scans QR & Pays**
- User scans QR code **within the app**
- App extracts payment data from QR
- Payment processed automatically
- **Payment Status**: `paid`
- Admin receives payment confirmation

**API**: `POST /api/bookings/:id/process-payment`
```javascript
{
  qrData: string  // JSON string from QR code
}
```

## Database Schema Updates

### Booking Model
```typescript
{
  user: ObjectId,              // User who booked
  event: ObjectId,             // Event package
  admin: ObjectId,             // Admin providing service
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed',
  paymentStatus: 'pending' | 'paid',
  qrCode: string,              // Base64 QR code image
  
  venueLocation: {
    address: string,
    coordinates: { lat: number, lng: number }
  },
  
  adminTrackingInfo: {
    currentLocation: {
      type: 'Point',
      coordinates: [lng, lat]
    },
    estimatedArrival: Date,
    status: 'NOT_STARTED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED',
    updates: [{
      status: string,
      timestamp: Date,
      description: string
    }]
  }
}
```

## Frontend Components

### Event Details Page
**File**: `/src/app/events/[id]/page.tsx`

**Features**:
- Event information display
- Included services list
- Location map
- Live tracking section (shows admin location)
- "Book This Event" button → Opens booking modal
- Booking modal with form

### User Dashboard
Should show:
- Active bookings with status
- Live tracking for `in_progress` bookings
- QR code when service is `completed`
- Payment status

### Admin Dashboard
Should show:
- Pending bookings to accept
- Confirmed bookings to start
- In-progress bookings with location update
- Complete service button to generate QR

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings/event` | User | Create event booking |
| PUT | `/api/bookings/:id/accept` | Admin | Accept booking |
| PUT | `/api/bookings/:id/start-service` | Admin | Start service & tracking |
| PUT | `/api/bookings/:id/complete-service` | Admin | Complete & generate QR |
| POST | `/api/bookings/:id/process-payment` | User | Pay with QR scan |
| GET | `/api/bookings/:id/tracking` | User | Get live tracking info |

## Live Tracking Details

### How It Works:
1. When admin starts service → Location saved to `adminTrackingInfo.currentLocation`
2. Admin's location updated periodically (real-time or intervals)
3. User sees admin location on map with:
   - Purple marker (admin)
   - Blue marker (venue)
   - Route between them
   - ETA display

### Map Display:
- **Venue Location**: From booking's `venueLocation.coordinates`
- **Admin Location**: From booking's `adminTrackingInfo.currentLocation`
- **Status**: Shows current tracking status
- **Updates Timeline**: All status updates displayed

## Payment Flow

### QR Code Structure:
```json
{
  "bookingId": "booking_id_here",
  "amount": 8100,
  "timestamp": 1234567890
}
```

### Payment Process:
1. Admin completes service → QR generated
2. User receives notification
3. User opens booking in app
4. User scans QR code (in-app scanner)
5. App verifies QR data
6. Payment processed
7. Admin receives payment confirmation

## Security Features

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: 
   - Users can only access their own bookings
   - Admins can only manage bookings they created
3. **QR Validation**: 
   - Booking ID verification
   - Timestamp check (prevent replay)
4. **Payment Verification**: QR data must match booking details

## Next Steps to Implement

1. ✅ Backend routes and controllers created
2. ✅ Frontend booking modal implemented
3. ⏳ Admin dashboard booking management
4. ⏳ Real-time location updates (WebSocket)
5. ⏳ QR code scanner component
6. ⏳ Payment processing integration
7. ⏳ Notification system

## Files Created/Modified

### Backend:
- ✅ `/src/controllers/eventBookingController.ts` (NEW)
- ✅ `/src/routes/eventBookingRoutes.ts` (NEW)
- ✅ `/src/server.ts` (MODIFIED - added route)
- ✅ `/src/models/Booking.ts` (Already has required fields)

### Frontend:
- ✅ `/src/app/events/[id]/page.tsx` (MODIFIED - added booking modal)
- ✅ `/src/services/api.ts` (MODIFIED - added booking APIs)

## Testing the Flow

1. **Book Event**:
   ```
   http://localhost:3000/events/{event_id}
   Click "Book This Event"
   Fill form and submit
   ```

2. **Accept Booking** (Admin):
   ```
   PUT http://localhost:5000/api/bookings/{booking_id}/accept
   Authorization: Bearer {admin_token}
   ```

3. **Start Service** (Admin):
   ```
   PUT http://localhost:5000/api/bookings/{booking_id}/start-service
   {
     "location": { "lat": 40.7128, "lng": -74.0060 }
   }
   ```

4. **Complete & Generate QR** (Admin):
   ```
   PUT http://localhost:5000/api/bookings/{booking_id}/complete-service
   Returns: { booking, qrCode: "data:image/png;base64..." }
   ```

5. **Process Payment** (User):
   ```
   POST http://localhost:5000/api/bookings/{booking_id}/process-payment
   {
     "qrData": "{\"bookingId\":\"...\",\"amount\":8100,...}"
   }
   ```

## Status Tracking Timeline

```
1. CREATED (pending) → User books event
2. CONFIRMED (confirmed) → Admin accepts
3. EN_ROUTE (in_progress) → Admin starts service, tracking begins
4. ARRIVED (in_progress) → Admin reaches venue
5. COMPLETED (completed) → Service done, QR generated
6. PAID (completed, paid) → User pays via QR
```
