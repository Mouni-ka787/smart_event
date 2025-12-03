import express from 'express';
import {
  getVendorAssignments,
  acceptAssignment,
  startVendorDelivery,
  updateVendorLocation,
  markVendorArrived,
  completeVendorDelivery
} from '../controllers/vendorTrackingController';
import { authenticate as protect } from '../middleware/auth';

const router = express.Router();

// All routes require vendor authentication
router.use(protect);

// Vendor assignment management
router.get('/my-assignments', getVendorAssignments);
router.put('/assignments/:assignmentId/accept', acceptAssignment);

// Vendor location tracking
router.post('/assignments/:assignmentId/start-delivery', startVendorDelivery);
router.post('/assignments/:assignmentId/location', updateVendorLocation);
router.post('/assignments/:assignmentId/mark-arrived', markVendorArrived);
router.post('/assignments/:assignmentId/complete', completeVendorDelivery);

export default router;
