# Complete API List for Google Maps & Live Tracking Integration

## 📍 Overview
This document lists ALL 15 new tracking APIs created for the SmartEventX application, organized by user role and functionality.

---

## 🔵 USER APIs (2 APIs)
Users can track ADMIN location for their bookings

### 1. Get Admin Tracking Info
- **Endpoint**: `GET /api/bookings/:id/admin-tracking`
- **Access**: Private/User
- **File**: `smarteventx-backend/src/controllers/bookingController.ts`
- **Function**: `getAdminTracking`
- **Description**: Get admin's current location and ETA for a booking
- **Response**:
```json
{
  "adminTrackingInfo": {
    "currentLocation": {
      "type": "Point",
      "coordinates": [-74.0060, 40.7128]
    },
    "estimatedArrival": "2024-01-20T15:30:00.000Z",
    "status": "EN_ROUTE",
    "updates": [...]
  },
  "admin": {
    "name": "John Admin",
    "email": "admin@example.com",
    "phoneNumber": "+1234567890"
  },
  "venueLocation": {
    "address": "123 Event St, New York, NY",
    "coordinates": { "lat": 40.7128, "lng": -74.0060 }
  }
}
```

### 2. Get User's Trackable Bookings
- **Endpoint**: `GET /api/bookings/my-trackable`
- **Access**: Private/User
- **File**: `smarteventx-backend/src/controllers/bookingController.ts`
- **Function**: `getUserTrackableBookings`
- **Description**: Get all user's bookings that can be tracked (confirmed/in_progress)
- **Response**:
```json
[
  {
    "_id": "booking123",
    "user": "user123",
    "admin": {
      "name": "John Admin",
      "email": "admin@example.com"
    },
    "event": {
      "name": "Wedding Package",
      "category": "Wedding"
    },
    "status": "in_progress",
    "adminTrackingInfo": {...}
  }
]
```

---

## 🟢 ADMIN APIs (6 APIs)
Admin manages vendors and updates own location for users to track

### 1. Assign Vendor to Booking
- **Endpoint**: `POST /api/admin/bookings/:bookingId/assign-vendor`
- **Access**: Private/Admin
- **File**: `smarteventx-backend/src/controllers/adminTrackingController.ts`
- **Function**: `assignVendorToBooking`
- **Description**: Admin assigns a vendor to provide service for a booking
- **Request Body**:
```json
{
  "vendor": "vendor_user_id",
  "service": "service_id",
  "deliveryLocation": {
    "address": "123 Venue St, NY",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }
}
```

### 2. Get Booking Vendor Assignments
- **Endpoint**: `GET /api/admin/bookings/:bookingId/vendor-assignments`
- **Access**: Private/Admin
- **File**: `smarteventx-backend/src/controllers/adminTrackingController.ts`
- **Function**: `getBookingVendorAssignments`
- **Description**: Get all vendors assigned to a booking
- **Response**:
```json
[
  {
    "_id": "assignment123",
    "vendor": {
      "name": "Catering Vendor",
      "phoneNumber": "+1234567890"
    },
    "service": {
      "name": "Wedding Catering",
      "category": "Food & Beverage"
    },
    "status": "EN_ROUTE",
    "trackingInfo": {...}
  }
]
```

### 3. Get Vendor Assignment Tracking
- **Endpoint**: `GET /api/admin/vendor-assignments/:assignmentId/tracking`
- **Access**: Private/Admin
- **File**: `smarteventx-backend/src/controllers/adminTrackingController.ts`
- **Function**: `getVendorAssignmentTracking`
- **Description**: Track specific vendor's location and status
- **Response**:
```json
{
  "trackingInfo": {
    "currentLocation": {
      "type": "Point",
      "coordinates": [-73.9855, 40.7580]
    },
    "estimatedArrival": "2024-01-20T14:30:00.000Z",
    "updates": [...]
  }
}
```

### 4. Update Admin Location
- **Endpoint**: `POST /api/admin/bookings/:bookingId/my-location`
- **Access**: Private/Admin
- **File**: `smarteventx-backend/src/controllers/adminTrackingController.ts`
- **Function**: `updateAdminLocation`
- **Description**: Admin updates own location (users see this in real-time)
- **Request Body**:
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "speed": 15,
  "bearing": 180
}
```
- **Uses**: Google Maps Distance Matrix API for accurate ETA with traffic

### 5. Start Admin Delivery
- **Endpoint**: `POST /api/admin/bookings/:bookingId/start-delivery`
- **Access**: Private/Admin
- **File**: `smarteventx-backend/src/controllers/adminTrackingController.ts`
- **Function**: `startAdminDelivery`
- **Description**: Admin starts traveling to event venue
- **Request Body**:
```json
{
  "startLocation": {
    "lat": 40.7000,
    "lng": -74.0100
  }
}
```

### 6. Mark Admin Arrived
- **Endpoint**: `POST /api/admin/bookings/:bookingId/mark-arrived`
- **Access**: Private/Admin
- **File**: `smarteventx-backend/src/controllers/adminTrackingController.ts`
- **Function**: `markAdminArrived`
- **Description**: Admin marks arrival at venue
- **Response**:
```json
{
  "message": "Marked as arrived successfully",
  "status": "ARRIVED"
}
```

---

## 🟡 VENDOR APIs (6 APIs)
Vendors update location for admin to track

### 1. Get Vendor Assignments
- **Endpoint**: `GET /api/vendors/my-assignments`
- **Access**: Private/Vendor
- **File**: `smarteventx-backend/src/controllers/vendorTrackingController.ts`
- **Function**: `getVendorAssignments`
- **Description**: Get all assignments for the vendor
- **Response**:
```json
[
  {
    "_id": "assignment123",
    "booking": {
      "eventName": "Wedding",
      "eventDate": "2024-01-25"
    },
    "admin": {
      "name": "John Admin",
      "phoneNumber": "+1234567890"
    },
    "service": {
      "name": "Catering",
      "category": "Food & Beverage"
    },
    "status": "PENDING",
    "deliveryLocation": {...}
  }
]
```

### 2. Accept Assignment
- **Endpoint**: `PUT /api/vendors/assignments/:assignmentId/accept`
- **Access**: Private/Vendor
- **File**: `smarteventx-backend/src/controllers/vendorTrackingController.ts`
- **Function**: `acceptAssignment`
- **Description**: Vendor accepts the assignment
- **Response**:
```json
{
  "message": "Assignment accepted successfully",
  "assignment": {...}
}
```

### 3. Start Vendor Delivery
- **Endpoint**: `POST /api/vendors/assignments/:assignmentId/start-delivery`
- **Access**: Private/Vendor
- **File**: `smarteventx-backend/src/controllers/vendorTrackingController.ts`
- **Function**: `startVendorDelivery`
- **Description**: Vendor starts traveling to delivery location
- **Request Body**:
```json
{
  "startLocation": {
    "lat": 40.7580,
    "lng": -73.9855
  }
}
```

### 4. Update Vendor Location
- **Endpoint**: `POST /api/vendors/assignments/:assignmentId/location`
- **Access**: Private/Vendor
- **File**: `smarteventx-backend/src/controllers/vendorTrackingController.ts`
- **Function**: `updateVendorLocation`
- **Description**: Vendor updates location (only admin sees this)
- **Request Body**:
```json
{
  "lat": 40.7580,
  "lng": -73.9855,
  "speed": 12,
  "bearing": 90
}
```
- **Uses**: Google Maps Distance Matrix API for accurate ETA

### 5. Mark Vendor Arrived
- **Endpoint**: `POST /api/vendors/assignments/:assignmentId/mark-arrived`
- **Access**: Private/Vendor
- **File**: `smarteventx-backend/src/controllers/vendorTrackingController.ts`
- **Function**: `markVendorArrived`
- **Description**: Vendor marks arrival at delivery location
- **Response**:
```json
{
  "message": "Marked as arrived successfully",
  "status": "ARRIVED"
}
```

### 6. Complete Vendor Delivery
- **Endpoint**: `POST /api/vendors/assignments/:assignmentId/complete`
- **Access**: Private/Vendor
- **File**: `smarteventx-backend/src/controllers/vendorTrackingController.ts`
- **Function**: `completeVendorDelivery`
- **Description**: Vendor marks delivery as completed
- **Response**:
```json
{
  "message": "Delivery completed successfully",
  "status": "COMPLETED"
}
```

---

## 📁 File Locations Summary

### Backend Files Created/Modified:

#### **Models**
1. `smarteventx-backend/src/models/VendorAssignment.ts` - NEW
   - Tracks vendor assignments for bookings

2. `smarteventx-backend/src/models/Booking.ts` - MODIFIED
   - Added: `event`, `admin`, `venueLocation`, `adminTrackingInfo`

#### **Controllers**
3. `smarteventx-backend/src/controllers/adminTrackingController.ts` - NEW
   - 6 admin tracking functions

4. `smarteventx-backend/src/controllers/vendorTrackingController.ts` - NEW
   - 6 vendor tracking functions

5. `smarteventx-backend/src/controllers/bookingController.ts` - MODIFIED
   - Added: `getAdminTracking`, `getUserTrackableBookings`

6. `smarteventx-backend/src/controllers/locationController.ts` - MODIFIED
   - Updated to use Google Maps API

#### **Routes**
7. `smarteventx-backend/src/routes/adminTrackingRoutes.ts` - NEW
   - Admin tracking routes

8. `smarteventx-backend/src/routes/vendorTrackingRoutes.ts` - NEW
   - Vendor tracking routes

9. `smarteventx-backend/src/routes/bookingRoutes.ts` - MODIFIED
   - Added user tracking routes

#### **Services & Utilities**
10. `smarteventx-backend/src/services/googleMapsService.ts` - NEW
    - Google Maps API integration
    - Functions: geocoding, distance matrix, directions, ETA

11. `smarteventx-backend/src/utils/locationUtils.ts` - MODIFIED
    - Enhanced with async/sync functions
    - Google Maps API with Haversine fallback

#### **Server Configuration**
12. `smarteventx-backend/src/server.ts` - MODIFIED
    - Registered admin and vendor tracking routes

13. `smarteventx-backend/.env` - MODIFIED
    - Added: `GOOGLE_MAPS_API_KEY=AIzaSyCVsRYLd5ZSmw6SuuNWRGLBgO_WeVN4fes`

---

## 🔄 WebSocket Real-Time Events

### Admin Location Updates (Users receive):
- **Event**: `admin:location:update`
- **Room**: `booking:${bookingId}:admin`
- **Data**:
```json
{
  "bookingId": "booking123",
  "lat": 40.7128,
  "lng": -74.0060,
  "speed": 15,
  "bearing": 180,
  "etaSeconds": 1200
}
```

### Admin Status Updates (Users receive):
- **Event**: `admin:status:update`
- **Room**: `booking:${bookingId}:admin`
- **Data**:
```json
{
  "bookingId": "booking123",
  "status": "EN_ROUTE"
}
```

### Vendor Location Updates (Admin receives):
- **Event**: `vendor:location:update`
- **Room**: `vendor:${assignmentId}`
- **Data**:
```json
{
  "assignmentId": "assignment123",
  "lat": 40.7580,
  "lng": -73.9855,
  "speed": 12,
  "bearing": 90,
  "etaSeconds": 900
}
```

### Vendor Status Updates (Admin receives):
- **Event**: `vendor:status:update`
- **Room**: `vendor:${assignmentId}`
- **Data**:
```json
{
  "assignmentId": "assignment123",
  "status": "ARRIVED"
}
```

---

## 🚀 Testing Guide

### 1. Test User Tracking Admin
```bash
# Get trackable bookings
GET http://localhost:5000/api/bookings/my-trackable
Authorization: Bearer <user_token>

# Get admin tracking for specific booking
GET http://localhost:5000/api/bookings/booking123/admin-tracking
Authorization: Bearer <user_token>
```

### 2. Test Admin Managing Vendors
```bash
# Assign vendor to booking
POST http://localhost:5000/api/admin/bookings/booking123/assign-vendor
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "vendor": "vendor_id",
  "service": "service_id",
  "deliveryLocation": {
    "address": "123 Venue St",
    "coordinates": { "lat": 40.7128, "lng": -74.0060 }
  }
}

# Track vendor
GET http://localhost:5000/api/admin/vendor-assignments/assignment123/tracking
Authorization: Bearer <admin_token>
```

### 3. Test Admin Location Updates
```bash
# Start delivery
POST http://localhost:5000/api/admin/bookings/booking123/start-delivery
Authorization: Bearer <admin_token>
{
  "startLocation": { "lat": 40.7000, "lng": -74.0100 }
}

# Update location
POST http://localhost:5000/api/admin/bookings/booking123/my-location
Authorization: Bearer <admin_token>
{
  "lat": 40.7128,
  "lng": -74.0060,
  "speed": 15
}

# Mark arrived
POST http://localhost:5000/api/admin/bookings/booking123/mark-arrived
Authorization: Bearer <admin_token>
```

### 4. Test Vendor Workflow
```bash
# Get assignments
GET http://localhost:5000/api/vendors/my-assignments
Authorization: Bearer <vendor_token>

# Accept assignment
PUT http://localhost:5000/api/vendors/assignments/assignment123/accept
Authorization: Bearer <vendor_token>

# Start delivery
POST http://localhost:5000/api/vendors/assignments/assignment123/start-delivery
Authorization: Bearer <vendor_token>
{
  "startLocation": { "lat": 40.7580, "lng": -73.9855 }
}

# Update location
POST http://localhost:5000/api/vendors/assignments/assignment123/location
Authorization: Bearer <vendor_token>
{
  "lat": 40.7600,
  "lng": -73.9800,
  "speed": 12
}

# Mark arrived
POST http://localhost:5000/api/vendors/assignments/assignment123/mark-arrived
Authorization: Bearer <vendor_token>

# Complete delivery
POST http://localhost:5000/api/vendors/assignments/assignment123/complete
Authorization: Bearer <vendor_token>
```

---

## ✅ Implementation Checklist

- [x] Created VendorAssignment model
- [x] Created admin tracking controller (6 APIs)
- [x] Created vendor tracking controller (6 APIs)
- [x] Created user tracking APIs (2 APIs)
- [x] Updated Booking model
- [x] Created Google Maps service
- [x] Updated location utilities
- [x] Registered all routes in server.ts
- [x] Configured Google Maps API keys
- [x] Installed axios dependency
- [ ] Restart backend server
- [ ] Test all 15 APIs
- [ ] Verify WebSocket events
- [ ] Test Google Maps integration
- [ ] Monitor API usage

---

**Total APIs**: 15 (2 User + 6 Admin + 6 Vendor + 1 Legacy)
**Google Maps Integration**: ✅ Complete
**WebSocket Support**: ✅ Real-time updates
**Status**: ✅ Ready for testing

---

Created: 2025-11-20
