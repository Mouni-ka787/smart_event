# Google Maps API Backend Integration Guide

## Overview
This document explains how Google Maps API has been integrated into the SmartEventX backend for accurate location tracking, geocoding, and ETA calculations.

## 📋 Prerequisites

### 1. Install Required Dependencies
```bash
cd smarteventx-backend
npm install axios
```

### 2. Environment Configuration
The Google Maps API key is already configured in `.env`:
```env
GOOGLE_MAPS_API_KEY=AIzaSyCVsRYLd5ZSmw6SuuNWRGLBgO_WeVN4fes
```

### 3. Enable Required APIs in Google Cloud Console
Make sure these APIs are enabled:
- ✅ Maps JavaScript API
- ✅ Geocoding API
- ✅ Distance Matrix API
- ✅ Directions API

## 📁 New Files Created

### 1. **src/services/googleMapsService.ts**
Core Google Maps API service with the following functions:

#### **geocodeAddress(address: string)**
- Converts address to coordinates (lat/lng)
- Returns: `Promise<Coordinates | null>`

#### **reverseGeocode(lat: number, lng: number)**
- Converts coordinates to address
- Returns: `Promise<string | null>`

#### **getDistanceMatrix(origin: Coordinates, destination: Coordinates)**
- Gets driving distance and duration between two points
- Returns: `Promise<DistanceMatrixResult | null>`
- Result includes: distance (meters), duration (seconds), status

#### **getDirections(origin: Coordinates, destination: Coordinates)**
- Gets full route information with polyline
- Returns: `Promise<DirectionsResult | null>`
- Result includes: distance, duration, polyline, steps

#### **calculateETAWithTraffic(origin: Coordinates, destination: Coordinates)**
- Calculates ETA considering current traffic
- Returns: `Promise<Date | null>`

## 📝 Modified Files

### 1. **src/utils/locationUtils.ts**
Enhanced with Google Maps API integration and fallback support:

#### New Functions:
- `calculateDistanceHaversine()` - Basic Haversine formula (fallback)
- `calculateDistance()` - **ASYNC** - Uses Google Maps API, falls back to Haversine
- `calculateDistanceSync()` - Synchronous version using only Haversine
- `calculateETASimple()` - Basic ETA calculation
- `calculateETA()` - **ASYNC** - Uses Google Maps API with traffic data
- `calculateETASync()` - Synchronous version with simple calculation

### 2. **src/controllers/adminTrackingController.ts**
Updated to use Google Maps API for admin location tracking:

#### Modified Functions:
- `updateAdminLocation()` - Now uses **async** `calculateETA()` for accurate ETA with traffic
- Provides real-time location updates to users tracking admin

### 3. **src/controllers/vendorTrackingController.ts**
Updated to use Google Maps API for vendor location tracking:

#### Modified Functions:
- `updateVendorLocation()` - Now uses **async** `calculateETA()` for accurate vendor ETA
- Admin can track vendors with real-time traffic-aware ETAs

### 4. **src/controllers/locationController.ts**
Legacy controller updated to use synchronous functions:

#### Modified Functions:
- `updateVendorLocation()` - Uses `calculateDistanceSync()` and `calculateETASync()`
- Maintains backward compatibility

## 🔄 API Usage Flow

### For Admin Tracking (User → Admin)
```typescript
// When admin updates location
POST /api/admin/bookings/:bookingId/my-location
{
  "lat": 40.7128,
  "lng": -74.0060,
  "speed": 15,
  "bearing": 180
}

// Backend automatically:
1. Calls getDistanceMatrix(adminCoords, venueCoords)
2. Gets real-time driving duration with traffic
3. Calculates accurate ETA
4. Sends WebSocket update to user
```

### For Vendor Tracking (Admin → Vendor)
```typescript
// When vendor updates location
POST /api/vendors/assignments/:assignmentId/location
{
  "lat": 40.7580,
  "lng": -73.9855,
  "speed": 12,
  "bearing": 90
}

// Backend automatically:
1. Calls getDistanceMatrix(vendorCoords, deliveryCoords)
2. Gets real-time driving duration
3. Calculates ETA
4. Sends WebSocket update to admin
```

## 🚀 Installation & Testing

### Step 1: Install Dependencies
```bash
cd smarteventx-backend
npm install axios
```

### Step 2: Restart Backend Server
```bash
npm run dev
```

### Step 3: Verify Integration
The server should start without errors. Check console for:
```
✅ Google Maps API key configured
✅ Server running on port 5000
```

### Step 4: Test API Endpoints

#### Test Admin Location Update:
```bash
POST http://localhost:5000/api/admin/bookings/:bookingId/my-location
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "lat": 40.7128,
  "lng": -74.0060,
  "speed": 15
}
```

#### Test Vendor Location Update:
```bash
POST http://localhost:5000/api/vendors/assignments/:assignmentId/location
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "lat": 40.7580,
  "lng": -73.9855,
  "speed": 12
}
```

## 📊 API Response Examples

### Successful Location Update:
```json
{
  "message": "Admin location updated successfully",
  "data": {
    "lat": 40.7128,
    "lng": -74.0060,
    "etaSeconds": 1200
  }
}
```

### With Traffic-Aware ETA:
```json
{
  "message": "Location updated successfully",
  "data": {
    "lat": 40.7128,
    "lng": -74.0060,
    "etaSeconds": 1450,
    "note": "ETA includes current traffic conditions"
  }
}
```

## 🔍 Fallback Mechanism

The system uses a **graceful fallback** approach:

1. **Primary**: Google Maps Distance Matrix API (with traffic)
2. **Fallback**: Haversine formula (straight-line distance)

### When Fallback Occurs:
- API key not configured
- API quota exceeded
- Network error
- API service unavailable

### Console Warning:
```
⚠️ Google Maps API unavailable, using Haversine formula
```

## 🛡️ Error Handling

All Google Maps functions include comprehensive error handling:

```typescript
try {
  const distance = await getDistanceMatrix(origin, destination);
  // Use Google Maps data
} catch (error) {
  console.warn('Google Maps API unavailable, using fallback');
  // Use Haversine formula
}
```

## 📈 Performance Considerations

### API Call Optimization:
1. **Caching**: Consider implementing Redis cache for frequent routes
2. **Rate Limiting**: Google Maps API has daily quotas
3. **Batch Requests**: Use Distance Matrix for multiple destinations
4. **WebSocket**: Real-time updates reduce API calls

### Recommended Caching Strategy:
```typescript
// Cache distance/duration for same origin-destination pairs
const cacheKey = `${origin.lat},${origin.lng}:${dest.lat},${dest.lng}`;
// TTL: 5-10 minutes (traffic changes)
```

## 🔐 Security Best Practices

1. **Never expose backend API key to frontend**
2. **Use API key restrictions in Google Cloud Console**:
   - IP restrictions for backend server
   - API restrictions (only Distance Matrix, Geocoding, Directions)
3. **Monitor API usage** in Google Cloud Console
4. **Set up billing alerts** to prevent unexpected charges

## 📊 Google Maps API Quotas

### Free Tier:
- **Geocoding**: 40,000 requests/month free
- **Distance Matrix**: $5 per 1000 requests (first $200/month free)
- **Directions**: $5 per 1000 requests (first $200/month free)

### Monitoring Usage:
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" → "Dashboard"
3. Select your API
4. View usage metrics

## 🐛 Troubleshooting

### Error: "Google Maps API key not configured"
**Solution**: Check `.env` file has `GOOGLE_MAPS_API_KEY`

### Error: "Request denied"
**Solution**: 
1. Check API is enabled in Google Cloud Console
2. Verify billing is enabled
3. Check API key restrictions

### Error: "OVER_QUERY_LIMIT"
**Solution**:
1. Implement caching
2. Reduce update frequency
3. Upgrade Google Cloud plan

### Fallback Always Triggers
**Solution**:
1. Verify API key is correct
2. Check network connectivity
3. Verify APIs are enabled
4. Check billing status

## 📚 Additional Resources

- [Google Maps Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix)
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Google Maps Directions API](https://developers.google.com/maps/documentation/directions)

## ✅ Integration Checklist

- [x] Created `googleMapsService.ts` with all API functions
- [x] Updated `locationUtils.ts` with async/sync functions
- [x] Updated `adminTrackingController.ts` for admin tracking
- [x] Updated `vendorTrackingController.ts` for vendor tracking
- [x] Updated `locationController.ts` for backward compatibility
- [ ] Install axios dependency: `npm install axios`
- [ ] Restart backend server
- [ ] Test admin location updates
- [ ] Test vendor location updates
- [ ] Monitor API usage
- [ ] Set up billing alerts

## 🎯 Next Steps

1. **Install axios**: `npm install axios`
2. **Restart server**: `npm run dev`
3. **Test endpoints** with Postman/Thunder Client
4. **Monitor console** for Google Maps API logs
5. **Check WebSocket** real-time updates
6. **Verify frontend** displays accurate ETAs

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
**Status**: ✅ Ready for testing after axios installation
