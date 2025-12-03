import express from 'express';
import { 
  updateVendorLocation,
  updateAssignmentStatus,
  getBookingTracking
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

export default router;