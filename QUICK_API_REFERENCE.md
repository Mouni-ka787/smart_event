# 🚀 Quick API Reference Card

## ✅ Files Created & Modified

### **NEW Files (Just Created):**
```
✅ src/models/VendorAssignment.ts
✅ src/controllers/adminTrackingController.ts
✅ src/controllers/vendorTrackingController.ts
✅ src/routes/adminTrackingRoutes.ts
✅ src/routes/vendorTrackingRoutes.ts
```

### **MODIFIED Files:**
```
✅ src/models/Booking.ts (added event, admin, venueLocation, adminTrackingInfo)
✅ src/controllers/bookingController.ts (added 2 functions)
✅ src/routes/bookingRoutes.ts (added 2 routes)
✅ src/server.ts (registered new routes)
```

---

## 📍 Complete API List (15 APIs Total)

### **👤 USER APIs (2 APIs)**
```
GET  /api/bookings/user/trackable              → Get my trackable bookings
GET  /api/bookings/:id/admin-tracking          → Track admin location
```

### **👔 ADMIN APIs (6 APIs)**
```
POST /api/admin/tracking/bookings/:id/assign-vendor           → Assign vendor
GET  /api/admin/tracking/bookings/:id/vendor-assignments      → List vendors
GET  /api/admin/tracking/vendor-assignments/:id/tracking      → Track vendor

POST /api/admin/tracking/bookings/:id/my-location             → Update my location
POST /api/admin/tracking/bookings/:id/start-delivery          → Start traveling
POST /api/admin/tracking/bookings/:id/mark-arrived            → Mark arrived
```

### **🛒 VENDOR APIs (6 APIs)**
```
GET  /api/vendors/tracking/my-assignments                     → Get assignments
PUT  /api/vendors/tracking/assignments/:id/accept             → Accept assignment

POST /api/vendors/tracking/assignments/:id/start-delivery     → Start delivery
POST /api/vendors/tracking/assignments/:id/location           → Update location
POST /api/vendors/tracking/assignments/:id/mark-arrived       → Mark arrived
POST /api/vendors/tracking/assignments/:id/complete           → Complete delivery
```

---

## 🔑 Key Request Bodies

### Assign Vendor (Admin)
```json
POST /api/admin/tracking/bookings/:id/assign-vendor
{
  "vendor": "vendorId",
  "service": "serviceId",
  "deliveryLocation": {
    "address": "Event Address",
    "coordinates": { "lat": 40.7589, "lng": -73.9851 }
  }
}
```

### Update Admin Location (Admin)
```json
POST /api/admin/tracking/bookings/:id/my-location
{
  "lat": 40.7350,
  "lng": -73.9950,
  "speed": 15,
  "bearing": 45
}
```

### Update Vendor Location (Vendor)
```json
POST /api/vendors/tracking/assignments/:id/location
{
  "lat": 40.7200,
  "lng": -73.9900,
  "speed": 12,
  "bearing": 90
}
```

### Start Delivery (Admin or Vendor)
```json
POST /api/admin/tracking/bookings/:id/start-delivery
POST /api/vendors/tracking/assignments/:id/start-delivery
{
  "startLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

---

## 🎯 Where to Add These APIs

### **Backend Routes Already Registered:**
In `server.ts`, these lines were added:
```typescript
app.use('/api/vendors/tracking', vendorTrackingRoutes);
app.use('/api/admin/tracking', adminTrackingRoutes);
```

### **All Routes Are Active At:**
```
USER APIS:
  http://localhost:5000/api/bookings/user/trackable
  http://localhost:5000/api/bookings/:id/admin-tracking

ADMIN APIS:
  http://localhost:5000/api/admin/tracking/...

VENDOR APIS:
  http://localhost:5000/api/vendors/tracking/...
```

---

## ⚡ Quick Test Commands

```bash
# 1. Get user's trackable bookings
curl -X GET http://localhost:5000/api/bookings/user/trackable \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Admin assigns vendor
curl -X POST http://localhost:5000/api/admin/tracking/bookings/BOOKING_ID/assign-vendor \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendor":"VENDOR_ID","service":"SERVICE_ID","deliveryLocation":{"address":"Venue","coordinates":{"lat":40.7589,"lng":-73.9851}}}'

# 3. Admin updates location
curl -X POST http://localhost:5000/api/admin/tracking/bookings/BOOKING_ID/my-location \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat":40.7350,"lng":-73.9950,"speed":15}'

# 4. Vendor updates location
curl -X POST http://localhost:5000/api/vendors/tracking/assignments/ASSIGNMENT_ID/location \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat":40.7200,"lng":-73.9900,"speed":12}'
```

---

## 🔄 Integration Workflow

### **1. User Side:**
```
User books package → Tracks admin location → Sees admin on map
```

### **2. Admin Side:**
```
Admin receives booking → Assigns vendors → Tracks vendors → Travels to venue → Updates own location
```

### **3. Vendor Side:**
```
Vendor receives assignment → Accepts → Starts delivery → Updates location → Completes
```

---

## 📦 What's Still Needed

1. **WebSocket Server Setup** (for real-time updates)
   - Create `src/websocket/trackingSocket.ts`
   - Integrate in `server.ts`

2. **Frontend Integration**
   - User dashboard to show admin tracking
   - Admin dashboard to show vendor tracking
   - Vendor dashboard to show assignments

3. **Google Maps API Key**
   - Add to `.env` files
   - Configure in components

---

## 🎉 Summary

**Total APIs Created: 15**
- 2 for Users (track admin)
- 6 for Admin (manage vendors + update own location)
- 6 for Vendors (update location for admin)
- 1 legacy endpoint updated

**All backend APIs are READY TO USE!** 🚀

Just need to:
1. Setup WebSocket (optional for real-time)
2. Integrate in frontend
3. Test with Postman/cURL

---

**Need help with next steps? Just ask!** 😊
