import express from 'express';
import { 
  getAdminStats,
  getAdminAnalytics,
  getTopVendors,
  getBundleSuggestionsAPI as getBundleSuggestionsForAdmin,
  getWeakServiceAlertsAPI as getWeakServiceAlertsForAdmin,
  getAllEventsForAdmin,
  getAdminBookings,
  assignVendorToService,
  getAllVendorAssignments,
  getAllServicesForAdmin
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Admin dashboard stats
router.route('/stats')
  .get(authenticate, authorize('admin'), getAdminStats);

// Admin analytics
router.route('/analytics')
  .get(authenticate, authorize('admin'), getAdminAnalytics);

// Top performing vendors
router.route('/vendors/top')
  .get(authenticate, authorize('admin'), getTopVendors);

// Bundle suggestions
router.route('/bundles/suggestions')
  .get(authenticate, authorize('admin'), getBundleSuggestionsForAdmin);

// Weak service alerts
router.route('/services/alerts')
  .get(authenticate, authorize('admin'), getWeakServiceAlertsForAdmin);

// Assign vendor to service
router.route('/services/:serviceId/assign-vendor')
  .post(authenticate, authorize('admin'), assignVendorToService);

// All events for admin
router.route('/events')
  .get(authenticate, authorize('admin'), getAllEventsForAdmin);

// Admin's bookings
router.route('/bookings')
  .get(authenticate, authorize('admin'), getAdminBookings);

// Get all vendor assignments
router.route('/vendor-assignments')
  .get(authenticate, authorize('admin'), getAllVendorAssignments);

// Get all services for admin
router.route('/services')
  .get(authenticate, authorize('admin'), getAllServicesForAdmin);

export default router;