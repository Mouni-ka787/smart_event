import express from 'express';
import { 
  getVendorServices,
  getVendorById,
  getVendorStats,
  getVendorBookings,
  getServicePerformance,
  getPriceOptimization,
  getVendorMatchmaking
} from '../controllers/vendorController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public vendor routes
router.route('/:id')
  .get(getVendorById);

router.route('/services/:vendorId')
  .get(getVendorServices);

// Private vendor routes
router.route('/stats')
  .get(authenticate, authorize('vendor'), getVendorStats);

router.route('/bookings')
  .get(authenticate, authorize('vendor'), getVendorBookings);

router.route('/performance')
  .get(authenticate, authorize('vendor'), getServicePerformance);

router.route('/pricing/suggestions')
  .get(authenticate, authorize('vendor'), getPriceOptimization);

router.route('/matchmaking')
  .get(authenticate, authorize('vendor'), getVendorMatchmaking);

export default router;