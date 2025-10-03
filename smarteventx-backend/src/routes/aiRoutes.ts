import express from 'express';
import { 
  getPersonalizedServiceRecommendations,
  getHistoryBasedRecommendations,
  getTrendingServiceRecommendations,
  getPriceOptimization
} from '../controllers/aiController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// User recommendations
router.route('/recommendations/personalized')
  .get(authenticate, authorize('user'), getPersonalizedServiceRecommendations);

router.route('/recommendations/history')
  .get(authenticate, authorize('user'), getHistoryBasedRecommendations);

// Admin recommendations
router.route('/recommendations/trending')
  .get(authenticate, authorize('admin'), getTrendingServiceRecommendations);

// Vendor pricing suggestions
router.route('/pricing/suggestions')
  .get(authenticate, authorize('vendor'), getPriceOptimization);

export default router;