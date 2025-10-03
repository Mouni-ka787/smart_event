import express from 'express';
import { 
  getServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService,
  getServicesByVendor
} from '../controllers/serviceController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(authenticate, authorize('vendor', 'admin'), createService);

router.route('/:id')
  .get(getServiceById)
  .put(authenticate, authorize('vendor', 'admin'), updateService)
  .delete(authenticate, authorize('vendor', 'admin'), deleteService);

router.route('/vendor/:vendorId').get(getServicesByVendor);

export default router;