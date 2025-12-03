import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createEventBooking,
  acceptBooking,
  startService,
  completeService,
  processPayment,
  getBookingTracking
} from '../controllers/eventBookingController';

const router = express.Router();

// Create event booking (User)
router.post('/', authenticate, createEventBooking);

// Accept booking (Admin)
router.put('/:id/accept', authenticate, acceptBooking);

// Start service / Start tracking (Admin)
router.put('/:id/start-service', authenticate, startService);

// Complete service / Generate QR (Admin)
router.put('/:id/complete-service', authenticate, completeService);

// Process payment with QR scan (User)
router.post('/:id/process-payment', authenticate, processPayment);

// Get booking tracking info (User)
router.get('/:id/tracking', authenticate, getBookingTracking);

export default router;