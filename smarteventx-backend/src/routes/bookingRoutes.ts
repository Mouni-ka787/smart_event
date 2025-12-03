import express from 'express';
import { 
  createBooking,
  getUserBookings,
  getVendorBookings,
  getBookingById,
  updateBookingStatus,
  updateTrackingInfo,
  releasePayment,
  getAdminTracking,
  getUserTrackableBookings,
  processPayment
} from '../controllers/bookingController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .post(authenticate, authorize('user', 'admin'), createBooking);

router.route('/user')
  .get(authenticate, authorize('user'), getUserBookings);

router.route('/vendor')
  .get(authenticate, authorize('vendor'), getVendorBookings);

router.route('/:id')
  .get(authenticate, getBookingById);

router.route('/:id/status')
  .put(authenticate, updateBookingStatus);

router.route('/:id/tracking')
  .put(authenticate, authorize('vendor'), updateTrackingInfo);

router.route('/:id/release-payment')
  .put(authenticate, authorize('admin'), releasePayment);

router.route('/:id/process-payment')
  .post(authenticate, authorize('user'), processPayment);

// New routes for tracking
router.route('/user/trackable')
  .get(authenticate, authorize('user'), getUserTrackableBookings);

router.route('/:id/admin-tracking')
  .get(authenticate, getAdminTracking);

export default router;