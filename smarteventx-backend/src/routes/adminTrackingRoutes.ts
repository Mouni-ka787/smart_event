import express from 'express';
import {
  assignVendorToBooking,
  getBookingVendorAssignments,
  getVendorAssignmentTracking,
  updateAdminLocation,
  startAdminDelivery,
  markAdminArrived,
  getTrackableBookings
} from '../controllers/adminTrackingController';
import { authenticate as protect } from '../middleware/auth';

const router = express.Router();

// All routes require admin authentication
router.use(protect);

// Get trackable bookings (bookings that need vendor assignments)
router.get('/bookings', getTrackableBookings);

// Vendor assignment management
router.post('/bookings/:bookingId/assign-vendor', assignVendorToBooking);
router.get('/bookings/:bookingId/vendor-assignments', getBookingVendorAssignments);
router.get('/vendor-assignments/:assignmentId/tracking', getVendorAssignmentTracking);

// Admin's own location tracking (for users to see)
router.post('/bookings/:bookingId/my-location', updateAdminLocation);
router.post('/bookings/:bookingId/start-delivery', startAdminDelivery);
router.post('/bookings/:bookingId/mark-arrived', markAdminArrived);

export default router;