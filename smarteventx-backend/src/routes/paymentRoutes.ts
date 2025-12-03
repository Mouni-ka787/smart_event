import express from 'express';
import { 
  createPayPalOrder, 
  capturePayPalPayment
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// @desc    Create PayPal order
// @route   POST /api/payments/paypal/create
// @access  Private
router.post('/paypal/create', authenticate, createPayPalOrder);

// @desc    Capture PayPal payment
// @route   POST /api/payments/paypal/capture
// @access  Private
router.post('/paypal/capture', authenticate, capturePayPalPayment);

export default router;