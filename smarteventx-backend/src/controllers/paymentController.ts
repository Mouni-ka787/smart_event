import { Request, Response } from 'express';
import { createPayPalOrder as createOrder, capturePayPalPayment as capturePayment } from '../services/paypalService';
import Booking from '../models/Booking';
import { Order } from '@paypal/paypal-server-sdk';

// @desc    Create PayPal order
// @route   POST /api/payments/paypal/create
// @access  Private
export const createPayPalOrder = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;

    // Get booking details with populated service
    const booking: any = await Booking.findById(bookingId).populate('service', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Get service name - handle both populated and non-populated cases
    let serviceName = 'Service';
    if (booking.service) {
      if (typeof booking.service === 'object' && booking.service.name) {
        // Populated service object
        serviceName = booking.service.name;
      }
    }

    // Create PayPal order
    const order = await createOrder(
      (booking.totalPrice || 0).toFixed(2),
      'USD',
      `Payment for ${serviceName}`,
      bookingId
    );

    res.json({
      orderId: order.id,
      bookingId: bookingId
    });
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ message: error.message || 'Failed to create PayPal order' });
  }
};

// @desc    Capture PayPal payment
// @route   POST /api/payments/paypal/capture
// @access  Private
export const capturePayPalPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    // Capture payment
    const capture = await capturePayment(orderId) as Order;

    // Update booking with payment details
    const purchaseUnits = capture.purchaseUnits;
    if (!purchaseUnits || purchaseUnits.length === 0) {
      throw new Error('No purchase units found in capture response');
    }
    
    const bookingId = purchaseUnits[0].referenceId;
    if (!bookingId) {
      throw new Error('No reference ID found in purchase unit');
    }
    
    const booking = await Booking.findById(bookingId);

    if (booking) {
      booking.paymentStatus = 'paid';
      booking.paypalOrderId = orderId;
      booking.paypalCaptureId = capture.id || '';
      await booking.save();
    }

    res.json({
      status: 'success',
      orderId: orderId,
      captureId: capture.id || '',
      bookingId: bookingId
    });
  } catch (error: any) {
    console.error('Error capturing PayPal payment:', error);
    res.status(500).json({ message: error.message || 'Failed to capture PayPal payment' });
  }
};