import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createServiceBooking,
  acceptServiceBooking,
  startServiceTracking,
  completeServiceBooking,
  processServicePayment
} from '../controllers/serviceBookingController';

const router = express.Router();

// Create service booking (User)
router.post('/', authenticate, createServiceBooking);

// Accept service booking (Vendor)
router.put('/:id/accept', authenticate, acceptServiceBooking);

// Start service tracking (Vendor)
router.put('/:id/start-tracking', authenticate, startServiceTracking);

// Complete service and generate QR (Vendor)
router.put('/:id/complete', authenticate, completeServiceBooking);

// Process payment with QR scan (User)
router.post('/:id/process-payment', authenticate, processServicePayment);

export default router;