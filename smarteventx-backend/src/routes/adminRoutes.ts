import express from 'express';
import { 
  getAdminStats,
  getAdminAnalytics,
  getTopVendors,
  getBundleSuggestionsForAdmin,
  getWeakServiceAlertsForAdmin,
  getTrendingServicesForAdmin
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

// Trending services
router.route('/services/trending')
  .get(authenticate, authorize('admin'), getTrendingServicesForAdmin);

export default router;