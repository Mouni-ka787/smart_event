import express from 'express';
import { 
  getVendorServices,
  getVendorById,
  getVendorStats,
  getVendorBookings,
  getServicePerformance,
  getPriceOptimization,
  getVendorMatchmaking,
  initializeVendorAccount,
  getAllVendors,
  getVendorEvents
} from '../controllers/vendorController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Private vendor routes (specific routes first)
router.route('/stats')
  .get(authenticate, authorize('vendor'), getVendorStats);

router.route('/bookings')
  .get(authenticate, authorize('vendor'), getVendorBookings);

router.route('/services')
  .get(authenticate, authorize('vendor'), getVendorServices);

router.route('/events')
  .get(authenticate, authorize('vendor'), getVendorEvents);

router.route('/performance')
  .get(authenticate, authorize('vendor'), getServicePerformance);

router.route('/pricing/suggestions')
  .get(authenticate, authorize('vendor'), getPriceOptimization);

router.route('/matchmaking')
  .get(authenticate, authorize('vendor'), getVendorMatchmaking);

router.route('/init')
  .post(authenticate, authorize('vendor'), initializeVendorAccount);

// Admin route to get all vendors
router.route('/')
  .get(authenticate, authorize('admin'), getAllVendors);

// Public vendor routes (generic routes last)
router.route('/:id')
  .get(getVendorById);

export default router;